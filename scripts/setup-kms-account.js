require('dotenv').config();
const { 
    Client, 
    PrivateKey, 
    PublicKey, 
    AccountCreateTransaction,
    Hbar
} = require('@hashgraph/sdk');
const { KMSClient, GetPublicKeyCommand } = require('@aws-sdk/client-kms');
const fs = require('fs');

async function createKmsControlledAccount() {
    try {
        console.log("🔥 TRITON ADVANCED: AWS KMS Hedera Account Generator 🔥");
        console.log("======================================================");
        
        // 1. Fetch the Public Key directly from AWS KMS
        console.log("📡 Fetching Public Key from AWS KMS module...");
        const kmsClient = new KMSClient({ region: process.env.AWS_REGION });
        const command = new GetPublicKeyCommand({ KeyId: process.env.AWS_KMS_KEY_ARN });
        const response = await kmsClient.send(command);
        
        // AWS returns DER encoded SubjectPublicKeyInfo. Hedera SDK expects raw bytes.
        // For P-256 SPKI, the actual raw key starts at offset 26 (uncompressed format 0x04 followed by x and y)
        // or we can safely parse it
        const crypto = require('crypto');
        const keyConfig = crypto.createPublicKey({ key: Buffer.from(response.PublicKey), format: 'der', type: 'spki' });
        const derSec1 = keyConfig.export({ format: 'der', type: 'spki' }); 
        
        let rawKeyBytes = derSec1.slice(26); 
        // Compress the uncompressed 65-byte key
        // 0x04 is uncompressed prefix
        if (rawKeyBytes[0] === 0x04) {
             const x = rawKeyBytes.slice(1, 33);
             const y = rawKeyBytes.slice(33, 65);
             const prefix = y[31] % 2 === 0 ? 0x02 : 0x03;
             rawKeyBytes = Buffer.concat([Buffer.from([prefix]), x]);
        }

        const kmsPublicKey = PublicKey.fromBytesECDSA(rawKeyBytes);
        console.log(`✅ Extracted KMS Public Key: ${kmsPublicKey.toString()}`);

        // 2. Create the Hedera Account using the Operator to pay the fee
        console.log("⏳ Creating a new Hedera Testnet Account controlled ONLY by AWS KMS...");
        const client = Client.forTestnet();
        client.setOperator(
            process.env.HEDERA_ACCOUNT_ID, 
            PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
        );

        const accountCreateTx = new AccountCreateTransaction()
            .setKey(kmsPublicKey)
            .setInitialBalance(new Hbar(5)) // Give it 5 HBAR for gas fees
            .setMaxAutomaticTokenAssociations(10); // Ready for WRT Tokens

        const txResponse = await accountCreateTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        const newAccountId = receipt.accountId;

        console.log(`🎉 SUCCESS! Created KMS-Controlled Account: ${newAccountId.toString()}`);
        console.log("⚠️ The private key for this account DOES NOT EXIST outside of AWS KMS.");
        
        // Append to .env automatically
        fs.appendFileSync('./.env', `\nKMS_HEDERA_ACCOUNT_ID="${newAccountId.toString()}"\nKMS_PUBLIC_KEY="${kmsPublicKey.toString()}"\n`);
        console.log("💾 Saved KMS_HEDERA_ACCOUNT_ID to your .env file.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to create KMS-controlled account:", err);
        process.exit(1);
    }
}

createKmsControlledAccount();
