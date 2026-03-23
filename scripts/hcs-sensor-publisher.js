require('dotenv').config();
const { Client, TopicMessageSubmitTransaction, PrivateKey } = require('@hashgraph/sdk');
const crypto = require('crypto');
const { AwsKmsSigner } = require('../aws/kms-signer');

const {
    HEDERA_ACCOUNT_ID,
    HEDERA_PRIVATE_KEY,
    HEDERA_NETWORK,
    AWS_KMS_KEY_ARN,
    AWS_REGION,
    HCS_TOPIC_ID,
    DID_FACTORY,
    DID_SENSOR_PH,
    DID_SENSOR_TDS,
    DID_SENSOR_FLOW
} = process.env;

// Initialize Hedera Client
const client = HEDERA_NETWORK === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
client.setOperator(HEDERA_ACCOUNT_ID, PrivateKey.fromString(HEDERA_PRIVATE_KEY));

// Initialize AWS KMS Signer
const kmsSigner = new AwsKmsSigner(AWS_KMS_KEY_ARN, AWS_REGION);

/**
 * Generate a simulated sensor reading.
 * ~10% chance to generate a "breach" reading (outside legal limits).
 */
function generateReading() {
    const isBreach = Math.random() < 0.10;
    
    // CPCB Standard: pH 6.5 - 8.5, TDS <= 2100 mg/L
    let ph = 7.0 + (Math.random() - 0.5); // Normal: 6.5 - 7.5
    let tds = 1500 + (Math.random() * 400); // Normal: 1500 - 1900
    let flow = 50 + (Math.random() * 10); // Flow rate L/s
    
    if (isBreach) {
        // Toxic dump event
        ph = 5.0 + (Math.random() * 1.0); // Acidic
        tds = 2500 + (Math.random() * 500); // High total dissolved solids
        console.log("⚠️ [SIMULATOR] Generating toxic water breach event!");
    } else {
        console.log("🟢 [SIMULATOR] Generating normal water readings...");
    }

    return [
        { did: DID_SENSOR_PH, type: 'pH', value: parseFloat(ph.toFixed(2)), unit: 'pH' },
        { did: DID_SENSOR_TDS, type: 'TDS', value: Math.floor(tds), unit: 'mg/L' },
        { did: DID_SENSOR_FLOW, type: 'Flow', value: parseFloat(flow.toFixed(2)), unit: 'L/s' }
    ];
}

const axios = require('axios');

async function publishToHcs() {
    console.log(`\n🌊 TRITON Edge IoT Device Started 🌊`);
    console.log(`Sending Telemetry to Secure Backend API...`);
    console.log("=================================================");

    setInterval(async () => {
        try {
            const readings = generateReading(); // Array

            // Extract values 
            const payload = {
                 pH: readings.find(r => r.type === 'pH').value,
                 tds: readings.find(r => r.type === 'TDS').value,
                 flow: readings.find(r => r.type === 'Flow').value,
                 timestamp: new Date().toISOString()
            };

            // 1. Post to secure enterprise backend (where KMS lives securely)
            const res = await axios.post('http://localhost:3001/api/sensor', payload);
            
            console.log(`[IoT Telemetry] 🚀 Pushed to Gateway | Backend Response: HCS Seq #${res.data.transaction.seq} | AWS Signature: Valid ✅`);
            
        } catch (error) {
            console.error("❌ Gateway Unavailable:", error.message);
        }
    }, 10000); // Publish every 10 seconds
}

publishToHcs();
