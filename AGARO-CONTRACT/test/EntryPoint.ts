import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } = await network.connect();

describe("EntryPoint - Voting Pool Creation", function () {
    let entryPoint: any;
    let owner: any;

    beforeEach(async function () {
        [owner] = await hardhatEthers.getSigners();
        entryPoint = await hardhatEthers.deployContract("EntryPoint");
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
        it("Should create a voting pool with specified number of candidates", async function () {
            const poolData = {
                title: "Test Voting Pool",
                description: "A test voting pool for testing purposes",
                candidates: 3,
                owner: owner.address
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated")
                .withArgs(1, ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
                    ["string", "string", "uint8", "address", "uint256"],
                    [poolData.title, poolData.description, poolData.candidates, poolData.owner, 0]
                )));
        });

        it("Should increment version after creating a pool", async function () {
            const poolData = {
                title: "Test Pool",
                description: "Test Description",
                candidates: 2,
                owner: owner.address
            };

            expect(await entryPoint.version()).to.equal(0);
            await entryPoint.newVotingPool(poolData);
            expect(await entryPoint.version()).to.equal(1);
        });

        it("Should create multiple pools with different candidate counts", async function () {
            const poolData1 = {
                title: "Pool 1",
                description: "First pool with 2 candidates",
                candidates: 2,
                owner: owner.address
            };

            const poolData2 = {
                title: "Pool 2",
                description: "Second pool with 5 candidates",
                candidates: 5,
                owner: owner.address
            };

            await entryPoint.newVotingPool(poolData1);
            await entryPoint.newVotingPool(poolData2);

            expect(await entryPoint.version()).to.equal(2);
        });

        it("Should create pool with many candidates", async function () {
            const poolData = {
                title: "Many Candidates Pool",
                description: "Pool with many candidates",
                candidates: 10,
                owner: owner.address
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should create pool with zero candidates", async function () {
            const poolData = {
                title: "Zero Candidates Pool",
                description: "Pool with no candidates",
                candidates: 0,
                owner: owner.address
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should create pool with maximum uint8 candidates", async function () {
            const poolData = {
                title: "Max Candidates Pool",
                description: "Pool with maximum candidates",
                candidates: 255,
                owner: owner.address
            };

            await expect(entryPoint.newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should allow anyone to create voting pools", async function () {
            const [, voter] = await hardhatEthers.getSigners();

            const poolData = {
                title: "Public Pool",
                description: "Anyone can create pools",
                candidates: 3,
                owner: voter.address
            };

            await expect(entryPoint.connect(voter).newVotingPool(poolData))
                .to.emit(entryPoint, "VotingPoolCreated");
        });

        it("Should create pool within reasonable gas limits", async function () {
            const poolData = {
                title: "Gas Test Pool",
                description: "Testing gas consumption",
                candidates: 5,
                owner: owner.address
            };

            const tx = await entryPoint.newVotingPool(poolData);
            const receipt = await tx.wait();

            expect(receipt?.gasUsed).to.be.lessThan(500000);
        });
    });
});