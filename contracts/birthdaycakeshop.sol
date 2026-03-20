// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BirthdayCakeShop {

    address public owner;
    uint public nextCakeId = 1;

    struct Cake {
        uint id;
        string name;
        uint price;
        bool isAvailable;
    }

    struct Order {
        address buyer;
        uint cakeId;
        uint quantity;
        uint totalPrice;
        uint timestamp;
    }

    mapping(uint => Cake) public cakes;
    Order[] public orders;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;

        // default cakes
        addCake("Chocolate Cake", 0.01 ether);
        addCake("Strawberry Cake", 0.02 ether);
    }

    // ADMIN thêm bánh
    function addCake(string memory _name, uint _price) public onlyOwner {
        cakes[nextCakeId] = Cake(
            nextCakeId,
            _name,
            _price,
            true
        );
        nextCakeId++;
    }

    // xem danh sách bánh
    function getCake(uint _id) public view returns (Cake memory) {
        return cakes[_id];
    }

    // đặt bánh
    function orderCake(uint _cakeId, uint _quantity) public payable {
        Cake memory cake = cakes[_cakeId];

        require(cake.isAvailable, "Cake not available");
        require(_quantity > 0, "Invalid quantity");

        uint total = cake.price * _quantity;
        require(msg.value >= total, "Not enough ETH");

        orders.push(Order(
            msg.sender,
            _cakeId,
            _quantity,
            total,
            block.timestamp
        ));
    }

    //  admin xem tất cả đơn hàng
    function getAllOrders() public view onlyOwner returns (Order[] memory) {
        return orders;
    }

    // user xem đơn của mình
    function getMyOrders() public view returns (Order[] memory) {
        uint count = 0;

        for (uint i = 0; i < orders.length; i++) {
            if (orders[i].buyer == msg.sender) {
                count++;
            }
        }

        Order[] memory result = new Order[](count);
        uint index = 0;

        for (uint i = 0; i < orders.length; i++) {
            if (orders[i].buyer == msg.sender) {
                result[index] = orders[i];
                index++;
            }
        }

        return result;
    }

    // rút tiền
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}