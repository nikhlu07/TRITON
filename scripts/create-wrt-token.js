require('dotenv').config();
const { 
    Client, 
    TokenCreateTransaction, 
    TokenType, 
    TokenSupplyType,
    PublicKey,
    PrivateKey
} = require('@hashgraph/sdk');
const { AwsKmsSigner } = require('../aws/kms-signer');
const fs = require('fs');

async function createToken() {
    try {
        console.log("💧 Creating Water Restoration Token (WRT) on Hedera...");

        const client = Client.forTestnet();
        // The KMS account will own and mint the token
        const kmsAccountId = process.env.KMS_HEDERA_ACCOUNT_ID?.replace(/"/g, '');
        const kmsPublicKeyStr = process.env.KMS_PUBLIC_KEY?.replace(/"/g, '');
        
        // We set the generic operator to pay the initial Token Creation fee
        // just to make it easier to deploy for the hackathon
        client.setOperator(
            process.env.HEDERA_ACCOUNT_ID,
            PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
        );

        const kmsPublicKey = PublicKey.fromStringECDSA(kmsPublicKeyStr);

        const tx = new TokenCreateTransaction()
            .setTokenName("Water Restoration Token")
            .setTokenSymbol("WRT")
            .setTokenType(TokenType.FungibleCommon)
            .setTreasuryAccountId(kmsAccountId)
            .setSupplyType(TokenSupplyType.Infinite)
            .setAdminKey(kmsPublicKey)
            .setSupplyKey(kmsPublicKey) // 👉 ONLY KMS CAN MINT
            .setDecimals(2)
            .freezeWith(client);

        const kmsSigner = new AwsKmsSigner(process.env.AWS_KMS_KEY_ARN, process.env.AWS_REGION);
        
        console.log("🔐 Requesting AWS KMS signature for HTS Token Creation...");
        
        // Use signWith which correctly handles signing across all node transactions
        await tx.signWith(kmsPublicKey, async (bytes) => {
            return await kmsSigner.sign(bytes);
        });
        
        // Finally the operator signs and pays the fee
        const fullySignedTx = await tx.sign(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
        
        const txResponse = await fullySignedTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        console.log(`✅ Success! Created WRT Token ID: ${receipt.tokenId.toString()}`);
        console.log("⚠️ This token can ONLY be minted by the AWS KMS HSM module.");
        
        fs.appendFileSync('./.env', `\nHEDERA_WRT_TOKEN_ID="${receipt.tokenId.toString()}"\n`);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to create WRT token:", err);
        process.exit(1);
    }
}

createToken();
