# 🌊 TRITON: Decentralized Industrial Water Registry

> **Empowering Industrial Compliance with Hedera Hashgraph & AWS KMS HSM**
> *Bridging the ₹48,000 Crore "Trust Gap" in SEBI BRSR Reporting.*

---

## 🏛️ Project Overview
TRITON is an enterprise-grade **dMRV (decentralized Measurement, Reporting, and Verification)** platform designed to automate industrial water stewardship and compliance. By integrating real-time IoT telemetry with the **Hedera network** and **AWS Hardware Security Modules (HSM)**, we ensure that every drop of water used in industrial processes is cryptographically accounted for, making sustainability reporting irrefutable and "Greenwashing" impossible.

### 🛡️ The Problem
Current SEBI **BRSR (Business Responsibility and Sustainability Reporting)** mandates "Reasonable Assurance" for water data. However, 90% of industrial plants still rely on **manual Excel logs** which are easy to forge, lack an audit trail, and have zero real-time enforcement.

### 🚀 The TRITON Solution
TRITON creates a "Policy Enforcement Loop" where IoT sensors are cryptographically linked to a Decentralized Identity (DID) and a live Smart Contract (HSCS).

---

## 🛠️ The Technical Stack (Full-Stack Realism)

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Identity** | **Hedera DID (HIP-172)** | Every sensor and factory has a unique, on-chain DID rooted in HCS. |
| **Consensus** | **Hedera HCS** | Real-time sensor messages are sequenced into a BFT-secured, public audit trail. |
| **Logic (EVM)** | **Hedera HSCS (Solidity)** | Our `WaterRegistry.sol` (0.0.8339707) enforces **Slashing Protocols** for breaches. |
| **Rewards** | **Hedera HTS** | We mint WRT (Water Restoration Tokens) automatically for 100% compliance. |
| **Security** | **AWS KMS HSM** | **FIPS 140-2 Level 3 HSMs** sign messages at the edge. No human handles keys. |
| **dMRV Policy** | **Guardian (HIP-512)** | We implement the **Guardian Stewardship Policy** (pH, TDS, Flow thresholds) locally. |

---

## 🌊 System Architecture
1.  **IoT Edge**: Sensors generate pH, TDS, and Flow telemetry.
2.  **SecOps Backend (Oracle)**: The brain of TRITON. It commands **AWS KMS** to sign measurements and submits them to **Hedera HCS**. 
3.  **Policy Engine (Guardian)**: Our backend dynamically parses `guardian/water-stewardship-policy.json` to evaluate compliance.
4.  **Enforcement (Smart Contract)**: If a breach is detected, the Oracle executes a `ContractExecuteTransaction` on `WaterRegistry.sol` to **slash the factory's bond**.

---

## 🚀 Getting Started (Live in 60 Seconds)

### 1. Prerequisites
*   Node.js (v20+)
*   AWS Account (for KMS access)
*   Hedera Testnet Account

### 2. Environment Setup
Create a `.env` file based on `.env.example`:
```bash
HEDERA_ACCOUNT_ID="0.0.X"
HEDERA_PRIVATE_KEY="302e..."
AWS_KMS_KEY_ARN="arn:aws:kms:..."
HSC_TOPIC_ID="0.0.X"
```

### 3. Start the Ecosystem
Start the **TRITON Oracle** (Backend):
```bash
node scripts/server.js
```

Start the **TRITON Operator Console** (Dashboard):
```bash
cd triton-web && npm run dev
```

Start the **IoT Sensor Simulation** (Edge):
```bash
node scripts/hcs-sensor-publisher.js
```

---

## 🐳 Docker Production Setup
For enterprise deployment, run:
```bash
docker-compose up -d
```
This spawns the TRITON SecOps Oracle and the Auditor Dashboard in a containerized, cloud-native environment, ready for **AWS EC2 or EKS** deployment.

---

## 🏅 Hackathon Tracks
*   **Hedera Hello Future**: Utilizing HCS, HTS, HSCS, and DID in a single unified dMRV pipeline.
*   **AWS KMS Bounty**: Using AWS HSM-backed signatures at the edge to ensure data integrity before it reaches the cloud.
