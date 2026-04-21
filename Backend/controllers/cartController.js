const { sql } = require("../config/db");

exports.getCart = async (req, res) => {
  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({ message: "Thiếu wallet" });
    }

    const request = new sql.Request();
    request.input("wallet", sql.NVarChar, wallet);

    const result = await request.query(`
      SELECT
        ci.id,
        ci.wallet_address,
        ci.cake_id,
        ci.quantity,
        ci.size,
        ci.created_at,
        ci.updated_at,
        c.name,
        c.price,
        c.image_url
      FROM cart_items ci
      JOIN cakes c ON ci.cake_id = c.id
      WHERE ci.wallet_address = @wallet
      ORDER BY ci.id DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi getCart:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { wallet_address, cake_id, quantity, size } = req.body;

    if (!wallet_address || !cake_id || !quantity) {
      return res.status(400).json({ message: "Thiếu dữ liệu cart" });
    }

    const checkRequest = new sql.Request();
    checkRequest.input("wallet_address", sql.NVarChar, wallet_address);
    checkRequest.input("cake_id", sql.Int, cake_id);
    checkRequest.input("size", sql.NVarChar, size || null);

    const checkResult = await checkRequest.query(`
      SELECT TOP 1 id, quantity
      FROM cart_items
      WHERE wallet_address = @wallet_address
        AND cake_id = @cake_id
        AND (
          (size = @size)
          OR (size IS NULL AND @size IS NULL)
        )
    `);

    if (checkResult.recordset.length > 0) {
      const existing = checkResult.recordset[0];

      const updateRequest = new sql.Request();
      updateRequest.input("id", sql.Int, existing.id);
      updateRequest.input("quantity", sql.Int, Number(existing.quantity) + Number(quantity));

      await updateRequest.query(`
        UPDATE cart_items
        SET quantity = @quantity,
            updated_at = GETDATE()
        WHERE id = @id
      `);

      return res.json({
        success: true,
        message: "Đã cập nhật số lượng trong giỏ"
      });
    }

    const insertRequest = new sql.Request();
    insertRequest.input("wallet_address", sql.NVarChar, wallet_address);
    insertRequest.input("cake_id", sql.Int, cake_id);
    insertRequest.input("quantity", sql.Int, quantity);
    insertRequest.input("size", sql.NVarChar, size || null);

    await insertRequest.query(`
      INSERT INTO cart_items (
        wallet_address,
        cake_id,
        quantity,
        size,
        created_at,
        updated_at
      )
      VALUES (
        @wallet_address,
        @cake_id,
        @quantity,
        @size,
        GETDATE(),
        GETDATE()
      )
    `);

    res.json({
      success: true,
      message: "Đã thêm vào giỏ hàng"
    });
  } catch (err) {
    console.error("Lỗi addToCart:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Số lượng không hợp lệ" });
    }

    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("quantity", sql.Int, quantity);

    const result = await request.query(`
      UPDATE cart_items
      SET quantity = @quantity,
          updated_at = GETDATE()
      OUTPUT INSERTED.id
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy item trong giỏ" });
    }

    res.json({
      success: true,
      message: "Cập nhật giỏ hàng thành công"
    });
  } catch (err) {
    console.error("Lỗi updateCartItem:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(`
      DELETE FROM cart_items
      OUTPUT DELETED.id
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy item để xóa" });
    }

    res.json({
      success: true,
      message: "Xóa item khỏi giỏ thành công"
    });
  } catch (err) {
    console.error("Lỗi removeCartItem:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({ message: "Thiếu wallet" });
    }

    const request = new sql.Request();
    request.input("wallet", sql.NVarChar, wallet);

    await request.query(`
      DELETE FROM cart_items
      WHERE wallet_address = @wallet
    `);

    res.json({
      success: true,
      message: "Đã xóa toàn bộ giỏ hàng"
    });
  } catch (err) {
    console.error("Lỗi clearCart:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};