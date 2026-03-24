require('dotenv').config();
const { Client, ContractExecuteTransaction, ContractFunctionParameters, PrivateKey } = require('@hashgraph/sdk');

async function main() {
    const client = Client.forTestnet();
    client.setOperator(process.env.HEDERA_ACCOUNT_ID, PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));

    try {
        console.log("🛠️ [SETUP] Registering FACTORY_001 on the WaterRegistry...");
        const registryId = process.env.HEDERA_WATER_REGISTRY_ID;
        
        const tx = await new ContractExecuteTransaction()
            .setContractId(registryId)
            .setGas(250000)
            .setPayableAmount(100) 
            .setFunction("registerFactory", new ContractFunctionParameters()
                .addString("FACTORY_001")
            )
            .execute(client);

        const receipt = await tx.getReceipt(client);
        console.log(`✅ [SETUP] Factory Registered! Status: ${receipt.status.toString()}`);
    } catch (err) {
        if (err.message.includes("Factory already registered")) {
            console.log("ℹ️ [SETUP] Factory is already registered. Skipping.");
        } else {
            console.error("❌ Registration Error:", err.message);
        }
    }
}

main();
