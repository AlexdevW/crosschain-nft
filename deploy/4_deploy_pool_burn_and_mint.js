module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("NFTPoolBurnAndMint deploying...");
  let router;
  let linkTokenAddr;
  let wnftAddr;
  if (developmentChains.includes(network.name)) {
    const ccipSimulatorTx = await deployments.get("CCIPLocalSimulator");
    const ccipSimulator = await ethers.getContractAt(
      "CCIPLocalSimulator",
      ccipSimulatorTx.address
    );
    const ccipConfig = await ccipSimulator.configuration();
    router = ccipConfig.destinationRouter_;
    linkTokenAddr = ccipConfig.linkToken_;
  } else {
    router = networkConfig[network.config.chainId].router;
    linkTokenAddr = networkConfig[network.config.chainId].linkToken;
  }

  const wnftTx = await deployments.get("WrappedMyToken");
  wnftAddr = wnftTx.address;

  await deploy("NFTPoolBurnAndMint", {
    contract: "NFTPoolBurnAndMint",
    from: firstAccount,
    log: true,
    args: [router, linkTokenAddr, wnftAddr],
  });
  log("NFTPoolBurnAndMint contract deployed successfully");
};

module.exports.tags = ["destchain", "all"];
