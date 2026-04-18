const { sql } = require("../config/db");

exports.createOrder = async (req, res) => {
  let transaction;

  try {
    const {
      wallet_address,
      items,
      total_price,
      transaction_hash,
      shipping_name,
      shipping_phone,
      shipping_address,
      note,
      blockchain_order_index
    } = req.body;

    if (!wallet_address) {
      return res.status(400).json({ message: "Thiếu wallet_address" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Thiếu danh sách items" });
    }

    if (blockchain_order_index == null) {
      return res.status(400).json({ message: "Thiếu blockchain_order_index" });
    }

    for (const item of items) {
      if (!item.cake_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          message: `Item không hợp lệ: cake_id=${item.cake_id}, quantity=${item.quantity}`
        });
      }
    }

    transaction = new sql.Transaction();
    await transaction.begin();

    const userRequest = new sql.Request(transaction);
    userRequest.input("wallet_address", sql.NVarChar, wallet_address);

    const userResult = await userRequest.query(`
      SELECT TOP 1 id
      FROM users
      WHERE wallet_address = @wallet_address
    `);

    if (userResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Không tìm thấy user theo wallet_address" });
    }

    const user_id = userResult.recordset[0].id;

    for (const item of items) {
      const stockRequest = new sql.Request(transaction);
      stockRequest.input("cake_id", sql.Int, item.cake_id);

      const stockResult = await stockRequest.query(`
        SELECT id, name, quantity
        FROM cakes
        WHERE id = @cake_id
      `);

      if (stockResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Không tìm thấy cake_id = ${item.cake_id}`
        });
      }

      const cake = stockResult.recordset[0];
      const currentQty = Number(cake.quantity || 0);
      const buyQty = Number(item.quantity);

      if (currentQty < buyQty) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Bánh "${cake.name}" chỉ còn ${currentQty}, không đủ để mua ${buyQty}`
        });
      }
    }

    const orderRequest = new sql.Request(transaction);
    orderRequest.input("user_id", sql.Int, user_id);
    orderRequest.input("total_price", sql.Decimal(18, 2), total_price || 0);
    orderRequest.input("status", sql.NVarChar, "pending");
    orderRequest.input("transaction_hash", sql.NVarChar, transaction_hash || null);
    orderRequest.input("shipping_name", sql.NVarChar, shipping_name || null);
    orderRequest.input("shipping_phone", sql.NVarChar, shipping_phone || null);
    orderRequest.input("shipping_address", sql.NVarChar, shipping_address || null);
    orderRequest.input("note", sql.NVarChar, note || null);
    orderRequest.input("payment_status", sql.NVarChar, "paid");
    orderRequest.input("shipping_status", sql.NVarChar, "pending");
    orderRequest.input("blockchain_order_index", sql.Int, Number(blockchain_order_index));

    const orderResult = await orderRequest.query(`
      INSERT INTO orders (
        user_id,
        total_price,
        status,
        transaction_hash,
        created_at,
        shipping_name,
        shipping_phone,
        shipping_address,
        note,
        payment_status,
        shipping_status,
        blockchain_order_index
      )
      OUTPUT INSERTED.id, INSERTED.blockchain_order_index
      VALUES (
        @user_id,
        @total_price,
        @status,
        @transaction_hash,
        GETDATE(),
        @shipping_name,
        @shipping_phone,
        @shipping_address,
        @note,
        @payment_status,
        @shipping_status,
        @blockchain_order_index
      )
    `);

    const orderId = orderResult.recordset[0].id;

    for (const item of items) {
      const itemRequest = new sql.Request(transaction);
      itemRequest.input("order_id", sql.Int, orderId);
      itemRequest.input("cake_id", sql.Int, item.cake_id);
      itemRequest.input("quantity", sql.Int, item.quantity);
      itemRequest.input("price", sql.Decimal(18, 2), item.price);

      await itemRequest.query(`
        INSERT INTO order_items (order_id, cake_id, quantity, price)
        VALUES (@order_id, @cake_id, @quantity, @price)
      `);

      const updateStockRequest = new sql.Request(transaction);
      updateStockRequest.input("cake_id", sql.Int, item.cake_id);
      updateStockRequest.input("buy_quantity", sql.Int, item.quantity);

      const updateResult = await updateStockRequest.query(`
        UPDATE cakes
        SET quantity = quantity - @buy_quantity
        OUTPUT INSERTED.id, INSERTED.quantity
        WHERE id = @cake_id
          AND quantity >= @buy_quantity
      `);

      if (updateResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Không thể cập nhật tồn kho cho cake_id = ${item.cake_id}`
        });
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: "Tạo đơn hàng thành công",
      order_id: orderId,
      blockchain_order_index: orderResult.recordset[0].blockchain_order_index
    });
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (_) { }
    }

    console.error("Lỗi createOrder:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({ message: "Thiếu wallet" });
    }

    const request = new sql.Request();
    request.input("wallet", sql.NVarChar, wallet);

    const result = await request.query(`
      SELECT
        o.id AS order_id,
        o.blockchain_order_index,
        o.total_price,
        o.status,
        o.transaction_hash,
        o.created_at,
        o.shipping_name,
        o.shipping_phone,
        o.shipping_address,
        o.note,
        o.payment_status,
        o.shipping_status,
        oi.cake_id,
        oi.quantity,
        oi.price,
        c.name,
        c.image_url
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN cakes c ON oi.cake_id = c.id
      WHERE u.wallet_address = @wallet
      ORDER BY o.created_at DESC, o.id DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi getMyOrders:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const request = new sql.Request();

    const result = await request.query(`
  SELECT
    o.id AS order_id,
    o.blockchain_order_index,
    u.wallet_address,
    o.total_price,
    o.status,
    o.transaction_hash,
    o.created_at,
    o.shipping_name,
    o.shipping_phone,
    o.shipping_address,
    o.note,
    o.payment_status,
    o.shipping_status,
    oi.cake_id,
    oi.quantity,
    oi.price,
    c.name,
    c.image_url
  FROM orders o
  JOIN users u ON o.user_id = u.id
  JOIN order_items oi ON o.id = oi.order_id
  JOIN cakes c ON oi.cake_id = c.id
  ORDER BY o.created_at DESC, o.id DESC
`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi getAllOrders:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateShippingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipping_status } = req.body;

    const validShippingStatus = ["pending", "shipping", "delivered"];

    if (!validShippingStatus.includes(shipping_status)) {
      return res.status(400).json({
        message: "shipping_status không hợp lệ"
      });
    }

    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("shipping_status", sql.NVarChar, shipping_status);

    const result = await request.query(`
      UPDATE orders
      SET shipping_status = @shipping_status
      OUTPUT INSERTED.id, INSERTED.shipping_status
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng"
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái giao hàng thành công",
      order: result.recordset[0]
    });
  } catch (err) {
    console.error("Lỗi updateShippingStatus:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.confirmReceived = async (req, res) => {
  try {
    const { id } = req.params;

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(`
      UPDATE orders
      SET shipping_status = 'delivered',
          payment_status = 'released'
      OUTPUT INSERTED.id, INSERTED.shipping_status, INSERTED.payment_status
      WHERE id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng"
      });
    }

    res.json({
      success: true,
      message: "Xác nhận nhận hàng thành công",
      order: result.recordset[0]
    });
  } catch (err) {
    console.error("Lỗi confirmReceived:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};