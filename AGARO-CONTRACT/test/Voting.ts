import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";;

const { ethers: hardhatEthers } = await network.connect();

console.log("Generating 1000 addresses..")
const randomWallets = Array.from({ length: 999 }, () => ethers.Wallet.createRandom().address);

describe("EntryPoint - Voting Functionality", function () {
    let entryPoint: any;
    let merkleTreeAllowListContract: any;
    let syntheticRewardContract: any;
    let agaroERC20Contract: any;
    let voter1: any, voter2: any, voter3: any;

    beforeEach(async function () {
        [voter1, voter2, voter3] = await hardhatEthers.getSigners();
        merkleTreeAllowListContract = await hardhatEthers.deployContract("MerkleTreeAllowlist");
        syntheticRewardContract = await hardhatEthers.deployContract("SyntheticReward");
        agaroERC20Contract = await hardhatEthers.deployContract("AGARO");
        entryPoint = await hardhatEthers.deployContract("EntryPoint", [await merkleTreeAllowListContract.getAddress(), await syntheticRewardContract.getAddress(), await agaroERC20Contract.getAddress()]);
    });

    describe("Voting Poll Creation", function () {
        it("Should create a voting poll and bind voter storage", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Test Voting Poll",
                description: "A test voting poll for voting",
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

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const bindedEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "PollBinded";
                } catch {
                    return false;
                }
            });

            expect(votingPollEvent).to.not.be.undefined;
            expect(bindedEvent).to.not.be.undefined;

            const pollHash = votingPollEvent?.topics[2];

            expect(await entryPoint.isPollHaveVoterStorage(pollHash)).to.be.true;
        });

        it("Should initialize candidate vote counts to zero", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Vote Count Test",
                description: "Testing initial vote counts",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option A", "Option B", "Option C"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = votingPollEvent?.topics[2];
            const pollInfo = await entryPoint.getPollData(pollHash);

            expect(pollInfo.candidatesVotersCount[0].count).to.equal(0);
            expect(pollInfo.candidatesVotersCount[1].count).to.equal(0);
            expect(pollInfo.candidatesVotersCount[2].count).to.equal(0);
        });
    });

    describe("Voting Process", function () {
        let pollHash: string;

        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Voting Test Poll",
                description: "Poll for testing voting",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Yes", "No", "Maybe"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            pollHash = votingPollEvent?.topics[2];
        });

        it("Should allow a voter to vote for a candidate", async function () {
            const voteData = {
                pollHash: pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            expect(await entryPoint.connect(voter1).vote(voteData))
                .to.not.be.revert;

            const pollInfo = await entryPoint.getPollData(pollHash);
            expect(pollInfo.candidatesVotersCount[0].count).to.equal(1);
            expect(pollInfo.candidatesVotersCount[1].count).to.equal(0);
            expect(pollInfo.candidatesVotersCount[2].count).to.equal(0);
        });

        it("Should allow multiple voters to vote", async function () {
            await entryPoint.connect(voter1).vote({
                pollHash: pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            });

            await entryPoint.connect(voter2).vote({
                pollHash: pollHash,
                candidateSelected: 1,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            });

            await entryPoint.connect(voter3).vote({
                pollHash: pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            });

            const pollInfo = await entryPoint.getPollData(pollHash);
            expect(pollInfo.candidatesVotersCount[0].count).to.equal(2);
            expect(pollInfo.candidatesVotersCount[1].count).to.equal(1);
            expect(pollInfo.candidatesVotersCount[2].count).to.equal(0);
        });

        it("Should prevent voting for non-existent candidate", async function () {
            const voteData = {
                pollHash: pollHash,
                candidateSelected: 5,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "CandidateDoesNotExist")
                .withArgs(pollHash, 5);
        });

        it("Should prevent voting on non-existent poll", async function () {
            const nonExistentHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
            const voteData = {
                pollHash: nonExistentHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "PollHashDoesNotExist")
                .withArgs(nonExistentHash);
        });

        // it("Should allow voter to change their vote", async function () {

        //     await entryPoint.connect(voter1).vote({
        //         pollHash: pollHash,
        //         candidateSelected: 0,
        //         proofs: [ethers.ZeroHash]     
        //     });
        // 


        //     await entryPoint.connect(voter1).vote({
        //         pollHash: pollHash,
        //         candidateSelected: 1,
        //         proofs: [ethers.ZeroHash]     
        //     });
        // 


        //     const pollInfo = await entryPoint.getPollData(pollHash);

        //     expect(pollInfo.candidatesVotersCount[0].count).to.equal(0);
        //     expect(pollInfo.candidatesVotersCount[1].count).to.equal(1);
        //     expect(pollInfo.candidatesVotersCount[2].count).to.equal(0);
        // });

        it("Should track individual voter choices in storage", async function () {
            await entryPoint.connect(voter1).vote({
                pollHash: pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            });

            await entryPoint.connect(voter2).vote({
                pollHash: pollHash,
                candidateSelected: 1,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            });

            const pollInfo = await entryPoint.getPollData(pollHash);
            const storageLocation = pollInfo.voterStorageHashLocation;

            const voter1Data = await entryPoint.pollStorageVoters(storageLocation, voter1.address);
            const voter2Data = await entryPoint.pollStorageVoters(storageLocation, voter2.address);
            const voter3Data = await entryPoint.pollStorageVoters(storageLocation, voter3.address);

            expect(voter1Data.selected).to.equal(0);
            expect(voter1Data.isVoted).to.be.true;

            expect(voter2Data.selected).to.equal(1);
            expect(voter2Data.isVoted).to.be.true;

            expect(voter3Data.selected).to.equal(0);
            expect(voter3Data.isVoted).to.be.false;
        });
        it("Should prevent a voter from voting twice in the same poll", async function () {
            const now = Math.floor(Date.now() / 1000);

            const pollData = {
                versioning: await entryPoint.version(),
                title: "Double Vote Test",
                description: "Ensure voters cannot vote twice",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["A", "B", "C"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = votingPollEvent?.topics[2];
            expect(pollHash).to.not.be.undefined;

            const pollInfo = await entryPoint.getPollData(pollHash);
            const storageLocation = pollInfo.voterStorageHashLocation;

            expect(await
                entryPoint.connect(voter1).vote({
                    pollHash,
                    candidateSelected: 0,
                    proofs: [ethers.ZeroHash],
                    commitToken: 0
                })
            ).to.not.be.revert;

            await expect(
                entryPoint.connect(voter1).vote({
                    pollHash,
                    candidateSelected: 1,
                    proofs: [ethers.ZeroHash],
                    commitToken: 0
                })
            )
                .to.be.revertedWithCustomError(entryPoint, "AlreadyVoted")
                .withArgs(pollHash, storageLocation, voter1.address);

            const voterData = await entryPoint.pollStorageVoters(storageLocation, voter1.address);

            expect(voterData.selected).to.equal(0);
            expect(voterData.isVoted).to.be.true;
        });
        it("Should not allow non-whitelisted voter to vote using Merkle proofs", async function () {
            const whitelist = [...randomWallets, voter1.address];
            const leaves = whitelist.map(addr => keccak256(addr));
            const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            const root = tree.getHexRoot();
            const now = Math.floor(Date.now() / 1000);

            const pollData = {
                versioning: await entryPoint.version(),
                title: "Private Poll",
                description: "Merkle-based voting",
                merkleRootHash: root,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const proofs = tree.getHexProof(keccak256(voter1.address));

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();
            const votingPollEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = votingPollEvent?.topics[2];
            expect(pollHash).to.not.be.undefined;


            const voteData = {
                pollHash,
                candidateSelected: 1,
                proofs,
                commitToken: 0
            };

            await expect(entryPoint.connect(voter2).vote(voteData))
                .to.revertedWithCustomError(entryPoint, "AddressIsNotAllowed");
        });
        it("Should allow whitelisted voter to vote using Merkle proofs", async function () {
            const whitelist = [...randomWallets, voter1.address];
            const leaves = whitelist.map(addr => keccak256(addr));
            const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            const root = tree.getHexRoot();
            const now = Math.floor(Date.now() / 1000);

            const pollData = {
                versioning: await entryPoint.version(),
                title: "Private Poll",
                description: "Merkle-based voting",
                merkleRootHash: root,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const proofs = tree.getHexProof(keccak256(voter1.address));

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();
            const votingPollEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = votingPollEvent?.topics[2];
            expect(pollHash).to.not.be.undefined;


            const voteData = {
                pollHash,
                candidateSelected: 1,
                proofs,
                commitToken: 0
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.emit(entryPoint, "VoteSucceeded");
        });
    });


    describe("Edge Cases and Error Handling", function () {
        let pollHash: string;

        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Edge Case Poll",
                description: "Poll for testing edge cases",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Single Option"],
                candidatesTotal: 1,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            pollHash = votingPollEvent?.topics[2];
        });

        it("Should handle voting with minimum candidates (1)", async function () {
            const voteData = {
                pollHash: pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            expect(await entryPoint.connect(voter1).vote(voteData))
                .to.not.be.revert;

            const pollInfo = await entryPoint.getPollData(pollHash);
            expect(pollInfo.candidatesVotersCount[0].count).to.equal(1);
        });

        it("Should handle maximum uint8 candidate selection", async function () {
            const manyCandidates = Array.from({ length: 255 }, (_, i) => `Candidate ${i + 1}`);
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Max Candidates Poll",
                description: "Poll with maximum candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: manyCandidates,
                candidatesTotal: 255,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const maxPollHash = votingPollEvent?.topics[2];

            const voteData = {
                pollHash: maxPollHash,
                candidateSelected: 254,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            expect(await entryPoint.connect(voter1).vote(voteData))
                .to.not.be.revert;

            const pollInfo = await entryPoint.getPollData(maxPollHash);
            expect(pollInfo.candidatesVotersCount[254].count).to.equal(1);
        });

        it("Should handle empty poll gracefully", async function () {
            const now = Math.floor(Date.now() / 1000);
            const emptyPollData = {
                versioning: await entryPoint.version(),
                title: "Empty Poll",
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

            const tx = await entryPoint.newVotingPoll(emptyPollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const emptyPollHash = votingPollEvent?.topics[2];

            const voteData = {
                pollHash: emptyPollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "CandidateDoesNotExist")
                .withArgs(emptyPollHash, 0);
        });
    });

    describe("Gas Usage", function () {
        it("Should vote within reasonable gas limits", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Gas Test Poll",
                description: "Testing gas consumption for voting",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["A", "B", "C"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx1 = await entryPoint.newVotingPoll(pollData);
            const receipt1 = await tx1.wait();

            const votingPollEvent = receipt1?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = votingPollEvent?.topics[2];

            const voteData = {
                pollHash: pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            const tx2 = await entryPoint.connect(voter1).vote(voteData);
            const receipt2 = await tx2.wait();

            expect(receipt1?.gasUsed).to.be.lessThan(500000);
            expect(receipt2?.gasUsed).to.be.lessThan(200000);
        });
        it("Should revert if voting before startDate", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Early Voting Poll",
                description: "Voting should not be active yet",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now + 3600, // starts in 1 hour
                    endDate: now + 3600 * 24, // 1 day duration
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = votingPollEvent?.topics[2];
            expect(pollHash).to.not.be.undefined;

            const voteData = {
                pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "VotingIsNotActive")
                .withArgs(
                    pollHash,
                    pollData.expiry.startDate,
                    pollData.expiry.endDate
                );
        });

        it("Should revert if voting after endDate", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version(),
                title: "Expired Voting Poll",
                description: "Voting period has ended",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now - 7200, // started 2 hours ago
                    endDate: now - 3600,   // ended 1 hour ago
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            const tx = await entryPoint.newVotingPoll(pollData);
            const receipt = await tx.wait();

            const votingPollEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPollCreated";
                } catch {
                    return false;
                }
            });

            const pollHash = votingPollEvent?.topics[2];
            expect(pollHash).to.not.be.undefined;

            const voteData = {
                pollHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
                commitToken: 0
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "VotingIsNotActive")
                .withArgs(
                    pollHash,
                    pollData.expiry.startDate,
                    pollData.expiry.endDate
                );
        });
        it("Should revert if version does not match", async function () {
            const now = Math.floor(Date.now() / 1000);
            const pollData = {
                versioning: await entryPoint.version() + 1n,
                title: "Expired Voting Poll",
                description: "Voting period has ended",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600,
                },
                rewardShare: 0,
                isTokenRequired: false
            };

            await expect(entryPoint.newVotingPoll(pollData))
                .to.be.revertedWithCustomError(entryPoint, "VersioningError")
                .withArgs(
                    1
                );

        });
    });
});