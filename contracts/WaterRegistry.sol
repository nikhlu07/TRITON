// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TRITON WaterRegistry
 * @dev Enterprise-grade Decentralized Compliance Engine.
 * Features: Role-Based Access Control (RBAC), Hardware Oracle Integration,
 *           Factory Staking/Deposits, and Automated Slashing for Environmental Breaches.
 */
contract WaterRegistry {

    address public ownerAdmin;
    address public regulatoryTreasury; // Where slashed funds go (e.g., SEBI / EPA)

    // Role-Based Access Control
    mapping(address => bool) public isHardwareOracle; // AWS KMS Gateways
    mapping(address => bool) public isAuditor;        // SEBI / Big 4

    struct FactoryProfile {
        bool isRegistered;
        uint256 totalStake;       // HBAR deposited for compliance bond
        bool isCurrentlyCompliant;
        uint256 breachCount;
    }

    struct ComplianceRecord {
        uint256 timestamp;
        string dataHash;     // The AWS KMS signed payload hash
        bool isCompliant;    
        string signature;    // The AWS KMS signature hex
        uint256 slashedAmount; // Amount slashed if breached
    }

    // Mappings
    mapping(string => FactoryProfile) public factories; // factoryId -> Profile
    mapping(string => ComplianceRecord[]) public factoryRecords;

    // Events
    event FactoryRegistered(string indexed factoryId, uint256 initialStake);
    event OracleAdded(address indexed oracleAddress);
    event CompliantReading(string indexed factoryId, uint256 timestamp, string dataHash);
    event BreachDetected(string indexed factoryId, uint256 timestamp, string dataHash, uint256 slashedAmount);

    modifier onlyOwner() {
        require(msg.sender == ownerAdmin, "Not Authorized: Owner Only");
        _;
    }

    modifier onlyOracle() {
        require(isHardwareOracle[msg.sender] || msg.sender == ownerAdmin, "Not Authorized: Hardware Oracle Only");
        _;
    }

    constructor() {
        ownerAdmin = msg.sender;
        regulatoryTreasury = msg.sender;
    }

    // --- Admin Configuration ---

    function addHardwareOracle(address oracle) external onlyOwner {
        isHardwareOracle[oracle] = true;
        emit OracleAdded(oracle);
    }

    function addAuditor(address auditor) external onlyOwner {
        isAuditor[auditor] = true;
    }

    // --- Enterprise Staking (Compliance Bond) ---

    /**
     * @dev Factories must register and lock up HBAR as an environmental bond.
     */
    function registerFactory(string calldata factoryId) external payable {
        require(!factories[factoryId].isRegistered, "Factory already registered");
        require(msg.value >= 10, "Minimum 10 wei/tinybar bond required"); 

        factories[factoryId] = FactoryProfile({
            isRegistered: true,
            totalStake: msg.value,
            isCurrentlyCompliant: true,
            breachCount: 0
        });

        emit FactoryRegistered(factoryId, msg.value);
    }

    // --- Automated dMRV Compliance & Slashing Engine ---

    /**
     * @dev Submits a cryptographically signed sensor payload to the blockchain.
     *      Triggered securely by the AWS KMS integrated backend.
     */
    function recordTelemetry(
        string calldata factoryId, 
        string calldata dataHash, 
        bool isCompliant, 
        string calldata kmsSignature
    ) external onlyOracle {
        
        require(factories[factoryId].isRegistered, "Factory not registered");
        
        uint256 slashed = 0;
        FactoryProfile storage profile = factories[factoryId];

        if (isCompliant) {
            profile.isCurrentlyCompliant = true;
            emit CompliantReading(factoryId, block.timestamp, dataHash);
        } else {
            // SLASHER PROTOCOL: Factory breached CPCB environmental limits!
            profile.isCurrentlyCompliant = false;
            profile.breachCount += 1;
            
            // Slash 5% of their total stake for the breach
            slashed = (profile.totalStake * 5) / 100;
            if (slashed > 0 && profile.totalStake >= slashed) {
                profile.totalStake -= slashed;
                // Move slashed funds to the government/regulator treasury
                payable(regulatoryTreasury).transfer(slashed);
            }
            
            emit BreachDetected(factoryId, block.timestamp, dataHash, slashed);
        }

        // Push permanent record to EVM storage for auditors
        factoryRecords[factoryId].push(ComplianceRecord({
            timestamp: block.timestamp,
            dataHash: dataHash,
            isCompliant: isCompliant,
            signature: kmsSignature,
            slashedAmount: slashed
        }));
    }

    // --- Auditor Read Functions ---

    function getRecordCount(string calldata factoryId) external view returns (uint256) {
        return factoryRecords[factoryId].length;
    }

    function getFactoryProfile(string calldata factoryId) external view returns (
        bool isRegistered,
        uint256 totalStake,
        bool isCurrentlyCompliant,
        uint256 breachCount
    ) {
        FactoryProfile memory profile = factories[factoryId];
        return (profile.isRegistered, profile.totalStake, profile.isCurrentlyCompliant, profile.breachCount);
    }

    function getLatestRecord(string calldata factoryId) external view returns (
        uint256 timestamp, 
        string memory dataHash, 
        bool isCompliant, 
        string memory signature,
        uint256 slashedAmount
    ) {
        require(factoryRecords[factoryId].length > 0, "No records found");
        
        uint256 index = factoryRecords[factoryId].length - 1;
        ComplianceRecord memory record = factoryRecords[factoryId][index];
        
        return (record.timestamp, record.dataHash, record.isCompliant, record.signature, record.slashedAmount);
    }
}
