import { run } from "hardhat";

const CONTRACT_NAME = 'VanarNFTHandler';

const deploy = async ({getNamedAccounts, deployments}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const vanarNFTHandler = await deploy(CONTRACT_NAME, {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
  });

    await run("verify:verify", {
        address: vanarNFTHandler.address,
    })
};

deploy()