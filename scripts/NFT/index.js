const CONTRACT_NAME = 'NFT';

const deploy = async () => {
  const NFT = await ethers.getContractFactory(CONTRACT_NAME);

  const nft = await NFT.deploy()

  await nft.deployed();

	console.log("Contract deployed to deployed to:", nft.address);

};

deploy()