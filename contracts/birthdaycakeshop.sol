pragma solidity ^0.8.20;

contract BirthdayCakeShopSapphire {

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
        bool delivered; 
    }

    mapping(uint => Cake) public cakes;
    mapping(address => Order[]) private userOrders; 
    Order[] public orders;

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

        addCake("Chocolate Cake", 0.01 ether);
        addCake("Strawberry Cake", 0.02 ether);
    }

    function addCake(string memory _name, uint _price) public onlyOwner {
        require(_price > 0, "Price must be > 0");
        cakes[nextCakeId] = Cake(nextCakeId, _name, _price, true);
        emit CakeAdded(nextCakeId, _name, _price);
        nextCakeId++;
    }

    function setAvailability(uint _id, bool _status) public onlyOwner {
        require(cakes[_id].id != 0, "Cake not found");
        cakes[_id].isAvailable = _status;
    }

    function getCake(uint _id) public view returns (Cake memory) {
        return cakes[_id];
    }

    function orderCake(uint _cakeId, uint _quantity) public payable {
        require(_quantity > 0, "Invalid quantity");
        Cake memory cake = cakes[_cakeId];
        require(cake.id != 0 && cake.isAvailable, "Cake not available");

        uint total = cake.price * _quantity;
        require(msg.value >= total, "Not enough ROSE");

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

        if(msg.value > total){
            payable(msg.sender).transfer(msg.value - total);
        }

        emit CakeOrdered(msg.sender, _cakeId, _quantity, total);
    }

    function getAllOrders() public view onlyOwner returns (Order[] memory) {
        return orders;
    }

    function getMyOrders() public view returns (Order[] memory) {
        return userOrders[msg.sender];
    }

    function markDelivered(uint _orderIndex) public onlyOwner {
        require(_orderIndex < orders.length, "Order not found");
        orders[_orderIndex].delivered = true;
        emit Delivered(_orderIndex);
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner).transfer(balance);
        emit Withdraw(owner, balance);
    }
}