#!/bin/bash
# ----------------------------------------------------
# TRITON EC2 PRODUCTION SETUP (Ubuntu/Amazon Linux)
# ----------------------------------------------------

echo "🌊 Initializing TRITON Oracle Infrastructure..."

# 1. Setup Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2 globally to keep the server alive
sudo npm install -g pm2

# 3. Install dependencies
npm install

# 4. Security Note
echo "⚡ [IMPORTANT] ENSURE YOU HAVE CREATED AN IAM ROLE WITH KMS ACCESS AND ATTACHED IT TO THIS INSTANCE."
echo "⚡ You can then remove AWS_ACCESS_KEY_ID from your .env for enterprise-grade security."

# 5. Start the backend with PM2
pm2 start scripts/server.js --name triton-oracle

# 6. Setup PM2 to restart on system reboot
pm2 startup
pm2 save

echo "🔥 TRITON Oracle is now LIVE on port 3001."
