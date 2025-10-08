import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } = await network.connect();

describe("EntryPoint - Voting Pool Creation", function () {
    let entryPoint: any;
    let merkleAllowListContract: any;
    let owner: any;

    beforeEach(async function () {
        [owner] = await hardhatEthers.getSigners();
        merkleAllowListContract = await hardhatEthers.deployContract("MerkleAllowlist");
        entryPoint = await hardhatEthers.deployContract("EntryPoint", [await merkleAllowListContract.getAddress()]);
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(await entryPoint.getAddress()).to.be.properAddress;
        });

        it("Should have version initialized to 0", async function () {
            expect(await entryPoint.version()).to.equal(0);
        });
    });

    describe("Voting Pool Creation", function () {
        it("Should create a private voting pool without emitting VotingPoolCreated event", async function () {
            const poolData = {
                title: "Private Voting Pool",
                description: "Only whitelisted voters can participate",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: true,
                candidates: ["Alice", "Bob"],
                candidatesTotal: 2,
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const hasEvent = receipt.logs.some((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            expect(hasEvent).to.be.false;

            expect(await entryPoint.version()).to.equal(1);
        });
        it("Should create a voting pool with specified candidates", async function () {
            const poolData = {
                title: "Test Voting Pool",
                description: "A test voting pool for testing purposes",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Alice", "Bob", "Charlie"],
                candidatesTotal: 3,
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated")
                .withArgs(1, ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
                    ["string", "string", "string[]", "uint8", "uint256", "address"],
                    [poolData.title, poolData.description, poolData.candidates, poolData.candidatesTotal, 0, owner.address]
                )));
        });

        it("Should increment version after creating a pool", async function () {
            const poolData = {
                title: "Test Pool",
                description: "Test Description",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option A", "Option B"],
                candidatesTotal: 2,
            };

            expect(await entryPoint.version()).to.equal(0);
            await entryPoint.newVotingPool(poolData);
            expect(await entryPoint.version()).to.equal(1);
        });

        it("Should create multiple pools with different candidate counts", async function () {
            const poolData1 = {
                title: "Pool 1",
                description: "First pool with 2 candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Yes", "No"],
                candidatesTotal: 2,
            };

            const poolData2 = {
                title: "Pool 2",
                description: "Second pool with 5 candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
                candidatesTotal: 5,
            };

            await entryPoint.newVotingPool(poolData1);
            await entryPoint.newVotingPool(poolData2);

            expect(await entryPoint.version()).to.equal(2);
        });

        it("Should create pool with many candidates", async function () {
            const candidates = Array.from({ length: 10 }, (_, i) => `Candidate ${i + 1}`);
            const poolData = {
                title: "Many Candidates Pool",
                description: "Pool with many candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: candidates,
                candidatesTotal: 10,
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should create pool with zero candidates", async function () {
            const poolData = {
                title: "Zero Candidates Pool",
                description: "Pool with no candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: [],
                candidatesTotal: 0,
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should create pool with maximum uint8 candidates", async function () {
            const candidates = Array.from({ length: 255 }, (_, i) => `Candidate ${i + 1}`);
            const poolData = {
                title: "Max Candidates Pool",
                description: "Pool with maximum candidates",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: candidates,
                candidatesTotal: 255,
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should allow anyone to create voting pools", async function () {
            const [, voter] = await hardhatEthers.getSigners();

            const poolData = {
                title: "Public Pool",
                description: "Anyone can create pools",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Choice A", "Choice B", "Choice C"],
                candidatesTotal: 3,
            };

            await expect(entryPoint.connect(voter).newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should create pool within reasonable gas limits", async function () {
            const poolData = {
                title: "Gas Test Pool",
                description: "Testing gas consumption",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
                candidatesTotal: 5,
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            expect(receipt?.gasUsed).to.be.lessThan(500000);
        });

        it("Should validate contract existence correctly", async function () {
            const poolData = {
                title: "Validation Test Pool",
                description: "Testing contract validation",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Candidate 1", "Candidate 2", "Candidate 3"],
                candidatesTotal: 3,
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            const event = receipt?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const poolHash = event?.topics[2];

            expect(await entryPoint.isContractValid(poolHash)).to.be.true;

            const nonExistentHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
            expect(await entryPoint.isContractValid(nonExistentHash)).to.be.false;
        });

        it("Should validate multiple pools correctly", async function () {
            const poolData1 = {
                title: "Pool 1",
                description: "First pool for validation",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Yes", "No"],
                candidatesTotal: 2,
            };

            const poolData2 = {
                title: "Pool 2",
                description: "Second pool for validation",
                merkleRootHash: ethers.ZeroHash,
                isPrivate: false,
                candidates: ["Option A", "Option B", "Option C", "Option D"],
                candidatesTotal: 4,
            };

            const tx1 = await entryPoint.newVotingPool(poolData1);
            const receipt1 = await tx1.wait();

            const tx2 = await entryPoint.newVotingPool(poolData2);
            const receipt2 = await tx2.wait();

            const event1 = receipt1?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const event2 = receipt2?.logs.find((log: any) => {
                try {
                    const decoded = entryPoint.interface.parseLog(log);
                    return decoded?.name === "VotingPoolCreated";
                } catch {
                    return false;
                }
            });

            const poolHash1 = event1?.topics[2];
            const poolHash2 = event2?.topics[2];

            expect(await entryPoint.isContractValid(poolHash1)).to.be.true;
            expect(await entryPoint.isContractValid(poolHash2)).to.be.true;

            expect(poolHash1).to.not.equal(poolHash2);
        });
    });
});