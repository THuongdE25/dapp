const { sql } = require("../config/db");

exports.getCakeById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(`
      SELECT * FROM cakes WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Lỗi getCakeById:", err);
    res.status(500).json({ message: "Lỗi server" });
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
        query += ` AND c.category = @category`;
      } else {
        query += ` AND category = @category`;
      }
      request.input("category", sql.NVarChar, category);
    }

    if (mucDo === "re") {
      if (sort === "top") {
        query += " AND c.price < 100";
      } else {
        query += " AND price < 100";
      }
    }

    if (mucDo === "trungbinh") {
      if (sort === "top") {
        query += " AND c.price BETWEEN 100 AND 200";
      } else {
        query += " AND price BETWEEN 100 AND 200";
      }
    }

    if (mucDo === "caocap") {
      if (sort === "top") {
        query += " AND c.price > 200";
      } else {
        query += " AND price > 200";
      }
    }

    if (sort === "top") {
      query += `
        GROUP BY c.id, c.name, c.description, c.price, c.image_url, c.created_at, c.category
        ORDER BY total_sold DESC
      `;
    } else {
      query += " ORDER BY created_at DESC";
    }

    console.log("category param:", category);
    console.log("SQL query:", query);

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi getCakes:", err);
    res.status(500).send(err.message);
  }
};
exports.createCake = async (req, res) => {
  try {
    const { name, price, image_url, category, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Thiếu tên hoặc giá" });
    }

    const blockchainPrice = ethers.parseEther(price.toString());

    const tx = await contract.addCake(name, blockchainPrice);
    const receipt = await tx.wait();

    const event = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e && e.name === "CakeAdded");

    if (!event) {
      return res.status(500).json({ message: "Không lấy được blockchain_id" });
    }

    const blockchainId = Number(event.args.cakeId);

    await sql.query`
      INSERT INTO cakes (name, price, image_url, category, description, blockchain_id, blockchain_price)
      VALUES (${name}, ${price}, ${image_url}, ${category}, ${description}, ${blockchainId}, ${price})
    `;

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      blockchain_id: blockchainId,
    });
  } catch (err) {
    console.error("Lỗi createCake:", err);
    res.status(500).json({ message: "Lỗi tạo sản phẩm" });
  }
};
exports.updateCake = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      image_url,
      category,
      description
    } = req.body;

    const result = await sql.query`
      UPDATE cakes
      SET
        name = ${name},
        price = ${price},
        image_url = ${image_url},
        category = ${category},
        description = ${description}
      WHERE id = ${id}
    `;

    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    console.error("updateCake error:", err);
    res.status(500).json({ message: "Lỗi cập nhật sản phẩm" });
  }
};
exports.deleteCake = async (req, res) => {
  try {
    const { id } = req.params;

    await sql.query`
      DELETE FROM cakes
      WHERE id = ${id}
    `;

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    console.error("deleteCake error:", err);
    res.status(500).json({ message: "Lỗi xóa sản phẩm" });
  }
};