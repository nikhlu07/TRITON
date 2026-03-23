require('dotenv').config();
const { KMSClient, SignCommand } = require('@aws-sdk/client-kms');
const crypto = require('crypto');

/**
 * Custom signer for Hedera SDK that uses AWS KMS.
 * This satisfies the AWS Bounty requirement.
 * The private key never leaves the AWS KMS Hardware Security Module (HSM).
 */
class AwsKmsSigner {
    constructor(keyId, region = 'us-east-1') {
        this.keyId = keyId;
        this.kmsClient = new KMSClient({ region });
    }

    /**
     * Signs a message (transaction bytes) using AWS KMS.
     * @param {Uint8Array} message - The bytes to sign.
     * @returns {Promise<Uint8Array>} - The signature.
     */
    async sign(message) {
        try {
            // Hedera expects the raw signature for ED25519 or ECDSA (secp256k1).
            // This example assumes an ECC_NIST_P256 or ED25519 key in KMS.
            // We hash the message first if using ECDSA, or pass raw if ED25519 depending on KMS config.
            
            // For general Hedera ECDSA, we need to hash the message first
            const hash = crypto.createHash('sha256').update(message).digest();

            const command = new SignCommand({
                KeyId: this.keyId,
                Message: hash,
                MessageType: 'DIGEST', // We pass the hash
                SigningAlgorithm: 'ECDSA_SHA_256', // Adjusted for ECC_NIST_P256
            });

            const response = await this.kmsClient.send(command);
            
            // AWS KMS returns a DER-encoded signature. Hedera SDK requires the raw r and s values for ECDSA.
            // Converting DER to Raw (r, s format for Hedera)
            const rawSignature = this._derToRawEcdsa(response.Signature);
            
            return rawSignature;
        } catch (error) {
            console.error("Error signing with AWS KMS:", error);
            throw error;
        }
    }

    /**
     * Converts a DER-encoded ECDSA signature to raw r|s format expected by Hedera
     */
    _derToRawEcdsa(derSignature) {
        // Simple DER parser for ECDSA (expects sequence of two integers r and s)
        const der = Buffer.from(derSignature);
        let offset = 0;
        
        if (der[offset++] !== 0x30) throw new Error("Invalid DER signature format");
        const seqLength = der[offset++];
        
        if (der[offset++] !== 0x02) throw new Error("Expected integer r");
        let rLength = der[offset++];
        const r = der.slice(offset, offset + rLength);
        offset += rLength;
        
        if (der[offset++] !== 0x02) throw new Error("Expected integer s");
        let sLength = der[offset++];
        const s = der.slice(offset, offset + sLength);

        // Strip leading zero if present (DER padding for positive integers)
        const cleanR = r[0] === 0 ? r.slice(1) : r;
        const cleanS = s[0] === 0 ? s.slice(1) : s;

        // Pad to 32 bytes or 48 bytes depending on curve length
        // Assuming P-256 for this demo, so 32 bytes each
        const paddedR = Buffer.alloc(32);
        const paddedS = Buffer.alloc(32);
        
        cleanR.copy(paddedR, 32 - cleanR.length);
        cleanS.copy(paddedS, 32 - cleanS.length);

        return Buffer.concat([paddedR, paddedS]);
    }

    getCloudTrailUrl() {
        return `https://console.aws.amazon.com/cloudtrail/home?region=${this.kmsClient.config.region}#/events?EventName=Sign`;
    }
}

module.exports = { AwsKmsSigner };
