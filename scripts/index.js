const CONTRACT_NAME = 'VanarNFTHandler';

const deploy = async () => {
  const VanarNFTHandler = await ethers.getContractFactory(CONTRACT_NAME);

  const vanarNFTHandler = await VanarNFTHandler.deploy()

  await vanarNFTHandler.deployed();

	console.log("Contract deployed to deployed to:", vanarNFTHandler.address);

};

deploy()