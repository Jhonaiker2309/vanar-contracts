const fs = require('fs');
const { ethers } = require('hardhat');

const baseUri = "https://vanar-backend.vercel.app/metadata/";

const nftContracts = [
    { name: "Vanar Voucher Gold", symbol: "VG", uri: `${baseUri}vanarGold` },
    { name: "Jackpot $10k", symbol: "JP10K", uri: `${baseUri}platinumVanar10k` },
    { name: "Jackpot $1k", symbol: "JP1K", uri: `${baseUri}platinumVanar1k` },
    { name: "PVP Voucher Gold", symbol: "PVP", uri: `${baseUri}pvpGold` },
    { name: "AuriSwap Voucher Gold", symbol: "ASG", uri: `${baseUri}auriSwapGold` },
    { name: "AuriSwap Voucher Silver", symbol: "ASS", uri: `${baseUri}auriSwapSilver` },
    { name: "Bazaa Voucher Gold", symbol: "BG", uri: `${baseUri}bazaaGold` },
    { name: "Bazaa Voucher Silver", symbol: "BS", uri: `${baseUri}bazaaSilver` },
    { name: "Bazaa VIP Pass Silver", symbol: "BSVIP", uri: `${baseUri}baazaSilverLaunchpad` },
    { name: "Maians Website Voucher Silver", symbol: "MS", uri: `${baseUri}maiansSilver` },
    { name: "Maians Website Voucher Gold", symbol: "MG", uri: `${baseUri}maiansGold` },
    { name: "Nitro League NFT Silver", symbol: "NLS", uri: `${baseUri}nitroCardSilver` },
    { name: "Nitro League NFT Gold", symbol: "NLG", uri: `${baseUri}nitroCardGold` },
    { name: "SpaceID NFT Gold", symbol: "SIG", uri: `${baseUri}spaceIdGold` }
];

const deploy = async () => {
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("Deploying contracts with the account:", deployerAddress);

    const deployedContracts = [];

    // Deploy VanarRouletteHandler contract
    const VanarRouletteHandler = await ethers.getContractFactory('VanarRouletteHandler');
    const vanarRouletteHandler = await VanarRouletteHandler.deploy();
    await vanarRouletteHandler.deployed();
    console.log("VanarRouletteHandler deployed to:", vanarRouletteHandler.address);

    deployedContracts.push({
        name: 'VanarRouletteHandler',
        symbol: "",
        address: vanarRouletteHandler.address
    });

    // Deploy NFT contracts and transfer ownership to VanarRouletteHandler
    for (const contract of nftContracts) {
        const NFTContract = await ethers.getContractFactory("RouletteNFT");
        const deployedContract = await NFTContract.deploy(contract.name, contract.symbol, contract.uri, vanarRouletteHandler.address, deployerAddress);
        await deployedContract.deployed();
        console.log(`${contract.name} deployed to:`, deployedContract.address);

        deployedContracts.push({
            name: contract.name,
            symbol: contract.symbol,
            address: deployedContract.address
        });

        // Mint a new token for each contract (if necessary)
        // await deployedContract.mint(deployerAddress);
    }

    // Save the deployed contracts info to a file
    fs.writeFileSync('deployedContracts.json', JSON.stringify(deployedContracts, null, 2));
    console.log('Deployment info saved to deployedContracts.json');
};

deploy();

