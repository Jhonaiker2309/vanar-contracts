const CONTRACT_NAME = 'VanarRouletteHandler';

const deploy = async () => {
  const VanarRouletteHandler = await ethers.getContractFactory(CONTRACT_NAME);

  const vanarRouletteHandler = await VanarRouletteHandler.deploy()

  await vanarRouletteHandler.deployed();

	console.log("Contract deployed to deployed to:", vanarRouletteHandler.address);

};

deploy()