# Tool Purpose
This tool was created to utilize the burnNFT instruction released in the [Metaplex Token Metadata Standard v1.3](https://docs.metaplex.com/programs/token-metadata/changelog/v1.3). You can use it to burn a bulk list of NFTs, and reclaim funds locked up in token, metadata and edition accounts. Keep in mind, once a token is burned, it's gone forever.

## Commands to install:

`git clone https://github.com/Swertin/BulkNftBurnTool.git`

`cd BulkNftBurnTool`

**Ensure you have the latest version of node.js**

*To install dependencies with yarn:*

`yarn`

*To install dependencies with npm:*

`npm i`


## To Setup:

Make a copy of .env-example, and name it as: .env

In the .env file, <br/>
Export your private key from Phantom.
<br/>**Note: This private key has to be the owner of the nfts that are being burned, otherwise the transaction will fail**

Paste the private key in the Treasury field of .env
<br/>e.g. `Treasury=pR1vA73KeYSd1237A...`

Paste your RPC in the RPC field of .env. 
<br/>e.g. `RPC=https://nodemonkey...`

Get a json hashlist array of the nfts that you want to burn, paste it in [line 145](https://github.com/Swertin/BulkNftBurnTool/blob/6be3a264689dda2e3dddf9389fba43425647414d/index.js#L145) after const hashlist = ...
<br/>e.g. `const hashlist = ["nftHash1","nftHash2", "nftHash3"];`


## To Run:

`node index.js`
