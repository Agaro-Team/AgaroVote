import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } = await network.connect();

describe("SyntheticReward - Staking and Reward Distribution", function () {
    let syntheticReward: any;
    let token: any;
    let owner: any;
    let user: any;

    const REWARD_SHARE = ethers.parseEther("1000");
    const DURATION = 60 * 60 * 24 * 7;

    beforeEach(async function () {
        [owner, user] = await hardhatEthers.getSigners();

        const Token = await hardhatEthers.getContractFactory("AGARO");
        token = await Token.deploy();
        await token.waitForDeployment();

        await token.mint(owner.address, ethers.parseEther("10000"));
        await token.mint(user.address, ethers.parseEther("5000"));

        const SyntheticReward = await hardhatEthers.getContractFactory("SyntheticReward");
        syntheticReward = await SyntheticReward.deploy();
        await syntheticReward.waitForDeployment();

        await syntheticReward.initialize(
            owner.address,
            await token.getAddress(),
            DURATION,
            REWARD_SHARE
        );

        await token.transfer(await syntheticReward.getAddress(), ethers.parseEther("2000"));
    });

    describe("Deployment", function () {
        it("Should deploy and initialize successfully", async function () {
            expect(await syntheticReward.duration()).to.equal(DURATION);
        });

        it("Should have owner set correctly", async function () {
            expect(await syntheticReward.owner()).to.equal(owner.address);
        });
    });

    describe("Commit (Stake)", function () {
        it("Should allow owner to commit tokens on behalf of user", async function () {
            const amount = ethers.parseEther("1000");
            const beforeBalance = await token.balanceOf(user.address);

            await syntheticReward.commit(amount, user.address);

            const stake = await syntheticReward.balanceOf(user.address);
            expect(stake).to.equal(amount);

            const total = await syntheticReward.totalSupply();
            expect(total).to.equal(amount);

            const afterBalance = await token.balanceOf(user.address);
            expect(afterBalance).to.equal(beforeBalance - amount);
        });

        it("Should revert if amount is zero", async function () {
            await expect(
                syntheticReward.commit(0, user.address)
            ).to.be.revertedWithCustomError(syntheticReward, "AmountZero");
        });
    });

    describe("Withdraw", function () {
        it("Should allow owner to withdraw all user tokens", async function () {
            const amount = ethers.parseEther("1000");
            await syntheticReward.commit(amount, user.address);

            await hardhatEthers.provider.send("evm_increaseTime", [86400 * 7]);
            await hardhatEthers.provider.send("evm_mine");

            const before = await syntheticReward.balanceOf(user.address);
            expect(before).to.equal(amount);

            await syntheticReward.withdraw(user.address);

            const after = await syntheticReward.balanceOf(user.address);
            expect(after).to.equal(0n);
        });

        it("Should revert if user has no tokens to withdraw", async function () {
            await expect(
                syntheticReward.withdraw(user.address)
            ).to.be.revertedWithCustomError(syntheticReward, "AmountZero");
        });
    });

    describe("Reward Calculation", function () {
        it("Should calculate earned rewards correctly after some time", async function () {
            const amount = ethers.parseEther("1000");
            await syntheticReward.commit(amount, user.address);

            await hardhatEthers.provider.send("evm_increaseTime", [86400 * 2]); // 1 day
            await hardhatEthers.provider.send("evm_mine");

            const earned = await syntheticReward.earned(user.address);
            expect(earned).to.be.gt(0n);
        });

        it("Should update rewards properly on multiple commits", async function () {
            const amount1 = ethers.parseEther("500");
            const amount2 = ethers.parseEther("1500");

            await syntheticReward.commit(amount1, user.address);
            await syntheticReward.commit(amount2, user.address);

            const stake = await syntheticReward.balanceOf(user.address);
            expect(stake).to.equal(amount1 + amount2);
        });

        it("Should stop increasing rewards after the staking duration has ended", async function () {
            const amount = ethers.parseEther("1000");
            await syntheticReward.commit(amount, user.address);

            const finishAt = await syntheticReward.finishAt();

            const currentBlock = await hardhatEthers.provider.getBlock("latest");
            const jumpTime = Number(finishAt) - currentBlock!.timestamp + 86400;
            await hardhatEthers.provider.send("evm_increaseTime", [jumpTime]);
            await hardhatEthers.provider.send("evm_mine");

            const earnedAfterFinish = await syntheticReward.earned(user.address);
            expect(earnedAfterFinish).to.be.gt(0n);

            await hardhatEthers.provider.send("evm_increaseTime", [2 * 86400]);
            await hardhatEthers.provider.send("evm_mine");

            const earnedLater = await syntheticReward.earned(user.address);

            const diff = earnedLater - earnedAfterFinish;
            expect(diff).to.be.lt(ethers.parseEther("0.0001"));
        });
    });

    describe("Reward Rate and Duration", function () {
        it("Should revert if reward rate is zero", async function () {
            const NewSyntheticReward = await hardhatEthers.getContractFactory("SyntheticReward");
            const newContract = await NewSyntheticReward.deploy();
            await newContract.waitForDeployment();

            await expect(
                newContract.initialize(owner.address, await token.getAddress(), 0, REWARD_SHARE)
            ).to.be.revertedWithCustomError(newContract, "InvalidInitialization");
        });

        it("Should update reward parameters correctly", async function () {
            const duration = await syntheticReward.duration();
            const finishAt = await syntheticReward.finishAt();
            const rate = await syntheticReward.rewardRate();

            expect(rate).to.be.gt(0n);
            expect(finishAt).to.be.gt(0n);
            expect(duration).to.equal(DURATION);
        });
    });

    describe("Access Control", function () {
        it("Should only allow owner to commit", async function () {
            const amount = ethers.parseEther("1000");
            await expect(
                syntheticReward.connect(user).commit(amount, user.address)
            ).to.be.revertedWithCustomError(syntheticReward, "OwnableUnauthorizedAccount");
        });

        it("Should only allow owner to withdraw", async function () {
            const amount = ethers.parseEther("1000");
            await syntheticReward.commit(amount, user.address);
            await expect(
                syntheticReward.connect(user).withdraw(user.address)
            ).to.be.revertedWithCustomError(syntheticReward, "OwnableUnauthorizedAccount");
        });
    });

    describe("Reward Claiming", function () {
        it("Should distribute rewards correctly when withdrawing", async function () {
            const amount = ethers.parseEther("1000");
            await syntheticReward.commit(amount, user.address);

            await hardhatEthers.provider.send("evm_increaseTime", [86400 * 7]); // 2 days
            await hardhatEthers.provider.send("evm_mine");

            const earnedBefore = await syntheticReward.earned(user.address);
            expect(earnedBefore).to.be.gt(0n);

            await syntheticReward.withdraw(user.address);

            const earnedAfter = await syntheticReward.earned(user.address);
            expect(earnedAfter).to.equal(0n);
        });
    });
});
