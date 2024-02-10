require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
};

/*import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
import * as env from 'dotenv'

env.config()

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.8.9',
  settings: {
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const config = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    sepolia: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.INFURA_PRIVKEY || '']
    }
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
  },
  contractSizer: {
    alphaSort: false,
    disambiguatePaths: true,
    runOnCompile: false,
  },
  etherscan: {
    apiKey: { sepolia: process.env.ETHERSCAN_API_KEY || '' },
  },
  namedAccounts: {
    deployer: 0,
    user1: 1,
    user2: 2,
  },
}

if (process.env.ETHERSCAN_API_KEY) {
  config.etherscan = {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
}

export default config*/