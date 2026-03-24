require('dotenv').config();
const { 
    Client, 
    TopicCreateTransaction, 
    TopicMessageSubmitTransaction, 
    PrivateKey 
} = require('@hashgraph/sdk');
const fs = require('fs');

async function anchorDids() {
    try {
        console.log("🌊 TRITON On-Chain Identity Anchor 🌊");
        console.log("================================");

        const client = Client.forTestnet();
        client.setOperator(
            process.env.HEDERA_ACCOUNT_ID,
            PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
        );

        // 1. Create a dedicated HCS Topic for Identity (HIP-172)
        console.log("Creating Identity Topic on Hedera HCS...");
        const topicTx = await new TopicCreateTransaction()
            .setTopicMemo("TRITON Industrial Identity Registry")
            .execute(client);
        
        const topicReceipt = await topicTx.getReceipt(client);
        const topicId = topicReceipt.topicId.toString();
        
        console.log(`✅ Identity Topic Created: ${topicId}`);

        // 2. Read the local registry
        const registry = JSON.parse(fs.readFileSync('./scripts/did-registry.json', 'utf8'));
        
        const entities = [
            { id: registry.factory.did, name: "Industrial Plant A", type: "FACTORY" },
            { id: registry.sensors.pH.did, name: "pH_SENSOR_01", type: "SENSOR" },
            { id: registry.sensors.tds.did, name: "TDS_SENSOR_01", type: "SENSOR" },
            { id: registry.sensors.flow.did, name: "FLOW_SENSOR_01", type: "SENSOR" }
        ];

        // 3. Anchoring DID Documents to the Topic
        // This makes the identity "Public" and "Verifiable"
        for (const entity of entities) {
            const didDocument = {
                "@context": "https://www.w3.org/ns/did/v1",
                "id": entity.id,
                "type": entity.type,
                "name": entity.name,
                "controller": `did:hedera:testnet:${process.env.HEDERA_ACCOUNT_ID}`,
                "service": [{
                    "id": `${entity.id}#registry`,
                    "type": "ComplianceRegistry",
                    "serviceEndpoint": "https://triton-web.vercel.app/audit"
                }]
            };

            console.log(`📡 Anchoring DID document for [${entity.name}]...`);
            
            const submitTx = await new TopicMessageSubmitTransaction()
                .setTopicId(topicId)
                .setMessage(JSON.stringify(didDocument))
                .execute(client);
            
            await submitTx.getReceipt(client);
        }

        console.log("\n✅ All DIDs are now anchored On-Chain!");
        console.log(`Updating .env with HCS_IDENTITY_TOPIC_ID="${topicId}"`);
        
        fs.appendFileSync('./.env', `\nHCS_IDENTITY_TOPIC_ID="${topicId}"\n`);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Identity Anchoring Failed:", err);
        process.exit(1);
    }
}

anchorDids();
