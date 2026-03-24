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
 * Report a BREACH to the Live Smart Contract (0.0.8339707)
 */
async function reportBreachOnChain(metrics) {
    try {
        console.log("⚡ [ENFORCEMENT] Triggering On-Chain Slashing Protocol...");
        const registryId = process.env.HEDERA_WATER_REGISTRY_ID;
        
        const tx = new ContractExecuteTransaction()
            .setContractId(registryId)
            .setGas(100000)
            .setFunction("reportBreach", new ContractFunctionParameters()
                .addString("FACTORY_001") // Factory Name
                .addUint256(Math.floor(metrics.pH * 100)) // Scaled pH
                .addUint256(metrics.tds)
            );

        const response = await tx.execute(client);
        const receipt = await response.getReceipt(client);
        console.log(`✅ [LEDGER] Slashing Confirmed! Status: ${receipt.status.toString()}`);
    } catch (err) {
        console.error("❌ On-Chain Slashing Failed:", err.message);
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
        if (payload.pH < 6.5 || payload.pH > 8.5 || payload.tds > 2100) {
            status = 'BREACH';
            complianceState.isCompliant = false;
            complianceState.lastBreach = new Date().toISOString();
            complianceState.consecutiveCleanReadings = 0;
            
            // 🔥 REAL ACTION: Report to Hedera EVM Contract
            await reportBreachOnChain(payload);
        } else {
            complianceState.isCompliant = true;
            complianceState.consecutiveCleanReadings += 1;
            
            // 💎 REAL ACTION: Mint reward every 5 clean cycles
            if (complianceState.consecutiveCleanReadings % 5 === 0) {
                await mintRewardToken();
            }
        }

        const payloadBuffer = Buffer.from(JSON.stringify(payload));
        const kmsSignature = await kmsSigner.sign(payloadBuffer);
        const dataHash = crypto.createHash('sha256').update(payloadBuffer).digest('hex');

        const finalMessage = {
            ruling: status,
            metrics: payload,
            security: { hash: dataHash, kmsSignatureHex: kmsSignature.toString('hex') }
        };

        const txResponse = await new TopicMessageSubmitTransaction()
            .setTopicId(process.env.HCS_TOPIC_ID)
            .setMessage(JSON.stringify(finalMessage))
            .execute(client);

        const receipt = await txResponse.getReceipt(client);
        
        const txRecord = {
            seq: receipt.topicSequenceNumber.toString(),
            time: new Date().toISOString(),
            status: status,
            hash: dataHash,
            metrics: payload
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

