--cake
CREATE TABLE cakes (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10,2) NOT NULL,
    image_url NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
--user 
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    wallet_address NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255),
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
--order 
CREATE TABLE orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT N'pending',
    transaction_hash NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(id)
);

--order-item
CREATE TABLE order_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    cake_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (cake_id) REFERENCES cakes(id)
);
--( nên dùng lệnh này để insert id ) 
--SET IDENTITY_INSERT cakes ON;

--INSERT INTO cakes (id, name, description, price, image_url, created_at)
--VALUES (11, N'kemtuoi1_1', N'Ngon bổ rẻ', 100, N'/images/kemtuoi1_1.jpg', GETDATE());

--SET IDENTITY_INSERT cakes OFF;

select * from cakes

ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = '123456';