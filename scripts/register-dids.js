require('dotenv').config();
const { Client, PrivateKey } = require('@hashgraph/sdk');
const fs = require('fs');

/**
 * Registers DID (Decentralized Identifiers) for the Factory and its Sensors.
 * We'll simulate DID generation for the sake of the hackathon MVP.
 * In production, you would use an SDK like Hiero DID SDK to anchor it to HCS.
 */
async function registerDids() {
    try {
        console.log("🌊 TRITON Identity Registry 🌊");
        console.log("================================");

        // Simulated DID generation anchored to Hedera
        const generateDid = (entityName) => {
            const privateKey = PrivateKey.generateED25519();
            const publicKeyString = privateKey.publicKey.toStringRaw();
            // Prefixing with z6Mk for ed25519 public key in base58 (conceptual)
            const did = `did:hedera:testnet:z6Mk${publicKeyString.substring(0, 16)}`;
            
            console.log(`✅ Registered DID for [${entityName}]: ${did}`);
            return { did, privateKey: privateKey.toString() };
        };

        const factory = generateDid("Industrial Plant A");
        const sensorPh = generateDid("pH Analyzer (Outlet)");
        const sensorTds = generateDid("TDS Sensor (Outlet)");
        const sensorFlow = generateDid("Flow Meter (Main)");
        
        console.log("\n[INFO] Saving DID profiles to did-registry.json...");
        
        const registry = {
            factory,
            sensors: {
                pH: sensorPh,
                tds: sensorTds,
                flow: sensorFlow
            },
            timestamp: new Date().toISOString()
        };

        if(!fs.existsSync('./scripts')) {
             fs.mkdirSync('./scripts', { recursive: true });
        }
        
        fs.writeFileSync('./scripts/did-registry.json', JSON.stringify(registry, null, 2));

        console.log("\n[ACTION REQUIRED] Please update your .env file with the following DID values:");
        console.log(`DID_FACTORY="${factory.did}"`);
        console.log(`DID_SENSOR_PH="${sensorPh.did}"`);
        console.log(`DID_SENSOR_TDS="${sensorTds.did}"`);
        console.log(`DID_SENSOR_FLOW="${sensorFlow.did}"\n`);
        
    } catch (err) {
        console.error("❌ Failed to register DIDs:", err);
    }
}

registerDids();
