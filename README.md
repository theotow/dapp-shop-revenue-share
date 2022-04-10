# Revenue share for shops

This dapp allows to share the revenue a online shop generates with the shoppers.

Shoppers which spend a lot are rewarded more.

Shoppers earn cash back rewards on every purchase.

Shoppers can transfer their reward "cards". Since those are NFTs. (not implemented)

Usage:

1. Payments must be done with USDCx (superfluid super token)
2. To receive payments you must approve the subscription in [https://app.superfluid.finance/dashboard](https://app.superfluid.finance/dashboard) -> see Distribution section

Powered by: [https://www.superfluid.finance/home](https://www.superfluid.finance/home)

Not implemented yet:

- NFT transfer (backend)
- Show how much cashback can be received on purchase (backend + frontend)

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app
