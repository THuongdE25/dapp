const { sql } = require("../config/db");

exports.loginWallet = async (req, res) => {
  const { wallet } = req.body;

  try {
    let request = new sql.Request();
    request.input("wallet", sql.NVarChar, wallet);

    let result = await request.query(`
      SELECT * FROM users WHERE wallet_address = @wallet
    `);

    if (result.recordset.length === 0) {
      let insertRequest = new sql.Request();
      insertRequest.input("wallet", sql.NVarChar, wallet);
      insertRequest.input("name", sql.NVarChar, "User mới");

      await insertRequest.query(`
        INSERT INTO users (wallet_address, name)
        VALUES (@wallet, @name)
      `);

      let selectRequest = new sql.Request();
      selectRequest.input("wallet", sql.NVarChar, wallet);

      result = await selectRequest.query(`
        SELECT * FROM users WHERE wallet_address = @wallet
      `);
    }

    res.json({
      success: true,
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Lỗi login-wallet:", err);
    res.status(500).send(err.message);
  }
};