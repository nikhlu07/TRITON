# 🌊 TRITON
### Trustless Real-time Industrial Track-and-trace On-chain Network

<div align="center">

![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-black?style=for-the-badge&logo=hedera&logoColor=00d4ff)
![AWS](https://img.shields.io/badge/AWS-KMS%20Secured-orange?style=for-the-badge&logo=amazon-aws)
![Guardian](https://img.shields.io/badge/Guardian-dMRV%20Policy-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Hackathon%20MVP-red?style=for-the-badge)

**TRITON turns a factory's water pipe into an auditable, on-chain asset.**

*Hedera Hello Future Apex Hackathon 2026 · Sustainability Track · AWS Bounty*

</div>

---

## 🔴 The Problem: The ₹48,000 Crore Trust Gap

In FY2025-26, **SEBI's BRSR Core framework** upgraded its mandate: India's top 1,000 listed companies must now provide **"Reasonable Assurance"** — not self-reported estimates — for water consumption and recycling.

The reality on the ground is devastating:

| What the law demands | What companies actually do |
|---|---|
| Cryptographically verifiable audit trail | Excel spreadsheet, updated monthly |
| Real-time sensor telemetry | An employee reads a meter and types a number |
| Independent third-party assurance | A consultant visits once a year |
| Tamper-proof evidence chain | A PDF signed by the CFO |

> **The result:** Greenwashing at scale. A plant can write *"We recycled 10 million liters"* in their annual report — and no regulator, investor, or auditor can prove or disprove it without a multi-month, crore-rupee manual audit.

**TRITON eliminates this problem entirely.**

---

## 🟢 The Solution: "Proof of Purity" as a Protocol

TRITON is not a dashboard. It is not a reporting tool. It is a **cryptographic infrastructure layer** that sits between a factory's physical pipes and India's financial regulators — making water data as trustworthy and immutable as a blockchain transaction.

Every 10 seconds, TRITON:
1. Reads live sensor data (pH, TDS, Flow Rate) from the industrial outlet
2. Creates a cryptographic fingerprint, signed by **AWS KMS hardware** (keys never leave the module)
3. Publishes the hash to **Hedera Consensus Service** — creating a permanent, tamper-proof record
4. Runs the reading through a **Guardian dMRV Policy** aligned with CPCB IS:2490 and WHO standards
5. If the factory stays compliant for 24 hours, **automatically mints a Water Restoration Token (WRT)** on HTS

A SEBI auditor no longer needs to trust the company. They verify the chain.

---

## 🏗️ Technical Architecture

```
  PHYSICAL WORLD                    HEDERA NETWORK                    COMPLIANCE LAYER
  ─────────────                    ──────────────                    ────────────────
  
  ┌─────────────┐   AWS KMS Sign   ┌──────────────┐   Guardian      ┌──────────────┐
  │ Flow Meter  │ ────────────────▶│ HCS Topic    │ ──subscribes──▶ │ CPCB Policy  │
  │ DID: z6Mk…  │                  │ (Truth       │                  │ Engine       │
  └─────────────┘                  │  Stream)     │                  └──────┬───────┘
                                   └──────────────┘                         │
  ┌─────────────┐   HMAC-256 hash                                   ┌───────▼───────┐
  │ pH Sensor   │ ────────────────▶  Every reading:                 │  Compliant?   │
  │ DID: z6Mk…  │                    • Timestamped                  └──────┬────────┘
  └─────────────┘                    • Ordered (seq#)               YES ◀──┘   │ NO
                                     • Immutable                    │          │
  ┌─────────────┐                    • AWS CloudTrail               ▼          ▼
  │ TDS Sensor  │                    • Hedera Mirror    ┌──────────────┐  ┌──────────┐
  │ DID: z6Mk…  │                                       │  Mint WRT    │  │  Freeze  │
  └─────────────┘                                       │  HTS Token   │  │  Badge   │
                                                        └──────────────┘  └──────────┘
                                                               │
                                                    ┌──────────▼──────────┐
                                                    │  Verifiable          │
                                                    │  Credential (W3C)   │
                                                    │  → SEBI BRSR Report │
                                                    └─────────────────────┘
```

### The Five Layers

#### 1. 🔩 Edge Layer — IoT & Hiero Identity
Each physical sensor is assigned a **Hiero Decentralized Identifier (DID)** anchored to Hedera mainnet. This is the critical innovation: data provenance is proven at the hardware level. When a pH reading arrives, the Guardian knows it came from sensor `did:hedera:testnet:z6MkSENSOR_001` at pipe outlet A — not from a human typing a number into an ERP system.

#### 2. 🔐 Security Layer — AWS KMS
Every transaction submitted to Hedera is signed using an **AWS KMS Customer Master Key (CMK)** — a FIPS 140-2 Level 3 hardware security module. The factory's private key **never exists in plaintext, anywhere**. Every signing event is automatically logged to **AWS CloudTrail**, creating a dual audit trail:

- **AWS side:** *Who authorized this transaction, and when?*
- **Hedera side:** *What data was submitted, in what order, and has it ever changed?*

A SEBI auditor can independently verify both chains.

#### 3. 📡 Consensus Layer — Hedera HCS
Raw telemetry (pH, TDS, Flow) is hashed and streamed to a **Hedera Consensus Service topic** at up to 20 messages/second per factory. HCS provides:
- **Absolute finality in ~3 seconds** (no forks, no reorgs)
- **Cryptographic ordering** — sequence numbers prove no reading was deleted or reordered
- **Mirror node access** — any regulator can independently replay the entire stream

#### 4. 🧠 Policy Layer — Hedera Guardian
The Guardian runs the **"Water Stewardship Policy"** — a digitized version of CPCB IS:2490-Part-I standards. It automatically evaluates every HCS message against legal thresholds and manages the full compliance lifecycle without human intervention.

| Guardian Action | Trigger |
|---|---|
| Accumulate compliant readings | pH 6.5–8.5 AND TDS ≤ 2,100 mg/L |
| **Mint 1 WRT token** | 24 consecutive hours of clean readings |
| **Freeze Green Badge NFT** | Any single threshold breach |
| Emit Breach VC | Breach event → regulators notified |
| Unfreeze Badge | Next clean 24h window |

#### 5. 💧 Asset Layer — Hedera HTS
Verified compliance is crystallized into two **Hedera Token Service** assets:

- **WRT (Water Restoration Token):** A fungible HTS token. 1 WRT = 1 cryptographically-proven clean-water day. Tradable, bankable, and directly reportable in BRSR filings.
- **VGB (VORTEX Green Badge):** A soulbound NFT representing the factory's live compliance status. Frozen automatically on breach — visible to any investor or regulator querying the Hedera mirror node.

---

## 🚀 Key Differentiators

### Why TRITON, not Carbon?
Every other team in this hackathon is building a carbon credit platform. The carbon dMRV space is crowded, with established players (Toucan, Moss, Regen Network). **Industrial water quality verification is a genuine blue ocean** — no production-grade, on-chain solution exists for the Indian regulatory context.

### Why Now?
The SEBI BRSR Core "Reasonable Assurance" requirement for water is **live in FY2025-26**. This is not a future use case. The compliance deadline has passed. Companies are scrambling. TRITON is the only automated solution that meets the cryptographic evidence standard SEBI requires.

### The Dual Audit Trail Advantage
Traditional dMRV platforms have one immutable record (the blockchain). TRITON has two independent, cross-verifiable records: **Hedera HCS + AWS CloudTrail**. This exceeds the evidence standard of any existing ESG assurance framework — including the Big 4 consulting firms' manual methodologies.

---

## 💼 Business Model

**Target market:** India's top 1,000 SEBI-listed manufacturers with mandatory BRSR Core filing obligations.

**Pricing:** `$0.05` per cryptographic verification  
**Cadence:** 1 verification per sensor per 10 seconds = **8,640 verifications/sensor/day**  
**3-sensor factory ARR:** ~`$47,000/year`

**The incumbent cost:** ₹15–50 lakh for a manual water audit from a Big 4 firm — once a year, with no real-time data.  
**TRITON's cost:** ₹40,000/year — continuous, cryptographic, regulator-ready.

> *This is not a cost reduction. It is a category upgrade.*

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain Network** | Hedera Hashgraph (Hiero SDK) |
| **Consensus & TPS** | Hedera Consensus Service (HCS) |
| **Tokens** | Hedera Token Service (HTS) — Fungible + NFT |
| **Identity** | Hiero DID SDK — per-sensor verifiable identity |
| **dMRV Policy Engine** | Hedera Guardian v3.4 |
| **Key Management** | AWS KMS (FIPS 140-2 Level 3 HSM) |
| **Audit Trail** | AWS CloudTrail |
| **Cloud Infra** | AWS Lambda + IoT Core + CloudWatch |
| **Backend** | Node.js / TypeScript (ESM) |
| **Regulatory Standards** | CPCB IS:2490-Part-I · WHO Industrial Wastewater Guidelines · SEBI BRSR Core FY26 |

---

## 📦 Quick Start

### Prerequisites
- Node.js v20+
- Hedera Testnet account — [portal.hedera.com](https://portal.hedera.com)
- AWS account with a KMS CMK (key type: `ECC_NIST_P256` or `ED25519`)
- Hedera Guardian instance — [guardian.hedera.com](https://guardian.hedera.com)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/triton-hedera.git
cd triton-hedera
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in: HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, AWS_KMS_KEY_ARN
```

### 3. Register Sensor Identities (Hiero DIDs)
```bash
npm run register-dids
# Creates DIDs for Factory entity + Flow Meter + pH Sensor + TDS Analyzer
# Outputs: did-registry.json + env var values to paste into .env
```

### 4. Start the IoT Sensor Stream
```bash
npm run simulate-sensors
# Publishes KMS-signed readings to HCS at 2 msg/sec
# ~12% of readings simulate breaches to demonstrate Guardian policy enforcement
```

### 5. Load the Guardian Policy
Import `guardian/water-stewardship-policy.json` into your Guardian instance. Point the `hcsTopicId` field to your topic from step 4. The policy engine will begin auto-validating the stream immediately.

### 6. Open the Live Dashboard
```bash
open src/dashboard.html
# Real-time: pH/TDS gauges, HCS stream log, WRT mint counter, Badge freeze events
```

---

## 🏆 Bounty Alignment

### Sustainability Track
TRITON directly addresses the 2026 global industrial water crisis through automated dMRV. It creates a replicable model for any industrial parameter — air quality, chemical discharge, thermal pollution — demonstrating how Hedera can become the backbone of global environmental accountability infrastructure.

### AWS Bounty — Secure Key Management
TRITON implements the AWS bounty requirements in full:

- ✅ **AWS KMS** for secure key generation, storage, and rotation
- ✅ **Hedera transaction signing** without private key exposure
- ✅ **Access controls** via IAM policies (`kms:Sign` scoped to specific CMK ARN)
- ✅ **Audit logging** via AWS CloudTrail (every signing event immutably recorded)
- ✅ **Working prototype** with documented key management architecture

The `aws/kms-signer.js` module implements full DER→raw ECDSA conversion for Hedera SDK compatibility, with CloudTrail audit URL generation for the demo.

---

## 📁 Repository Structure

```
triton-hedera/
├── scripts/
│   ├── hcs-sensor-publisher.js   # IoT simulation + HCS stream (HMAC-signed)
│   └── register-dids.js          # Hiero DID creation for factory + sensors
├── aws/
│   └── kms-signer.js             # AWS KMS transaction signing (AWS Bounty)
├── guardian/
│   └── water-stewardship-policy.json  # Full Guardian dMRV policy (CPCB-aligned)
├── src/
│   └── dashboard.html            # Live monitoring UI for demo video
├── .env.example
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

| Phase | Milestone |
|---|---|
| **MVP (Hackathon)** | Simulated sensors · HCS stream · Guardian policy · WRT minting · KMS signing |
| **Pilot (Q3 2026)** | Deploy with 1 manufacturing partner in Himachal Pradesh · Real IoT hardware integration |
| **Scale (Q1 2027)** | Multi-factory support · CPCB API integration · SEBI-recognized assurance provider status |
| **Platform (2028)** | White-label for water utilities · Expand to BOD/COD parameters · Carbon + Water bundled credit |

---

## 👥 Team

**Nikhil** — Lead Developer & Architect, Himachal Pradesh, India

---

## 📄 License

Apache 2.0 — See [LICENSE](./LICENSE)

---

<div align="center">

*Built on Hedera. Secured by AWS. Demanded by SEBI.*

**TRITON — Where the pipe meets the proof.**

</div>
