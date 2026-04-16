const http = require("http");
const timestamp = Date.now();

const options = {
  hostname: "localhost",
  port: 3000,
  path: `/api/cakes/admin/sync-blockchain?t=${timestamp}`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate"  
  }
};

const req = http.request(options, (res) => {
  console.log("Status:", res.statusCode);
  console.log("Headers:", res.headers);
  
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  
  res.on("end", () => {
    console.log("Response:", data);
    try {
      const parsed = JSON.parse(data);
      console.log("Parsed:", parsed);
    } catch (e) {
      console.log("Cannot parse JSON");
    }
  });
});

req.on("error", (e) => {
  console.error("Error:", e);
});

req.end();
