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

**In the .env file:**<br/>

Export your private key from Phantom.
<br/>**Note: This private key has to be the owner of the nfts that are being burned, otherwise the transaction will fail**

Paste the private key in the Treasury field of .env
<br/>*e.g.* `Treasury=pR1vA73KeYSd1237A...`

Paste your RPC in the RPC field of .env. 
<br/>*e.g.* `RPC=https://nodemonkey...`

Get a json hashlist array of the nfts that you want to burn, paste it into `hashList.json`, matching the array bracket formatting
<br/>*e.g.* https://github.com/Swertin/BulkNftBurnTool/blob/c5f548f72371e57c0f8f3deb8e0ba7f6bbf67ae1/hashList.json#L1-L5


## To Run:

`node index.js`
