require('dotenv').config();
const { 
    Client, 
    PrivateKey, 
    ContractCreateFlow
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

async function deploySmartContract() {
    try {
        console.log("🌐 Compiling TRITON WaterRegistry Solidity Contract...");

        // 1. Compile the Solidity code with solc
        const contractPath = path.resolve(__dirname, '../contracts/WaterRegistry.sol');
        const sourceCode = fs.readFileSync(contractPath, 'utf8');

        // Configure compiler input
        const input = {
            language: 'Solidity',
            sources: {
                'WaterRegistry.sol': {
                    content: sourceCode
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*']
                    }
                }
            }
        };

        // Compile and extract ABI & Bytecode
        const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (compiledCode.errors) {
            console.error("Solidity compiler errors/warnings:", compiledCode.errors);
        }

        const contract = compiledCode.contracts['WaterRegistry.sol']['WaterRegistry'];
        const bytecode = contract.evm.bytecode.object; // Pass hex string directly
        const abi = contract.abi;

        console.log("✅ Compiled Successfully. Bytecode length:", bytecode.length);

        // 2. Set up the Hedera Network Client
        const client = Client.forTestnet();
        client.setOperator(
            process.env.HEDERA_ACCOUNT_ID,
            PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
        );

        // 3. Deploy to Hedera Smart Contract Service using ContractCreateFlow
        // The flow automatically handles file creation sizes larger than 4KB
        const contractCreate = new ContractCreateFlow()
            .setBytecode(bytecode)
            .setGas(4000000); // Increased Gas considerably for Hedera

        console.log("⏳ Processing deployment onto Hedera HSCS...");
        
        // Submit the deployment transaction
        const txResponse = await contractCreate.execute(client);
        
        // Wait for the receipt to get the newly generated Smart Contract ID
        const receipt = await txResponse.getReceipt(client);
        const newContractId = receipt.contractId;

        console.log(`🎉 SUCCESS! Deployed Contract onto LIVE Hedera EVM.`);
        console.log(`📜 Smart Contract ID: ${newContractId.toString()}`);
        console.log(`🔗 EVM Address: ${newContractId.toSolidityAddress()}`);
        
        // 4. Update the .env file so the backend Server can call this exact contract
        fs.appendFileSync('./.env', `\nHEDERA_WATER_REGISTRY_ID="${newContractId.toString()}"\n`);
        console.log("\n🔥 Saved HEDERA_WATER_REGISTRY_ID to your .env file.");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to deploy contract:", err);
        process.exit(1);
    }
}

deploySmartContract();
