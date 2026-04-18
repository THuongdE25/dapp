pragma solidity ^0.8.20;

contract BirthdayCakeShopSapphire {
    address public owner;

    uint256 public lockedBalance;
    uint256 public withdrawableBalance;

    struct Cake {
        uint256 id;
        string name;
        uint256 price;
        bool isAvailable;
    }

    struct Order {
        address buyer;
        uint256 cakeId;
        uint256 quantity;
        uint256 totalPrice;
        uint256 timestamp;
        bool delivered;          // GIỮ NGUYÊN TÊN CŨ
        bool received;           // GIỮ NGUYÊN TÊN CŨ
        bool releasedToOwner;
    }

    mapping(uint256 => Cake) public cakes;
    mapping(address => uint256[]) private userOrderIndexes;
    Order[] public orders;

    event CakeUpserted(uint256 cakeId, string name, uint256 price, bool isAvailable);
    event CakeOrdered(
        uint256 indexed orderIndex,
        address indexed buyer,
        uint256 cakeId,
        uint256 quantity,
        uint256 totalPrice
    );
    event Delivered(uint256 indexed orderIndex);
    event ReceivedConfirmed(uint256 indexed orderIndex, address indexed buyer, uint256 amount);
    event Withdraw(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function upsertCake(
        uint256 _id,
        string memory _name,
        uint256 _price,
        bool _isAvailable
    ) public onlyOwner {
        require(_id > 0, "Invalid cake id");
        require(bytes(_name).length > 0, "Name is required");
        require(_price > 0, "Price must be > 0");

        cakes[_id] = Cake({
            id: _id,
            name: _name,
            price: _price,
            isAvailable: _isAvailable
        });

        emit CakeUpserted(_id, _name, _price, _isAvailable);
    }

    function setAvailability(uint256 _id, bool _status) public onlyOwner {
        require(cakes[_id].id != 0, "Cake not found");
        cakes[_id].isAvailable = _status;
    }

    function updateCakePrice(uint256 _id, uint256 _newPrice) public onlyOwner {
        require(cakes[_id].id != 0, "Cake not found");
        require(_newPrice > 0, "Price must be > 0");

        cakes[_id].price = _newPrice;

        emit CakeUpserted(
            cakes[_id].id,
            cakes[_id].name,
            cakes[_id].price,
            cakes[_id].isAvailable
        );
    }

    function getCake(uint256 _id) public view returns (Cake memory) {
        require(cakes[_id].id != 0, "Cake not found");
        return cakes[_id];
    }

    function orderCake(uint256 _cakeId, uint256 _quantity) public payable returns (uint256) {
        require(_quantity > 0, "Invalid quantity");

        Cake storage cake = cakes[_cakeId];
        require(cake.id != 0, "Cake not found");
        require(cake.isAvailable, "Cake not available");

        uint256 total = cake.price * _quantity;
        require(msg.value >= total, "Not enough value");

        Order memory newOrder = Order({
            buyer: msg.sender,
            cakeId: _cakeId,
            quantity: _quantity,
            totalPrice: total,
            timestamp: block.timestamp,
            delivered: false,
            received: false,
            releasedToOwner: false
        });

        orders.push(newOrder);
        uint256 newIndex = orders.length - 1;
        userOrderIndexes[msg.sender].push(newIndex);

        lockedBalance += total;

        if (msg.value > total) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - total}("");
            require(refundSuccess, "Refund failed");
        }

        emit CakeOrdered(newIndex, msg.sender, _cakeId, _quantity, total);
        return newIndex;
    }

    function getAllOrders() public view onlyOwner returns (Order[] memory) {
        return orders;
    }

    function getMyOrders() public view returns (Order[] memory) {
        uint256[] memory indexes = userOrderIndexes[msg.sender];
        Order[] memory result = new Order[](indexes.length);

        for (uint256 i = 0; i < indexes.length; i++) {
            result[i] = orders[indexes[i]];
        }

        return result;
    }
    function getMyOrderIndexes() public view returns (uint256[] memory) {
    return userOrderIndexes[msg.sender];
    }
    function markDelivered(uint256 _orderIndex) public onlyOwner {
        require(_orderIndex < orders.length, "Order not found");
        require(!orders[_orderIndex].delivered, "Already delivered");

        orders[_orderIndex].delivered = true;
        emit Delivered(_orderIndex);
    }

    function confirmReceived(uint256 _orderIndex) public {
        require(_orderIndex < orders.length, "Order not found");

        Order storage o = orders[_orderIndex];

        require(msg.sender == o.buyer, "Not buyer");
        require(o.delivered, "Order not marked delivered");
        require(!o.received, "Already confirmed");
        require(!o.releasedToOwner, "Already released");

        o.received = true;
        o.releasedToOwner = true;

        require(lockedBalance >= o.totalPrice, "Insufficient locked balance");
        lockedBalance -= o.totalPrice;
        withdrawableBalance += o.totalPrice;

        emit ReceivedConfirmed(_orderIndex, msg.sender, o.totalPrice);
    }

    function withdraw() public onlyOwner {
        uint256 amount = withdrawableBalance;
        require(amount > 0, "No withdrawable balance");

        withdrawableBalance = 0;

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdraw failed");

        emit Withdraw(owner, amount);
    }

    function getContractBalances()
        public
        view
        returns (uint256 locked, uint256 withdrawable, uint256 total)
    {
        return (lockedBalance, withdrawableBalance, address(this).balance);
    }
}