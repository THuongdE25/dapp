require("dotenv").config();

console.log("=== Testing syncCakesToBlockchain directly ===");
console.log("OWNER_PRIVATE_KEY:", process.env.OWNER_PRIVATE_KEY ? "YES (length: " + process.env.OWNER_PRIVATE_KEY.length + ")" : "NO");

const cakeController = require("./controllers/cakeController");

// Mock req and res
const mockReq = {};
const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(obj) {
    console.log("Response:", obj);
    return this;
  }
};

// Call function directly
cakeController.syncCakesToBlockchain(mockReq, mockRes);
