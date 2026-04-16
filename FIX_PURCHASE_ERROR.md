# 🔧 Hướng dẫn Fix Lỗi "Transaction Execution Reverted"

## 🔴 Vấn đề
Khi ấn mua hàng, app báo lỗi:
```
Error: transaction execution reverted (status=0)
```

**Nguyên nhân:** Cakes chỉ tồn tại trong database SQL, chưa được đẩy lên smart contract blockchain.

---

## ✅ Giải Pháp: Sync Cakes lên Blockchain

### Bước 1: Setup Environment

**File: `Backend/.env`** (copy từ .env.example)

```bash
cp Backend/.env.example Backend/.env
```

Sửa `.env`:
```env
DB_USER=sa
DB_PASSWORD=123456
DB_SERVER=localhost
DB_DATABASE=DApp_CakeShop
OWNER_PRIVATE_KEY=0x... (lấy từ MetaMask)
RPC_URL=https://testnet.sapphire.oasis.dev
```

**Lấy Private Key từ MetaMask:**
1. Mở MetaMask
2. Tại tài khoản Oasis Testnet
3. Nhấn 3 chấm → Account Details → Show private key
4. Copy key (bắt đầu với `0x`)
5. Paste vào `OWNER_PRIVATE_KEY` trong `.env`

⚠️ **BẬT LẠ BACKEND SAU KHI CẬP NHẬT .ENV**

---

### Bước 2: Gọi API Sync

Chạy lệnh sau để sync tất cả cakes:

```bash
curl -X POST http://localhost:3000/api/cakes/admin/sync-blockchain
```

Hoặc từ Postman/Thunder Client:
- **Method:** POST
- **URL:** `http://localhost:3000/api/cakes/admin/sync-blockchain`

**Kết quả thành công:**
```json
{
  "message": "Sync hoàn tất: 37/37 cakes",
  "results": [
    {
      "id": 1,
      "name": "Bánh Fruit 17",
      "status": "success",
      "txHash": "0x..."
    }
  ]
}
```

---

### Bước 3: Kiểm Tra Trên Blockchain Explorer

Truy cập https://testnet.sapphire.oasis.dev/ để xem transactions.

---

## 🎉 Bây Giờ Bạn Có Thể Mua Hàng!

Tất cả cakes đã có trên blockchain, user có thể:
1. Xem sản phẩm ✓
2. Thêm vào giỏ ✓
3. **Mua hàng (MetaMask)** ✓

---

## 🛠️ Troubleshooting

### Lỗi "Admin key not configured"
→ Chưa set `OWNER_PRIVATE_KEY` trong `.env`

### Lỗi "Cake not found" khi mua
→ Chạy lại bước 2 (Sync API)

### Lỗi "Not enough gas"
→ Ví cần thêm gas fee (~0.5-1 ROSE cho mỗi cake)

---

## 📝 Chi Tiết Kỹ Thuật

Smart contract yêu cầu:
- Mỗi cake cần được `upsertCake()` trước khi user có thể order
- Giá phải convert sang Wei (18 decimals)
- Chỉ owner mới có thể sync

Hàm sync tự động:
1. Lấy tất cả cakes từ database
2. Convert giá sang blockchain format
3. Gọi `upsertCake()` cho mỗi cake
4. Chờ transaction confirm
5. Trả về kết quả

---

**Bạn cần hỗ trợ thêm?** Hãy check console logs hoặc terminal backend để thấy chi tiết lỗi.
