const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("NFTPoolLockAndRelease deploying...");

  //   const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
  //   const ccipSimulator = await ethers.getContractAt(
  //     "CCIPLocalSimulator",
  //     ccipSimulatorDeployment.address
  //   );
  //   const ccipConfig = await ccipSimulator.configuration();
  //   const sourceChainRouter = ccipConfig.sourceRouter_;
  //   const linkTokenAddr = ccipConfig.linkToken_;
  //   const nftDeployment = await deployments.get("MyToken");
  //   const nftAddr = nftDeployment.address;

  let sourceChainRouter
  let linkToken
  let nftAddr
  if(developmentChains.includes(network.name)) {
    const ccipSimulatorTx = await deployments.get("CCIPLocalSimulator")
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorTx.address)
    const ccipSimulatorConfig = await ccipSimulator.configuration()
    sourceChainRouter = ccipSimulatorConfig.sourceRouter_
    linkToken = ccipSimulatorConfig.linkToken_       
    log(`local environment: sourcechain router: ${sourceChainRouter}, link token: ${linkToken}`) 
  } else {
    // get router and linktoken based on network
    sourceChainRouter = networkConfig[network.config.chainId].router
    linkToken = networkConfig[network.config.chainId].linkToken
    log(`non local environment: sourcechain router: ${sourceChainRouter}, link token: ${linkToken}`)
  }
  
  const nftTx = await deployments.get("MyToken")
  nftAddr = nftTx.address
  log(`NFT address: ${nftAddr}`)

  await deploy("NFTPoolLockAndRelease", {
    contract: "NFTPoolLockAndRelease",
    from: firstAccount,
    log: true,
    args: [sourceChainRouter, linkToken, nftAddr],
  });
  log("NFTPoolLockAndRelease contract deployed successfully");
};

module.exports.tags = ["destchain", "all"];
