require('@typechain/hardhat');
require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy');
require('hardhat-contract-sizer');
require('solidity-coverage');
require("@nomicfoundation/hardhat-toolbox");

const env = require('dotenv');

env.config();

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.8.19',
  defaultNetwork: "sepolia",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
};

const config = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.INFURA_PRIVKEY],
    },
    vanguard: {
      url: `https://rpc-vanguard.vanarchain.com`,
      accounts: [process.env.INFURA_PRIVKEY],      
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
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }    
};

if (process.env.ETHERSCAN_API_KEY) {
  config.etherscan = {
    apiKey: process.env.ETHERSCAN_API_KEY,
  };
}

module.exports = config;
