import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } = await network.connect();

describe("EntryPoint - Voting Poll Creation", function () {
    let entryPoint: any;
    let merkleTreeAllowListContract: any;
    let syntheticRewardContract: any;
    let agaroERC20Contract: any;
    let deployer: any;

    beforeEach(async function () {
        [deployer] = await hardhatEthers.getSigners();
        merkleTreeAllowListContract = await hardhatEthers.deployContract("MerkleTreeAllowlist");
        syntheticRewardContract = await hardhatEthers.deployContract("SyntheticReward");
        agaroERC20Contract = await hardhatEthers.deployContract("AGARO");
        entryPoint = await hardhatEthers.deployContract("EntryPoint", [await merkleTreeAllowListContract.getAddress(), await syntheticRewardContract.getAddress(), await agaroERC20Contract.getAddress()]);
        await agaroERC20Contract.mint(await deployer.getAddress(), ethers.parseEther("100000"));
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(await entryPoint.getAddress()).to.be.properAddress;
        });

        it("Should have version initialized to 0", async function () {
            expect(await entryPoint.version()).to.equal(0);
        });
    });

    describe("Voting Poll Creation", function () {
        it("Should create a private voting poll without emitting VotingPollCreated event", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Private Voting Poll",
                description: "Only whitelisted voters can participate",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: true,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
            const receipt = await tx.wait();

            const hasEvent = receipt.logs.some((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            expect(hasEvent).to.be.false;

            expect(await entryPoint.version()).to.equal(1);
        });
        it("Should create a voting poll with specified candidates", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Test Voting Poll",
                description: "A test voting poll for testing purposes",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob", "Charlie"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            await expect(entryPoint.connect(deployer).newVotingPoll(pollData))
                .to.emit(entryPoint, "VotingPollCreated");
        });

        it("Should increment version after creating a poll", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Test Poll",
                description: "Test Description",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option A", "Option B"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            expect(await entryPoint.version()).to.equal(0);
            await entryPoint.connect(deployer).newVotingPoll(pollData);
            expect(await entryPoint.version()).to.equal(1);
        });

        it("Should create multiple polls with different candidate counts", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData1 = {
                versioning: await entryPoint.version(),
                title: "Poll 1",
                description: "First poll with 2 candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Yes", "No"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const pollData2 = {
                versioning: await entryPoint.version() + 1n,
                title: "Poll 2",
                description: "Second poll with 5 candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
                candidatesTotal: 5,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            await entryPoint.newVotingPoll(pollData1);
            await entryPoint.newVotingPoll(pollData2);

            expect(await entryPoint.version()).to.equal(2);
        });

        it("Should create poll with many candidates", async function () {
            const candidates = Array.from({ length: 10 }, (_, i) => `Candidate ${i + 1}`);
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Many Candidates Poll",
                description: "Poll with many candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: candidates,
                candidatesTotal: 10,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            await expect(entryPoint.connect(deployer).newVotingPoll(pollData))
                .to.emit(entryPoint, "VotingPollCreated");
        });

        it("Should create poll with zero candidates", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Zero Candidates Poll",
                description: "Poll with no candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: [],
                candidatesTotal: 0,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            await expect(entryPoint.connect(deployer).newVotingPoll(pollData))
                .to.emit(entryPoint, "VotingPollCreated");
        });

        it("Should create poll with maximum uint8 candidates", async function () {
            const candidates = Array.from({ length: 255 }, (_, i) => `Candidate ${i + 1}`);
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Max Candidates Poll",
                description: "Poll with maximum candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: candidates,
                candidatesTotal: 255,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            await expect(entryPoint.connect(deployer).newVotingPoll(pollData))
                .to.emit(entryPoint, "VotingPollCreated");
        });

        it("Should allow anyone to create voting polls", async function () {
            const [voter] = await hardhatEthers.getSigners();
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Public Poll",
                description: "Anyone can create polls",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Choice A", "Choice B", "Choice C"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            await expect(entryPoint.connect(voter).newVotingPoll(pollData))
                .to.emit(entryPoint, "VotingPollCreated");
        });

        it("Should create poll within reasonable gas limits", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Gas Test Poll",
                description: "Testing gas consumption",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
                candidatesTotal: 5,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
            const receipt = await tx.wait();

            expect(receipt?.gasUsed).to.be.lessThan(500000);
        });

        it("Should validate contract existence correctly", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Validation Test Poll",
                description: "Testing contract validation",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Candidate 1", "Candidate 2", "Candidate 3"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.connect(deployer).newVotingPoll(pollData);
            const receipt = await tx.wait();

            const event = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const pollHash = event?.topics[2];

            expect(await entryPoint.isContractValid(pollHash)).to.be.true;

            const nonExistentHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
            expect(await entryPoint.isContractValid(nonExistentHash)).to.be.false;
        });

        it("Should validate multiple polls correctly", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData1 = {
                versioning: await entryPoint.version(),
                title: "Poll 1",
                description: "First poll for validation",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Yes", "No"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const pollData2 = {
                versioning: await entryPoint.version() + 1n,
                title: "Poll 2",
                description: "Second poll for validation",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option A", "Option B", "Option C", "Option D"],
                candidatesTotal: 4,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx1 = await entryPoint.newVotingPoll(pollData1);
            const receipt1 = await tx1.wait();

            const tx2 = await entryPoint.newVotingPoll(pollData2);
            const receipt2 = await tx2.wait();

            const event1 = receipt1?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const event2 = receipt2?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash1 = event1?.topics[2];
            const pollHash2 = event2?.topics[2];

            expect(await entryPoint.isContractValid(pollHash1)).to.be.true;
            expect(await entryPoint.isContractValid(pollHash2)).to.be.true;

            expect(pollHash1).to.not.equal(pollHash2);
        });
    });
});