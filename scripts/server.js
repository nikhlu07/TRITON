require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { 
    Client, 
    TopicMessageSubmitTransaction, 
    PrivateKey, 
    ContractExecuteTransaction, 
    ContractFunctionParameters,
    TokenMintTransaction
} = require('@hashgraph/sdk');
const { AwsKmsSigner } = require('../aws/kms-signer');

const app = express();
app.use(cors());
app.use(express.json());

const client = Client.forTestnet();
client.setOperator(process.env.HEDERA_ACCOUNT_ID, PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));

const kmsSigner = new AwsKmsSigner(process.env.AWS_KMS_KEY_ARN, process.env.AWS_REGION);

// Global State
let complianceState = {
    factoryId: process.env.DID_FACTORY,
    isCompliant: true,
    lastBreach: null,
    totalWrtTokensMinted: 14,
    consecutiveCleanReadings: 0,
    recentTransactions: []
};

// --- REAL-TIME ENFORCEMENT ENGINE ---

/**
 * ⚡ [ENFORCEMENT] Record Telemetry & Slash if Breached
 * Hits the Live Smart Contract (0.0.8339707)
 */
async function reportOnChain(metrics, isCompliant, dataHash, signature) {
    try {
        const registryId = process.env.HEDERA_WATER_REGISTRY_ID;
        console.log(`⚡ [ENFORCEMENT] Syncing Compliance State On-Chain (0.0.8339707)...`);
        
        const tx = await new ContractExecuteTransaction()
            .setContractId(registryId)
            .setGas(1000000) // 🛡️ HIGH GAS for EVM array push + slashing transfer
            .setFunction("recordTelemetry", new ContractFunctionParameters()
                .addString("FACTORY_001") // factoryId
                .addString(dataHash)      // dataHash
                .addBool(isCompliant)      // isCompliant
                .addString(signature)     // kmsSignature
            )
            .execute(client);

        const receipt = await tx.getReceipt(client);
        console.log(`✅ [LEDGER] On-Chain Sync Confirmed! Status: ${receipt.status.toString()}`);
    } catch (err) {
        if (err.message.includes("Factory not registered")) {
            console.log("🛠️ [INITIAL SETUP] Registering Factory on Smart Contract Registry...");
            await registerFactoryOnChain();
        } else {
            console.error("❌ On-Chain Sync Failed:", err.message);
        }
    }
}

async function registerFactoryOnChain() {
    try {
        const tx = await new ContractExecuteTransaction()
            .setContractId(process.env.HEDERA_WATER_REGISTRY_ID)
            .setGas(200000)
            .setPayableAmount(100) // Minimum bond tinybars
            .setFunction("registerFactory", new ContractFunctionParameters()
                .addString("FACTORY_001")
            )
            .execute(client);
        await tx.getReceipt(client);
        console.log("✅ [LEDGER] Factory Registered! Bond Locked.");
    } catch (err) {
        console.error("❌ Registration Failed:", err.message);
    }
}

/**
 * Mint WRT Reward Token via AWS KMS Signed Transaction
 */
async function mintRewardToken() {
    try {
        console.log("💎 [REWARD] Minting 1 WRT Token via AWS KMS HSM...");
        const tokenId = process.env.HEDERA_WRT_TOKEN_ID;
        if (!tokenId) return;

        const tx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setAmount(1)
            .freezeWith(client);

        // KMS Signs the Minting Transaction
        await tx.signWith(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY), async (bytes) => {
            return await kmsSigner.sign(bytes);
        });

        const response = await tx.execute(client);
        await response.getReceipt(client);
        
        complianceState.totalWrtTokensMinted += 1;
        console.log(`✅ [LEDGER] Reward Token Minted to Factory Treasury.`);
    } catch (err) {
        console.error("❌ Token Minting Failed:", err.message);
    }
}

// --- ENDPOINTS ---

app.get('/api/status', (req, res) => {
    res.json(complianceState);
});

app.post('/api/sensor', async (req, res) => {
    try {
        const payload = req.body;
        let status = 'COMPLIANT';

        // 🛡️ Guardian Logic Engine (Apply Policy thresholds)
        const isCompliant = !(payload.pH < 6.5 || payload.pH > 8.5 || payload.tds > 2100);
        status = isCompliant ? 'COMPLIANT' : 'BREACH';

        if (!isCompliant) {
            complianceState.isCompliant = false;
            complianceState.lastBreach = new Date().toISOString();
            complianceState.consecutiveCleanReadings = 0;
        } else {
            complianceState.isCompliant = true;
            complianceState.consecutiveCleanReadings += 1;
        }

        // 🔐 Cryptographic Anchor (AWS KMS)
        const payloadBuffer = Buffer.from(JSON.stringify(payload));
        const kmsSignature = await kmsSigner.sign(payloadBuffer);
        const dataHash = crypto.createHash('sha256').update(payloadBuffer).digest('hex');
        const signatureHex = kmsSignature.toString('hex');

        // 🔥 REAL ACTION: Report to Hedera HCS Topic
        const topicId = process.env.HCS_TOPIC_ID;
        if (topicId) {
            const hcsMessage = {
                ruling: status,
                metrics: payload,
                security: { hash: dataHash, kmsSignature: signatureHex }
            };
            await new TopicMessageSubmitTransaction()
                .setTopicId(topicId)
                .setMessage(JSON.stringify(hcsMessage))
                .execute(client);
        }

        // 🏛️ REAL ACTION: Report to Hedera Smart Contract (Registry)
        await reportOnChain(payload, isCompliant, dataHash, signatureHex);

        // 💎 REAL ACTION: Reward Minting
        if (isCompliant && complianceState.consecutiveCleanReadings % 5 === 0) {
            await mintRewardToken();
        }

        const txRecord = {
            seq: "SYNC", // Mirror node will track seq
            time: new Date().toISOString(),
            status: status,
            hash: dataHash,
            metrics: payload,
            kmsSignature: signatureHex
        };
        
        complianceState.recentTransactions.unshift(txRecord);
        if (complianceState.recentTransactions.length > 20) complianceState.recentTransactions.pop();

        res.json({ success: true, transaction: txRecord });
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🔥 TRITON SecOps Backend running on port ${PORT}`);
    console.log(`AWS KMS HSM Integration Active | Real-Time Enforcement Loop Started`);
});

