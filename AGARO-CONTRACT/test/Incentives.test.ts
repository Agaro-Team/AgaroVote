import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } = await network.connect();

describe("EntryPoint - AgaroTierSystem Public Integration", function () {
    let entryPoint: any;
    let merkleTreeAllowListContract: any;
    let syntheticRewardContract: any;
    let agaroERC20Contract: any;
    let deployer: any, voter1: any;

    beforeEach(async function () {
        [deployer, voter1] = await hardhatEthers.getSigners();

        merkleTreeAllowListContract = await hardhatEthers.deployContract("MerkleTreeAllowlist");
        syntheticRewardContract = await hardhatEthers.deployContract("SyntheticReward");
        agaroERC20Contract = await hardhatEthers.deployContract("AGARO");

        entryPoint = await hardhatEthers.deployContract("EntryPoint", [
            await merkleTreeAllowListContract.getAddress(),
            await syntheticRewardContract.getAddress(),
            await agaroERC20Contract.getAddress(),
        ]);
        await entryPoint.waitForDeployment();

        await agaroERC20Contract.mint(await deployer.getAddress(), ethers.parseEther("100000"));
        await agaroERC20Contract.mint(await voter1.getAddress(), ethers.parseEther("1000"));
    });
    describe("Access Control", function () {
        it("Should revert when non-admin tries to update tier", async function () {
            await expect(
                entryPoint.connect(voter1).updateTier(3, 25, ethers.parseEther("1500"), 4)
            ).to.be.revertedWith("Not admin");
        });
    });

    describe("Successful Tier Update", function () {
        it("Should update an existing tier’s parameters correctly", async function () {
            const tierBefore = await entryPoint.tiers(3);

            const newDiscount = 35;
            const newMinHold = ethers.parseEther("2000");
            const newMaxPerDay = 10;

            expect(await entryPoint.connect(deployer).updateTier(3, newDiscount, newMinHold, newMaxPerDay))
                .to.not.be.revert;

            const tierAfter = await entryPoint.tiers(3);

            expect(tierAfter.discount).to.equal(newDiscount);
            expect(tierAfter.minHoldAGR).to.equal(newMinHold);
            expect(tierAfter.maxPollingPerDay).to.equal(newMaxPerDay);

            expect(tierAfter.discount).to.not.equal(tierBefore.discount);
            expect(tierAfter.minHoldAGR).to.not.equal(tierBefore.minHoldAGR);
        });

        it("Should revert when trying to update tier outside 1–10", async function () {
            await expect(
                entryPoint.connect(deployer).updateTier(0, 10, ethers.parseEther("100"), 2)
            ).to.be.revertedWith("Tier must be 1-10");

            await expect(
                entryPoint.connect(deployer).updateTier(11, 10, ethers.parseEther("100"), 2)
            ).to.be.revertedWith("Tier must be 1-10");
        });
    });

    describe("Integration Checks", function () {
        it("Should use updated tier values for canCreatePoll", async function () {
            const newMaxPerDay = 2;
            const minHold = ethers.parseEther("1000");

            await entryPoint.connect(deployer).updateTier(3, 15, minHold, newMaxPerDay);

            await agaroERC20Contract.mint(voter1.address, ethers.parseEther("1000"));
            await agaroERC20Contract.connect(voter1).approve(await entryPoint.getAddress(), ethers.parseEther("1000"));

            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Tier Update Poll",
                description: "Test tier update effect",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["A", "B"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 86400,
                },
                rewardShare: 0,
                isTokenRequired: false,
            };
            pollData.versioning = await entryPoint.version();
            await entryPoint.connect(voter1).newVotingPoll(pollData);
            pollData.versioning = await entryPoint.version();
            await entryPoint.connect(voter1).newVotingPoll(pollData);

            pollData.versioning = await entryPoint.version();
            await expect(entryPoint.connect(voter1).newVotingPoll(pollData))
                .to.be.revertedWith("Exceeded max create poll");
        });
    });

    describe("Admin setters inherited from AgaroTierSystem", function () {
        it("Should allow admin to update platform fee, minHold, and base incentives", async function () {
            await entryPoint.setPlatformFee(ethers.parseEther("1"));
            expect(await entryPoint.platformFee()).to.equal(ethers.parseEther("1"));

            await entryPoint.setMinHold(1000);
            expect(await entryPoint.minHold()).to.equal(1000);

            const newBase = { tier1: 75, tier5: 150, tier10: 300 };
            await entryPoint.setBaseIncentives(newBase);
            const updated = await entryPoint.baseIncentives();
            expect(updated.tier1).to.equal(75);
            expect(updated.tier10).to.equal(300);
        });
    });

    describe("Poll creation behavior (canCreatePoll + _recordPollCreation)", function () {
        it("Should allow poll creation when below tier limit", async function () {

            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Daily Poll Test",
                description: "Can create within limits",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["A", "B"],
                candidatesTotal: 2,
                expiry: { startDate: now, endDate: now + 3600 },
                rewardShare: 0,
                isTokenRequired: false,
            };

            for (let i = 0; i < 3; i++) {
                pollData.versioning = await entryPoint.version();
                await expect(entryPoint.connect(voter1).newVotingPoll(pollData))
                    .to.emit(entryPoint, "VotingPollCreated");
            }
            pollData.versioning = await entryPoint.version();
            await expect(entryPoint.connect(voter1).newVotingPoll(pollData))
                .to.be.revertedWith("Exceeded max create poll");
        });

        it("Should reset poll creation after 24 hours", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Reset Poll Limit",
                description: "After 24h user can create again",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["A", "B"],
                candidatesTotal: 2,
                expiry: { startDate: now, endDate: now + 3600 },
                rewardShare: 0,
                isTokenRequired: false,
            };

            for (let i = 0; i < 3; i++) {
                pollData.versioning = await entryPoint.version();
                await entryPoint.connect(voter1).newVotingPoll(pollData);
            }

            await hardhatEthers.provider.send("evm_increaseTime", [86400 + 1]);
            await hardhatEthers.provider.send("evm_mine");

            pollData.versioning = await entryPoint.version();
            await expect(entryPoint.connect(voter1).newVotingPoll(pollData))
                .to.emit(entryPoint, "VotingPollCreated");
        });
    });

    describe("Mint incentives via newVotingPoll", function () {
        it("Should mint incentives to SyntheticReward contract based on duration and hold", async function () {
            const now = Math.floor(Date.now() / 1000);

            const rewardShare = ethers.parseEther("1000");

            const pollData = {
                versioning: await entryPoint.version(),
                title: "Incentive Poll",
                description: "Check mint incentives integration",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["X", "Y"],
                candidatesTotal: 2,
                expiry: { startDate: now, endDate: now + 2592000 * 6 }, // 6 months
                rewardShare,
                isTokenRequired: true,
            };

            const tx = await entryPoint.connect(voter1).newVotingPoll(pollData);
            const receipt = await tx.wait();

            const event = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = event?.topics[2];
            const pollInfo = await entryPoint.getPollData(pollHash);

            expect(pollInfo.syntheticRewardContract).to.not.equal(ethers.ZeroAddress);

            const syntheticAddr = pollInfo.syntheticRewardContract;

            const total = await agaroERC20Contract.balanceOf(syntheticAddr);
            expect(total).to.be.gt(rewardShare);
        });
    });
});
