import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";;

const { ethers: hardhatEthers } = await network.connect();

describe("EntryPoint - Voting Functionality", function () {
    let entryPoint: any;
    let merkleAllowListContract: any;
    let owner: any, voter1: any, voter2: any, voter3: any;

    beforeEach(async function () {
        [voter1, voter2, voter3, owner] = await hardhatEthers.getSigners();
        merkleAllowListContract = await hardhatEthers.deployContract("MerkleAllowlist");
        entryPoint = await hardhatEthers.deployContract("EntryPoint", [await merkleAllowListContract.getAddress()]);
    });

    describe("Voting Pool Creation", function () {
        it("Should create a voting pool and bind voter storage", async function () {
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
                title: "Test Voting Pool",
                description: "A test voting pool for voting",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob", "Charlie"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const bindedEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "PoolBinded";
                } catch {
                    return false;
                }
            });

            expect(votingPoolEvent).to.not.be.undefined;
            expect(bindedEvent).to.not.be.undefined;

            const poolHash = votingPoolEvent?.topics[2];

            expect(await entryPoint.isPoolHaveVoterStorage(poolHash)).to.be.true;
        });

        it("Should initialize candidate vote counts to zero", async function () {
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
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
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash = votingPoolEvent?.topics[2];
            const poolInfo = await entryPoint.getPoolData(poolHash);

            expect(poolInfo.candidatesVotersCount[0]).to.equal(0);
            expect(poolInfo.candidatesVotersCount[1]).to.equal(0);
            expect(poolInfo.candidatesVotersCount[2]).to.equal(0);
        });
    });

    describe("Voting Process", function () {
        let poolHash: string;

        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
                title: "Voting Test Pool",
                description: "Pool for testing voting",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Yes", "No", "Maybe"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            poolHash = votingPoolEvent?.topics[2];
        });

        it("Should allow a voter to vote for a candidate", async function () {
            const voteData = {
                poolHash: poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            };

            expect(await entryPoint.connect(voter1).vote(voteData))
                .to.not.be.revert;

            const poolInfo = await entryPoint.getPoolData(poolHash);
            expect(poolInfo.candidatesVotersCount[0]).to.equal(1);
            expect(poolInfo.candidatesVotersCount[1]).to.equal(0);
            expect(poolInfo.candidatesVotersCount[2]).to.equal(0);
        });

        it("Should allow multiple voters to vote", async function () {
            await entryPoint.connect(voter1).vote({
                poolHash: poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            });

            await entryPoint.connect(voter2).vote({
                poolHash: poolHash,
                candidateSelected: 1,
                proofs: [ethers.ZeroHash]
            });

            await entryPoint.connect(voter3).vote({
                poolHash: poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            });

            const poolInfo = await entryPoint.getPoolData(poolHash);
            expect(poolInfo.candidatesVotersCount[0]).to.equal(2);
            expect(poolInfo.candidatesVotersCount[1]).to.equal(1);
            expect(poolInfo.candidatesVotersCount[2]).to.equal(0);
        });

        it("Should prevent voting for non-existent candidate", async function () {
            const voteData = {
                poolHash: poolHash,
                candidateSelected: 5,
                proofs: [ethers.ZeroHash]
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "CandidateDoesNotExist")
                .withArgs(poolHash, 5);
        });

        it("Should prevent voting on non-existent pool", async function () {
            const nonExistentHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
            const voteData = {
                poolHash: nonExistentHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "PoolHashDoesNotExist")
                .withArgs(nonExistentHash);
        });

        // it("Should allow voter to change their vote", async function () {

        //     await entryPoint.connect(voter1).vote({
        //         poolHash: poolHash,
        //         candidateSelected: 0,
        //         proofs: [ethers.ZeroHash]     
        //     });
        // 


        //     await entryPoint.connect(voter1).vote({
        //         poolHash: poolHash,
        //         candidateSelected: 1,
        //         proofs: [ethers.ZeroHash]     
        //     });
        // 


        //     const poolInfo = await entryPoint.getPoolData(poolHash);

        //     expect(poolInfo.candidatesVotersCount[0]).to.equal(0);
        //     expect(poolInfo.candidatesVotersCount[1]).to.equal(1);
        //     expect(poolInfo.candidatesVotersCount[2]).to.equal(0);
        // });

        it("Should track individual voter choices in storage", async function () {
            await entryPoint.connect(voter1).vote({
                poolHash: poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            });

            await entryPoint.connect(voter2).vote({
                poolHash: poolHash,
                candidateSelected: 1,
                proofs: [ethers.ZeroHash]
            });

            const poolInfo = await entryPoint.getPoolData(poolHash);
            const storageLocation = poolInfo.voterStorageHashLocation;

            const voter1Data = await entryPoint.poolStorageVoters(storageLocation, voter1.address);
            const voter2Data = await entryPoint.poolStorageVoters(storageLocation, voter2.address);
            const voter3Data = await entryPoint.poolStorageVoters(storageLocation, voter3.address);

            expect(voter1Data.selected).to.equal(0);
            expect(voter1Data.isVoted).to.be.true;

            expect(voter2Data.selected).to.equal(1);
            expect(voter2Data.isVoted).to.be.true;

            expect(voter3Data.selected).to.equal(0);
            expect(voter3Data.isVoted).to.be.false;
        });
        it("Should prevent a voter from voting twice in the same pool", async function () {
            const now = Math.floor(Date.now() / 1000);

            const poolData = {
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
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash = votingPoolEvent?.topics[2];
            expect(poolHash).to.not.be.undefined;

            const poolInfo = await entryPoint.getPoolData(poolHash);
            const storageLocation = poolInfo.voterStorageHashLocation;

            expect(await
                entryPoint.connect(voter1).vote({
                    poolHash,
                    candidateSelected: 0,
                    proofs: [ethers.ZeroHash]
                })
            ).to.not.be.revert;

            await expect(
                entryPoint.connect(voter1).vote({
                    poolHash,
                    candidateSelected: 1,
                    proofs: [ethers.ZeroHash]
                })
            )
                .to.be.revertedWithCustomError(entryPoint, "AlreadyVoted")
                .withArgs(poolHash, storageLocation, voter1.address);

            const voterData = await entryPoint.poolStorageVoters(storageLocation, voter1.address);

            expect(voterData.selected).to.equal(0);
            expect(voterData.isVoted).to.be.true;
        });
        it("Should not allow non-whitelisted voter to vote using Merkle proofs", async function () {
            const whitelist = [owner.address, voter1.address, voter2.address];
            const leaves = whitelist.map(addr => keccak256(addr));
            const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            const root = tree.getHexRoot();
            const now = Math.floor(Date.now() / 1000);

            const poolData = {
                title: "Private Pool",
                description: "Merkle-based voting",
                merkleRootHash: root,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const proofs = tree.getHexProof(keccak256(voter1.address));

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();
            const votingPoolEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash = votingPoolEvent?.topics[2];
            expect(poolHash).to.not.be.undefined;


            const voteData = {
                poolHash,
                candidateSelected: 1,
                proofs,
            };

            await expect(entryPoint.connect(voter3).vote(voteData))
                .to.revertedWithCustomError(entryPoint, "AddressIsNotAllowed");
        });
        it("Should allow whitelisted voter to vote using Merkle proofs", async function () {
            const whitelist = [owner.address, voter1.address, voter2.address];
            const leaves = whitelist.map(addr => keccak256(addr));
            const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            const root = tree.getHexRoot();
            const now = Math.floor(Date.now() / 1000);

            const poolData = {
                title: "Private Pool",
                description: "Merkle-based voting",
                merkleRootHash: root,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const proofs = tree.getHexProof(keccak256(voter1.address));

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();
            const votingPoolEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash = votingPoolEvent?.topics[2];
            expect(poolHash).to.not.be.undefined;


            const voteData = {
                poolHash,
                candidateSelected: 1,
                proofs,
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.emit(entryPoint, "VoteSucceeded");
        });
    });


    describe("Edge Cases and Error Handling", function () {
        let poolHash: string;

        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
                title: "Edge Case Pool",
                description: "Pool for testing edge cases",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Single Option"],
                candidatesTotal: 1,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            poolHash = votingPoolEvent?.topics[2];
        });

        it("Should handle voting with minimum candidates (1)", async function () {
            const voteData = {
                poolHash: poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            };

            expect(await entryPoint.connect(voter1).vote(voteData))
                .to.not.be.revert;

            const poolInfo = await entryPoint.getPoolData(poolHash);
            expect(poolInfo.candidatesVotersCount[0]).to.equal(1);
        });

        it("Should handle maximum uint8 candidate selection", async function () {
            const manyCandidates = Array.from({ length: 255 }, (_, i) => `Candidate ${i + 1}`);
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
                title: "Max Candidates Pool",
                description: "Pool with maximum candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: manyCandidates,
                candidatesTotal: 255,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const maxPoolHash = votingPoolEvent?.topics[2];

            const voteData = {
                poolHash: maxPoolHash,
                candidateSelected: 254,
                proofs: [ethers.ZeroHash]
            };

            expect(await entryPoint.connect(voter1).vote(voteData))
                .to.not.be.revert;

            const poolInfo = await entryPoint.getPoolData(maxPoolHash);
            expect(poolInfo.candidatesVotersCount[254]).to.equal(1);
        });

        it("Should handle empty pool gracefully", async function () {
            const now = Math.floor(Date.now() / 1000);
            const emptyPoolData = {
                title: "Empty Pool",
                description: "Pool with no candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: [],
                candidatesTotal: 0,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const tx = await entryPoint.newVotingPool(emptyPoolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const emptyPoolHash = votingPoolEvent?.topics[2];

            const voteData = {
                poolHash: emptyPoolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "CandidateDoesNotExist")
                .withArgs(emptyPoolHash, 0);
        });
    });

    describe("Gas Usage", function () {
        it("Should vote within reasonable gas limits", async function () {
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
                title: "Gas Test Pool",
                description: "Testing gas consumption for voting",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["A", "B", "C"],
                candidatesTotal: 3,
                expiry: {
                    startDate: now,
                    endDate: now + 3600 * 24 * 2,   // 2 days
                },
            };

            const tx1 = await entryPoint.newVotingPool(poolData);
            const receipt1 = await tx1.wait();

            const votingPoolEvent = receipt1?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash = votingPoolEvent?.topics[2];

            const voteData = {
                poolHash: poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash]
            };

            const tx2 = await entryPoint.connect(voter1).vote(voteData);
            const receipt2 = await tx2.wait();

            expect(receipt1?.gasUsed).to.be.lessThan(500000);
            expect(receipt2?.gasUsed).to.be.lessThan(200000);
        });
        it("Should revert if voting before startDate", async function () {
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
                title: "Early Voting Pool",
                description: "Voting should not be active yet",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now + 3600, // starts in 1 hour
                    endDate: now + 3600 * 24, // 1 day duration
                },
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash = votingPoolEvent?.topics[2];
            expect(poolHash).to.not.be.undefined;

            const voteData = {
                poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "VotingIsNotActive")
                .withArgs(
                    poolHash,
                    poolData.expiry.startDate,
                    poolData.expiry.endDate
                );
        });

        it("Should revert if voting after endDate", async function () {
            const now = Math.floor(Date.now() / 1000);
            const poolData = {
                title: "Expired Voting Pool",
                description: "Voting period has ended",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
                expiry: {
                    startDate: now - 7200, // started 2 hours ago
                    endDate: now - 3600,   // ended 1 hour ago
                },
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const votingPoolEvent = receipt.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash = votingPoolEvent?.topics[2];
            expect(poolHash).to.not.be.undefined;

            const voteData = {
                poolHash,
                candidateSelected: 0,
                proofs: [ethers.ZeroHash],
            };

            await expect(entryPoint.connect(voter1).vote(voteData))
                .to.be.revertedWithCustomError(entryPoint, "VotingIsNotActive")
                .withArgs(
                    poolHash,
                    poolData.expiry.startDate,
                    poolData.expiry.endDate
                );
        });
    });
});