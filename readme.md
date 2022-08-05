Commands to install:

git clone 

cd burnFullNftTool

Ensure you have the latest version of node.js

To install dependencies with yarn:

yarn

To install dependencies with npm:

npm i


To Setup:

Make a copy of .env-example, and name it as: .env

Export private key from Phantom, paste it directly into Treasury as "Treasury=pR1vA73KeYSd1237A..."

Paste your RPC directly into RPC as "RPC=https://quicknode..."

Get a json hashlist array of the nfts that you want to burn, paste it in line 145 after const hashlist =, e.g. "const hashlist = ["nftHash1","nftHash2", "nftHash3"];

To Run:

node index.js