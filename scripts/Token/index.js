const CONTRACT_NAME = 'Token';

const deploy = async () => {
  const Token = await ethers.getContractFactory(CONTRACT_NAME);

  const token = await Token.deploy()

  await token.deployed();

	console.log("Contract deployed to deployed to:", token.address);

};

deploy()