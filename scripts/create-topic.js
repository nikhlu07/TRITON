require('dotenv').config();
const { Client, TopicCreateTransaction, PrivateKey } = require('@hashgraph/sdk');

async function createTopic() {
    try {
        console.log("🌊 Creating HCS Topic for TRITON...");
        
        const accountId = process.env.HEDERA_ACCOUNT_ID?.replace(/"/g, '');
        const privateKeyStr = process.env.HEDERA_PRIVATE_KEY?.replace(/"/g, '');

        if (!accountId || !privateKeyStr) {
            throw new Error("Missing Hedera credentials in .env");
        }

        const operatorKey = PrivateKey.fromString(privateKeyStr);
        const client = Client.forTestnet();
        client.setOperator(accountId, operatorKey);

        const txResponse = await new TopicCreateTransaction()
            .setTopicMemo("TRITON Sensor Stream")
            .execute(client);
            
        const receipt = await txResponse.getReceipt(client);
        console.log(`✅ Success! New HCS Topic ID created: ${receipt.topicId}`);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to create topic:", err);
        process.exit(1);
    }
}

createTopic();
