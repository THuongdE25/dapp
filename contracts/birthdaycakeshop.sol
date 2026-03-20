// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BirthdayCakeShopSapphire {

    address public owner;
    uint public nextCakeId = 1;

    struct Cake {
        uint id;
        string name;
        uint price; // giá tính bằng ROSE
        bool isAvailable;
    }

    struct Order {
        address buyer;
        uint cakeId;
        uint quantity;
        uint totalPrice;
        uint timestamp;
        bool delivered; // có thể dùng cho escrow
    }

    mapping(uint => Cake) public cakes;
    mapping(address => Order[]) private userOrders; // tối ưu getMyOrders
    Order[] public orders;

    // EVENTS
    event CakeAdded(uint cakeId, string name, uint price);
    event CakeOrdered(address indexed buyer, uint cakeId, uint quantity, uint totalPrice);
    event Withdraw(address indexed owner, uint amount);
    event Delivered(uint orderId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Thêm bánh mặc định
        addCake("Chocolate Cake", 0.01 ether);
        addCake("Strawberry Cake", 0.02 ether);
    }

    // ADMIN: thêm bánh
    function addCake(string memory _name, uint _price) public onlyOwner {
        require(_price > 0, "Price must be > 0");
        cakes[nextCakeId] = Cake(nextCakeId, _name, _price, true);
        emit CakeAdded(nextCakeId, _name, _price);
        nextCakeId++;
    }

    // ADMIN: bật/tắt bánh
    function setAvailability(uint _id, bool _status) public onlyOwner {
        require(cakes[_id].id != 0, "Cake not found");
        cakes[_id].isAvailable = _status;
    }

    // Xem bánh
    function getCake(uint _id) public view returns (Cake memory) {
        return cakes[_id];
    }

    // Đặt bánh
    function orderCake(uint _cakeId, uint _quantity) public payable {
        require(_quantity > 0, "Invalid quantity");
        Cake memory cake = cakes[_cakeId];
        require(cake.id != 0 && cake.isAvailable, "Cake not available");

        uint total = cake.price * _quantity;
        require(msg.value >= total, "Not enough ROSE");

        // Lưu đơn hàng
        Order memory newOrder = Order({
            buyer: msg.sender,
            cakeId: _cakeId,
            quantity: _quantity,
            totalPrice: total,
            timestamp: block.timestamp,
            delivered: false
        });
        orders.push(newOrder);
        userOrders[msg.sender].push(newOrder);

        // Hoàn tiền dư nếu gửi nhiều hơn
        if(msg.value > total){
            payable(msg.sender).transfer(msg.value - total);
        }

        emit CakeOrdered(msg.sender, _cakeId, _quantity, total);
    }

    // ADMIN: xem tất cả đơn
    function getAllOrders() public view onlyOwner returns (Order[] memory) {
        return orders;
    }

    // User xem đơn của mình
    function getMyOrders() public view returns (Order[] memory) {
        return userOrders[msg.sender];
    }

    // ADMIN: đánh dấu giao bánh
    function markDelivered(uint _orderIndex) public onlyOwner {
        require(_orderIndex < orders.length, "Order not found");
        orders[_orderIndex].delivered = true;
        emit Delivered(_orderIndex);
    }

    // Rút ROSE từ contract
    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner).transfer(balance);
        emit Withdraw(owner, balance);
    }
}