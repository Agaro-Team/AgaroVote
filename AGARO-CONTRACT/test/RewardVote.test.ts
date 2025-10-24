import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } = await network.connect();

describe("EntryPoint - Extended Functionality", function () {
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

        await agaroERC20Contract.mint(deployer.address, ethers.parseEther("10000"));
        await agaroERC20Contract.mint(voter1.address, ethers.parseEther("10000"));
    });

    it("Should initialize candidatesVotersCount with zeroed structs", async function () {
        const now = Math.floor(Date.now() / 1000);
        const pollData = {
            versioning: await entryPoint.version(),
            title: "Zero Init Poll",
            description: "Check candidate structs are initialized properly",
            merkleRootHash: ethers.ZeroHash,
            isPrivate: false,
            candidates: ["A", "B", "C"],
            candidatesTotal: 3,
            expiry: {
                startDate: now,
                endDate: now + 86400,
            },
            rewardShare: 0,
            isTokenRequired: false,
        };

        const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
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

        expect(pollInfo.candidatesVotersCount.length).to.equal(3);
        for (const candidate of pollInfo.candidatesVotersCount) {
            expect(candidate.count).to.equal(0);
            expect(candidate.commitToken).to.equal(0);
        }
    });

    it("Should deploy a SyntheticReward contract when rewardShare > 0", async function () {
        const now = Math.floor(Date.now() / 1000);
        const rewardShare = ethers.parseEther("500");

        const pollData = {
            versioning: await entryPoint.version(),
            title: "Reward Poll",
            description: "Should create synthetic reward contract",
            merkleRootHash: ethers.ZeroHash,
            isPrivate: false,
            candidates: ["A", "B"],
            candidatesTotal: 2,
            expiry: {
                startDate: now,
                endDate: now + 3600 * 24,
            },
            rewardShare,
            isTokenRequired: false,
        };

        const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
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
    });

    it("Should revert when isTokenRequired = true but commitToken == 0", async function () {
        const currentBlock = await hardhatEthers.provider.getBlock("latest");
        const jumpTime = currentBlock!.timestamp + 86400;
        const pollData = {
            versioning: await entryPoint.version(),
            title: "Token Required Poll",
            description: "Requires commit token to vote",
            merkleRootHash: ethers.ZeroHash,
            isPrivate: false,
            candidates: ["A", "B"],
            candidatesTotal: 2,
            expiry: {
                startDate: currentBlock!.timestamp,
                endDate: jumpTime,
            },
            rewardShare: ethers.parseEther("1"),
            isTokenRequired: true,
        };

        const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
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
        const voteData = {
            pollHash,
            candidateSelected: 0,
            proofs: [ethers.ZeroHash],
            commitToken: 0, // Missing commit token
        };

        await expect(entryPoint.connect(voter1).vote(voteData))
            .to.be.revertedWithCustomError(entryPoint, "PollNeedsCommitToken")
            .withArgs(pollHash, 0);
    });

    it("Should allow voting when token requirement is met", async function () {
        const now = Math.floor(Date.now() / 1000);
        const pollData = {
            versioning: await entryPoint.version(),
            title: "Token Voting OK",
            description: "Vote with commit token succeeds",
            merkleRootHash: ethers.ZeroHash,
            isPrivate: false,
            candidates: ["A", "B"],
            candidatesTotal: 2,
            expiry: {
                startDate: now,
                endDate: now + 3600 * 24,
            },
            rewardShare: ethers.parseEther("1"),
            isTokenRequired: true,
        };

        const tx = await entryPoint.newVotingPoll(pollData);
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

        const voteData = {
            pollHash,
            candidateSelected: 0,
            proofs: [ethers.ZeroHash],
            commitToken: ethers.parseEther("500"),
        };

        await expect(entryPoint.connect(voter1).vote(voteData))
            .to.emit(entryPoint, "VoteSucceeded");
    });
    describe("SyntheticReward Integration via EntryPoint", function () {
        it("Should allow staking and reward distribution via EntryPoint (commit through vote and withdraw)", async function () {
            const now = Math.floor(Date.now() / 1000);
            const rewardShare = ethers.parseEther("1000");

            const pollData = {
                versioning: await entryPoint.version(),
                title: "Integrated Reward Distribution Poll",
                description: "Users stake and withdraw via EntryPoint only",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["X", "Y"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 86400, // 1 day duration
                },
                rewardShare,
                isTokenRequired: true, // Require commit tokens
            };

            const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
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
            const syntheticRewardAddr = pollInfo[4];
            expect(syntheticRewardAddr).to.not.equal(ethers.ZeroAddress);

            const voteData = {
                pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: ethers.parseEther("1000"),
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.emit(entryPoint, "VoteSucceeded");

            const SyntheticReward = await hardhatEthers.getContractFactory("SyntheticReward");
            const syntheticReward = SyntheticReward.attach(syntheticRewardAddr);

            const staked = await syntheticReward.balanceOf(voter1.address);
            expect(staked).to.equal(ethers.parseEther("1000"));

            await hardhatEthers.provider.send("evm_increaseTime", [86400]);
            await hardhatEthers.provider.send("evm_mine");

            const earnedBefore = await syntheticReward.earned(voter1.address);
            expect(earnedBefore).to.be.gt(0n);

            await entryPoint.connect(voter1).withdraw(pollHash);

            const afterStake = await syntheticReward.balanceOf(voter1.address);
            expect(afterStake).to.equal(0n);

            const earnedAfter = await syntheticReward.earned(voter1.address);
            expect(earnedAfter).to.equal(0n);
        });
        it("Should restrict direct SyntheticReward access but allow commit/withdraw via EntryPoint", async function () {
            const now = Math.floor(Date.now() / 1000);
            const rewardShare = ethers.parseEther("1000");

            const pollData = {
                versioning: await entryPoint.version(),
                title: "Access Control Poll",
                description: "SyntheticReward can only be used by EntryPoint",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["X", "Y"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now + 86400,
                    endDate: now + 86400 * 2,
                },
                rewardShare,
                isTokenRequired: true,
            };

            const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
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
            const syntheticRewardAddr = pollInfo[4];

            const SyntheticReward = await hardhatEthers.getContractFactory("SyntheticReward");
            const syntheticReward = SyntheticReward.attach(syntheticRewardAddr);

            await expect(
                syntheticReward.connect(voter1).commit(ethers.parseEther("100"), voter1.address)
            ).to.be.revertedWithCustomError(syntheticReward, "OwnableUnauthorizedAccount");

            await expect(
                syntheticReward.connect(voter1).withdraw(voter1.address)
            ).to.be.revertedWithCustomError(syntheticReward, "OwnableUnauthorizedAccount");

            const voteData = {
                pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: ethers.parseEther("100"),
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.emit(entryPoint, "VoteSucceeded");

            const staked = await syntheticReward.balanceOf(voter1.address);
            expect(staked).to.equal(ethers.parseEther("100"));

            await hardhatEthers.provider.send("evm_increaseTime", [86400 * 3]);
            await hardhatEthers.provider.send("evm_mine");

            await entryPoint.connect(voter1).withdraw(pollHash);

            const afterStake = await syntheticReward.balanceOf(voter1.address);
            expect(afterStake).to.equal(0n);
        });
        it("Should revert withdraw if called before finishAt", async function () {
            const blockNumber = await hardhatEthers.provider.getBlockNumber();
            const block = await hardhatEthers.provider.getBlock(blockNumber);

            const now = block!.timestamp;

            const rewardShare = ethers.parseEther("500");

            const pollData = {
                versioning: await entryPoint.version(),
                title: "Early Withdraw Revert Poll",
                description: "Ensure withdraw cannot happen before finishAt",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["X", "Y"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 86400, // 1 day
                },
                rewardShare,
                isTokenRequired: true,
            };

            const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
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
            const syntheticRewardAddr = pollInfo[4];

            const SyntheticReward = await hardhatEthers.getContractFactory("SyntheticReward");
            const syntheticRewardContract = SyntheticReward.attach(syntheticRewardAddr);

            const voteData = {
                pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: ethers.parseEther("100"),
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.emit(entryPoint, "VoteSucceeded");

            await expect(entryPoint.connect(voter1).withdraw(pollHash))
                .to.be.revertedWithCustomError(syntheticRewardContract, "ContractNotFinished");
        });
    });
});
