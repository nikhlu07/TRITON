require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { Client, TopicMessageSubmitTransaction, PrivateKey } = require('@hashgraph/sdk');
const { AwsKmsSigner } = require('../aws/kms-signer');

const app = express();
app.use(cors());
app.use(express.json());

const HCS_TOPIC_ID = process.env.HCS_TOPIC_ID;
const client = Client.forTestnet();
client.setOperator(process.env.HEDERA_ACCOUNT_ID, PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));

const kmsSigner = new AwsKmsSigner(process.env.AWS_KMS_KEY_ARN, process.env.AWS_REGION);

// Simulated In-Memory Compliance State for Demo
let complianceState = {
    factoryId: process.env.DID_FACTORY,
    isCompliant: true,
    lastBreach: null,
    totalWrtTokensMinted: 14,
    recentTransactions: []
};

// Express API: Fetch overall compliance status
app.get('/api/status', (req, res) => {
    res.json(complianceState);
});

// Express API: Ingest data from sensors & process dMRV securely using AWS KMS
app.post('/api/sensor', async (req, res) => {
    try {
        const payload = req.body; // { pH, tds, flow }
        
        let status = 'COMPLIANT';
        if (payload.pH < 6.5 || payload.pH > 8.5 || payload.tds > 2100) {
            status = 'BREACH';
            complianceState.isCompliant = false;
            complianceState.lastBreach = new Date().toISOString();
        }

        // 1. Backend securely signs the ruling with AWS KMS
        const payloadBuffer = Buffer.from(JSON.stringify(payload));
        const kmsSignature = await kmsSigner.sign(payloadBuffer);
        const dataHash = crypto.createHash('sha256').update(payloadBuffer).digest('hex');

        // 2. Wrap AWS validation inside the Hedera transaction
        const finalMessage = {
            ruling: status,
            metrics: payload,
            security: {
                hash: dataHash,
                kmsSignatureHex: kmsSignature.toString('hex'),
                kmsArn: process.env.AWS_KMS_KEY_ARN
            }
        };

        // 3. Submit to Hedera HCS
        const txResponse = await new TopicMessageSubmitTransaction()
            .setTopicId(HCS_TOPIC_ID)
            .setMessage(JSON.stringify(finalMessage))
            .execute(client);

        const receipt = await txResponse.getReceipt(client);
        
        const txRecord = {
            seq: receipt.topicSequenceNumber.toString(),
            time: new Date().toISOString(),
            status: status,
            hash: dataHash,
            kmsSignature: kmsSignature.toString('hex').slice(0, 16) + '...',
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
    console.log(`AWS KMS HSM Integration Active | HCS Topic: ${HCS_TOPIC_ID}`);
});
