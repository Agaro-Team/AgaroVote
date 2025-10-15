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
        await agaroERC20Contract.mint(voter1.address, ethers.parseEther("10"));
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
        const pollInfo = await entryPoint.getPollData(pollHash);

        // SyntheticReward contract should not be address(0)
        expect(pollInfo.syntheticRewardContract).to.not.equal(ethers.ZeroAddress);
    });

    it("Should revert when isTokenRequired = true but commitToken == 0", async function () {
        const now = Math.floor(Date.now() / 1000);
        const pollData = {
            versioning: await entryPoint.version(),
            title: "Token Required Poll",
            description: "Requires commit token to vote",
            merkleRootHash: ethers.ZeroHash,
            isPrivate: false,
            candidates: ["A", "B"],
            candidatesTotal: 2,
            expiry: {
                startDate: now,
                endDate: now + 3600,
            },
            rewardShare: 0,
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
            rewardShare: 0,
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
            commitToken: 1,
        };

        await expect(entryPoint.connect(voter1).vote(voteData))
            .to.emit(entryPoint, "VoteSucceeded");
    });
});
