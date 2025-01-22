// source chain - dest chain
// test if user can mint a nft from nft contract successfully
// test if user can lock the nft in the pool and send ccip message on source chain
// test if user can get a wrapped nft in dest chain
// dest chain -> source chain
// test if user can burn the wnft and send ccip message on dest chain
// test if user have the nft unlocked on source chain

const { expect } = require("chai");
const { getNamedAccounts, deployments } = require("hardhat");

let firstAccount;
let ccipSimulator;
let nft;
let nftPoolLockAndRelease;
let wnft;
let nftPoolBurnAndMint;
let chainSelector;

before(async function () {
  firstAccount = (await getNamedAccounts()).firstAccount;
  await deployments.fixture(['all']);
  ccipSimulator = await ethers.getContract("CCIPLocalSimulator", firstAccount);
  nft = await ethers.getContract("MyToken", firstAccount);
  nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease", firstAccount);
  wnft = await ethers.getContract("WrappedMyToken", firstAccount);
  nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", firstAccount);
  const config = await ccipSimulator.configuration();
  chainSelector = config.chainSelector_;
});

// contract a: func1 -> msg.sender
// contract b: func2 -> call func1
// call func1 msg.sender = user's address
// call func2 func1 msg.sender = contract b's address

describe("source chain -> dest chain tests", async function () {
    it("test if user can mint a nft from nft contract successfully", async function() {
        await nft.safeMint(firstAccount);
        const owner = await nft.ownerOf(0);
        expect(owner).to.equal(firstAccount);
    })

    it("test if user can lock the nft in the pool and send ccip message on source chain", async function() {
        await ccipSimulator.requestLinkFromFaucet(nftPoolLockAndRelease.target, ethers.parseEther('10'));
        await nft.approve(nftPoolLockAndRelease.target, 0);
        await nftPoolLockAndRelease.lockAndSendNFT(0, firstAccount, chainSelector, nftPoolBurnAndMint.target);
        const owner = await nft.ownerOf(0);
        expect(owner).to.equal(nftPoolLockAndRelease.target);
    })

    it("test if user can get a wrapped nft in dest chain", async function() {
        const owner = await wnft.ownerOf(0);
        expect(owner).to.equal(firstAccount);
    })
})

describe("dest chain -> source chain tests", async function () {
    it("test if user can burn the wnft and send ccip message on dest chai", async function() {
        await ccipSimulator.requestLinkFromFaucet(nftPoolBurnAndMint.target, ethers.parseEther('10'));
        await wnft.approve(nftPoolBurnAndMint.target, 0);
        await nftPoolBurnAndMint.burnAndSendNFT(0, firstAccount, chainSelector, nftPoolLockAndRelease.target);
        const totalSupply = await wnft.totalSupply();
        expect(totalSupply).to.equal(0);
    });

    it("test if user have the nft unlocked on source chain", async function() {
        const owner = await nft.ownerOf(0);
        expect(owner).to.equal(firstAccount);
    })
})
