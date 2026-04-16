const { sql } = require("../config/db");
const { ethers } = require("ethers");
const { getContractWithPrivateKey } = require("../utils/contract");

exports.getCakeById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(`
      SELECT * FROM cakes WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Cake not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("getCakeById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCakes = async (req, res) => {
  try {
    const { mucDo, sort, category } = req.query;

    let query = "";
    const request = new sql.Request();

    if (sort === "top") {
      query = `
        SELECT c.*, ISNULL(SUM(oi.quantity), 0) AS total_sold
        FROM cakes c
        LEFT JOIN order_items oi ON c.id = oi.cake_id
        WHERE 1=1
      `;
    } else {
      query = `
        SELECT * FROM cakes
        WHERE 1=1
      `;
    }

    if (category) {
      if (sort === "top") {
        query += " AND c.category = @category";
      } else {
        query += " AND category = @category";
      }
      request.input("category", sql.NVarChar, category);
    }

    if (mucDo === "re") {
      query += sort === "top" ? " AND c.price < 1" : " AND price < 1";
    }

    if (mucDo === "trungbinh") {
      query +=
        sort === "top"
          ? " AND c.price BETWEEN 1 AND 2"
          : " AND price BETWEEN 1 AND 2";
    }

    if (mucDo === "caocap") {
      query += sort === "top" ? " AND c.price > 2" : " AND price > 2";
    }

    if (sort === "top") {
      query += `
        GROUP BY c.id, c.name, c.description, c.price, c.image_url, c.created_at, c.category, c.blockchain_id, c.blockchain_price, c.quantity
        ORDER BY total_sold DESC
      `;
    } else {
      query += " ORDER BY created_at DESC";
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("getCakes error:", err);
    res.status(500).send(err.message);
  }
};

exports.createCake = async (req, res) => {
  try {
    const { name, price, image_url, category, description, quantity } = req.body;
    const parsedPrice = Number(price);
    const parsedQty = Number(quantity ?? 0);

    if (!name || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Invalid name or price" });
    }

    const request = new sql.Request();
    request.input("name", sql.NVarChar, name);
    request.input("price", sql.Decimal(10, 2), parsedPrice);
    request.input("image_url", sql.NVarChar, image_url || null);
    request.input("category", sql.NVarChar, category || null);
    request.input("description", sql.NVarChar(sql.MAX), description || null);
    request.input("quantity", sql.Int, Number.isFinite(parsedQty) && parsedQty >= 0 ? parsedQty : 0);

    const result = await request.query(`
      INSERT INTO cakes (name, price, image_url, category, description, quantity)
      OUTPUT INSERTED.*
      VALUES (@name, @price, @image_url, @category, @description, @quantity)
    `);

    return res.status(201).json({
      message: "Create cake success",
      cake: result.recordset[0],
    });
  } catch (err) {
    console.error("createCake error:", err);
    res.status(500).json({ message: "Create cake failed" });
  }
};

exports.updateCake = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image_url, category, description, quantity } = req.body;

    const parsedPrice = Number(price);
    const parsedQty = Number(quantity ?? 0);

    if (!name || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Invalid name or price" });
    }

    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("name", sql.NVarChar, name);
    request.input("price", sql.Decimal(10, 2), parsedPrice);
    request.input("image_url", sql.NVarChar, image_url || null);
    request.input("category", sql.NVarChar, category || null);
    request.input("description", sql.NVarChar(sql.MAX), description || null);
    request.input("quantity", sql.Int, Number.isFinite(parsedQty) && parsedQty >= 0 ? parsedQty : 0);

    await request.query(`
      UPDATE cakes
      SET
        name = @name,
        price = @price,
        image_url = @image_url,
        category = @category,
        description = @description,
        quantity = @quantity
      WHERE id = @id
    `);

    res.json({ message: "Update cake success" });
  } catch (err) {
    console.error("updateCake error:", err);
    res.status(500).json({ message: "Update cake failed" });
  }
};

exports.deleteCake = async (req, res) => {
  try {
    const { id } = req.params;

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    await request.query(`
      DELETE FROM cakes
      WHERE id = @id
    `);

    res.json({ message: "Delete cake success" });
  } catch (err) {
    console.error("deleteCake error:", err);
    res.status(500).json({ message: "Delete cake failed" });
  }
};

exports.syncCakesToBlockchain = async (req, res) => {
  try {
    const contract = getContractWithPrivateKey();

    const result = await sql.query(`
      SELECT id, name, price, quantity
      FROM cakes
      ORDER BY id ASC
    `);

    const cakes = result.recordset;
    const syncResults = [];

    for (const cake of cakes) {
      try {
        const unitPrice = Number(cake.price);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          throw new Error("Invalid price in database");
        }

        const blockchainPriceWei = ethers.parseEther(unitPrice.toString());
        const isAvailable = Number(cake.quantity ?? 0) > 0;

        const tx = await contract.upsertCake(
          Number(cake.id),
          String(cake.name ?? "Cake"),
          blockchainPriceWei,
          isAvailable,
        );
        const receipt = await tx.wait();

        const updateRequest = new sql.Request();
        updateRequest.input("id", sql.Int, Number(cake.id));
        updateRequest.input("blockchain_id", sql.Int, Number(cake.id));
        updateRequest.input("blockchain_price", sql.Decimal(18, 4), unitPrice);

        await updateRequest.query(`
          UPDATE cakes
          SET blockchain_id = @blockchain_id,
              blockchain_price = @blockchain_price
          WHERE id = @id
        `);

        syncResults.push({
          id: Number(cake.id),
          name: cake.name,
          status: "success",
          txHash: receipt.hash,
        });
      } catch (err) {
        syncResults.push({
          id: Number(cake.id),
          name: cake.name,
          status: "failed",
          error: err.shortMessage || err.message,
        });
      }
    }

    const okCount = syncResults.filter((x) => x.status === "success").length;

    return res.json({
      message: `Sync completed: ${okCount}/${syncResults.length} cakes`,
      results: syncResults,
    });
  } catch (err) {
    console.error("syncCakesToBlockchain error:", err);
    return res.status(500).json({
      message: err.message || "Sync failed",
    });
  }
};
