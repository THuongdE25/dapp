const { sql } = require("../config/db");

exports.createOrder = async (req, res) => {
  const { user_id, items, total_price, tx_hash } = req.body;

  try {
    const orderResult = await sql.query(`
      INSERT INTO orders (user_id, total_price, status, transaction_hash)
      OUTPUT INSERTED.id
      VALUES (${user_id}, ${total_price}, 'success', '${tx_hash}')
    `);

    const orderId = orderResult.recordset[0].id;

    for (let item of items) {
      await sql.query(`
        INSERT INTO order_items (order_id, cake_id, quantity, price)
        VALUES (${orderId}, ${item.cake_id}, ${item.quantity}, ${item.price})
      `);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi order:", err);
    res.status(500).send(err.message);
  }
};