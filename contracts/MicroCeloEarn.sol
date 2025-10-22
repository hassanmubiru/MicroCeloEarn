// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MicroCeloEarn
 * @dev Main contract for managing micro-tasks and payments on Celo blockchain
 */
contract MicroCeloEarn is ReentrancyGuard, Ownable {
    // Supported payment tokens (cUSD, CELO)
    address public cUSD;
    address public CELO;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    enum TaskStatus { Open, Assigned, InReview, Completed, Cancelled, Disputed }
    enum PaymentToken { cUSD, CELO }
    
    struct Task {
        uint256 id;
        address poster;
        address worker;
        string title;
        string description;
        string category;
        uint256 reward;
        PaymentToken paymentToken;
        TaskStatus status;
        uint256 createdAt;
        uint256 deadline;
        bool fundsEscrowed;
    }
    
    struct Worker {
        uint256 tasksCompleted;
        uint256 totalEarned;
        uint256 rating; // Out of 100
        uint256 ratingCount;
    }
    
    // State variables
    uint256 public taskCounter;
    mapping(uint256 => Task) public tasks;
    mapping(address => Worker) public workers;
    mapping(address => uint256[]) public userPostedTasks;
    mapping(address => uint256[]) public userAssignedTasks;
    
    // Events
    event TaskCreated(uint256 indexed taskId, address indexed poster, uint256 reward, PaymentToken token);
    event TaskAssigned(uint256 indexed taskId, address indexed worker);
    event TaskSubmitted(uint256 indexed taskId, address indexed worker);
    event TaskCompleted(uint256 indexed taskId, address indexed worker, uint256 reward);
    event TaskCancelled(uint256 indexed taskId);
    event TaskDisputed(uint256 indexed taskId);
    event WorkerRated(address indexed worker, uint256 rating);
    event FundsWithdrawn(address indexed user, uint256 amount, PaymentToken token);
    
    constructor(address _cUSD, address _cELO) Ownable(msg.sender) {
        cUSD = _cUSD;
        CELO = _cELO;
    }
    
    /**
     * @dev Create a new task with escrowed funds
     */
    function createTask(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _reward,
        PaymentToken _paymentToken,
        uint256 _deadline
    ) external payable nonReentrant returns (uint256) {
        require(_reward > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        taskCounter++;
        uint256 taskId = taskCounter;
        
        // Calculate total amount needed (reward + platform fee)
        uint256 feeAmount = (_reward * platformFee) / FEE_DENOMINATOR;
        uint256 totalAmount = _reward + feeAmount;
        
        // Handle payment based on token type
        if (_paymentToken == PaymentToken.cUSD) {
            require(
                IERC20(cUSD).transferFrom(msg.sender, address(this), totalAmount),
                "cUSD transfer failed"
            );
        } else {
            require(msg.value >= totalAmount, "Insufficient CELO sent");
        }
        
        tasks[taskId] = Task({
            id: taskId,
            poster: msg.sender,
            worker: address(0),
            title: _title,
            description: _description,
            category: _category,
            reward: _reward,
            paymentToken: _paymentToken,
            status: TaskStatus.Open,
            createdAt: block.timestamp,
            deadline: _deadline,
            fundsEscrowed: true
        });
        
        userPostedTasks[msg.sender].push(taskId);
        
        emit TaskCreated(taskId, msg.sender, _reward, _paymentToken);
        
        return taskId;
    }
    
    /**
     * @dev Worker accepts a task
     */
    function acceptTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.Open, "Task not available");
        require(task.deadline > block.timestamp, "Task deadline passed");
        require(task.poster != msg.sender, "Cannot accept own task");
        
        task.worker = msg.sender;
        task.status = TaskStatus.Assigned;
        
        userAssignedTasks[msg.sender].push(_taskId);
        
        emit TaskAssigned(_taskId, msg.sender);
    }
    
    /**
     * @dev Worker submits completed task for review
     */
    function submitTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.worker == msg.sender, "Not assigned to you");
        require(task.status == TaskStatus.Assigned, "Task not in assigned state");
        
        task.status = TaskStatus.InReview;
        
        emit TaskSubmitted(_taskId, msg.sender);
    }
    
    /**
     * @dev Task poster approves completed task and releases payment
     */
    function approveTask(uint256 _taskId, uint256 _rating) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(task.poster == msg.sender, "Not task poster");
        require(task.status == TaskStatus.InReview, "Task not in review");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        require(task.fundsEscrowed, "Funds not escrowed");
        
        task.status = TaskStatus.Completed;
        
        // Update worker stats
        Worker storage worker = workers[task.worker];
        worker.tasksCompleted++;
        worker.totalEarned += task.reward;
        
        // Update rating (convert 1-5 to 0-100 scale)
        uint256 ratingScore = _rating * 20;
        if (worker.ratingCount == 0) {
            worker.rating = ratingScore;
        } else {
            worker.rating = ((worker.rating * worker.ratingCount) + ratingScore) / (worker.ratingCount + 1);
        }
        worker.ratingCount++;
        
        // Transfer reward to worker
        if (task.paymentToken == PaymentToken.cUSD) {
            require(IERC20(cUSD).transfer(task.worker, task.reward), "Payment failed");
        } else {
            (bool success, ) = task.worker.call{value: task.reward}("");
            require(success, "CELO payment failed");
        }
        
        task.fundsEscrowed = false;
        
        emit TaskCompleted(_taskId, task.worker, task.reward);
        emit WorkerRated(task.worker, ratingScore);
    }
    
    /**
     * @dev Cancel task and refund poster (only if not assigned)
     */
    function cancelTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(task.poster == msg.sender, "Not task poster");
        require(task.status == TaskStatus.Open, "Cannot cancel assigned task");
        require(task.fundsEscrowed, "Funds already withdrawn");
        
        task.status = TaskStatus.Cancelled;
        
        // Calculate refund amount (reward + fee)
        uint256 feeAmount = (task.reward * platformFee) / FEE_DENOMINATOR;
        uint256 refundAmount = task.reward + feeAmount;
        
        // Refund poster
        if (task.paymentToken == PaymentToken.cUSD) {
            require(IERC20(cUSD).transfer(task.poster, refundAmount), "Refund failed");
        } else {
            (bool success, ) = task.poster.call{value: refundAmount}("");
            require(success, "CELO refund failed");
        }
        
        task.fundsEscrowed = false;
        
        emit TaskCancelled(_taskId);
    }
    
    /**
     * @dev Raise dispute for a task
     */
    function disputeTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(
            task.poster == msg.sender || task.worker == msg.sender,
            "Not involved in task"
        );
        require(
            task.status == TaskStatus.InReview || task.status == TaskStatus.Assigned,
            "Cannot dispute task in current state"
        );
        
        task.status = TaskStatus.Disputed;
        
        emit TaskDisputed(_taskId);
    }
    
    /**
     * @dev Get all open tasks
     */
    function getOpenTasks() external view returns (uint256[] memory) {
        uint256 openCount = 0;
        
        // Count open tasks
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].status == TaskStatus.Open && tasks[i].deadline > block.timestamp) {
                openCount++;
            }
        }
        
        // Create array of open task IDs
        uint256[] memory openTasks = new uint256[](openCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].status == TaskStatus.Open && tasks[i].deadline > block.timestamp) {
                openTasks[index] = i;
                index++;
            }
        }
        
        return openTasks;
    }
    
    /**
     * @dev Get tasks posted by user
     */
    function getUserPostedTasks(address _user) external view returns (uint256[] memory) {
        return userPostedTasks[_user];
    }
    
    /**
     * @dev Get tasks assigned to user
     */
    function getUserAssignedTasks(address _user) external view returns (uint256[] memory) {
        return userAssignedTasks[_user];
    }
    
    /**
     * @dev Get worker profile
     */
    function getWorkerProfile(address _worker) external view returns (
        uint256 tasksCompleted,
        uint256 totalEarned,
        uint256 rating,
        uint256 ratingCount
    ) {
        Worker memory worker = workers[_worker];
        return (worker.tasksCompleted, worker.totalEarned, worker.rating, worker.ratingCount);
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
    
    /**
     * @dev Withdraw accumulated platform fees (only owner)
     */
    function withdrawPlatformFees(PaymentToken _token) external onlyOwner nonReentrant {
        uint256 balance;
        
        if (_token == PaymentToken.cUSD) {
            balance = IERC20(cUSD).balanceOf(address(this));
            require(IERC20(cUSD).transfer(owner(), balance), "Withdrawal failed");
        } else {
            balance = address(this).balance;
            (bool success, ) = owner().call{value: balance}("");
            require(success, "CELO withdrawal failed");
        }
        
        emit FundsWithdrawn(owner(), balance, _token);
    }
    
    // Fallback to receive CELO
    receive() external payable {}
}
