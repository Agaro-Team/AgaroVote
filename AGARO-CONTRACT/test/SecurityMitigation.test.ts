import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } = await network.connect();

describe("Security Contract", function () {
    let entryPoint: any;
    let merkleTreeAllowListContract: any;
    let syntheticRewardContract: any;
    let agaroERC20Contract: any;
    let owner: any;
    let user1: any;
    let user2: any;

    beforeEach(async function () {
        [owner, user1, user2] = await hardhatEthers.getSigners();

        merkleTreeAllowListContract = await hardhatEthers.deployContract("MerkleTreeAllowlist");
        syntheticRewardContract = await hardhatEthers.deployContract("SyntheticReward");
        agaroERC20Contract = await hardhatEthers.deployContract("AGARO");

        entryPoint = await hardhatEthers.deployContract("EntryPoint", [
            await merkleTreeAllowListContract.getAddress(),
            await syntheticRewardContract.getAddress(),
            await agaroERC20Contract.getAddress(),
        ]);

        await agaroERC20Contract.connect(owner).mint(owner.address, ethers.parseEther("10000"));
        await agaroERC20Contract.connect(owner).mint(user1.address, ethers.parseEther("10000"));
        await agaroERC20Contract.connect(owner).mint(user2.address, ethers.parseEther("10000"));

    });

    it("should allow admin to set commit threshold", async function () {
        await entryPoint.connect(owner).setCommitTreshold(ethers.parseEther("5000"));
        const threshold = await entryPoint.commitThreshold();
        expect(threshold).to.equal(ethers.parseEther("5000"));
    });

    it("should revert when non-admin tries to set threshold", async function () {
        await expect(
            entryPoint.connect(user1).setCommitTreshold(100)
        ).to.be.revertedWith("Not admin");
    });

    it("should allow users to commit security tokens", async function () {
        const amount = ethers.parseEther("100");
        await expect(entryPoint.connect(user1).commitSecurity(amount))
            .to.emit(entryPoint, "TokenCommitted")
            .withArgs(await user1.getAddress(), amount);

        const committed = await entryPoint.committedAmount(await user1.getAddress());
        expect(committed).to.equal(amount);
    });

    it("should revert when committing zero tokens", async function () {
        await expect(entryPoint.connect(user1).commitSecurity(0)).to.be.revertedWith(
            "Invalid amount"
        );
    });

    it("should allow admin to halt when above threshold", async function () {
        const amount = ethers.parseEther("100");
        await entryPoint.connect(owner).setCommitTreshold(99);
        await entryPoint.connect(user1).commitSecurity(amount);
        await entryPoint.connect(owner).agree();
        await expect(entryPoint.connect(owner).haltAll())
            .to.emit(entryPoint, "SystemHalted")
            .withArgs(await owner.getAddress());
    });

    it("should revert admin halt when total committed < threshold", async function () {
        const threshold = ethers.parseEther("1000");
        const commitToken = ethers.parseEther("100");
        await entryPoint.connect(owner).setCommitTreshold(threshold);
        await entryPoint.connect(user1).commitSecurity(commitToken);
        await entryPoint.connect(owner).agree();

        await expect(entryPoint.connect(owner).haltAll()).to.be.revertedWith(
            "Commited Token is bellow treshold"
        );
    });

    it("should allow admin to resume system", async function () {
        const amount = ethers.parseEther("100");
        await entryPoint.connect(owner).setCommitTreshold(99);
        await entryPoint.connect(user1).commitSecurity(amount);
        await entryPoint.connect(owner).agree();
        await entryPoint.connect(owner).haltAll();

        await expect(entryPoint.connect(owner).resumeAll())
            .to.emit(entryPoint, "SystemResumed")
            .withArgs(await owner.getAddress());
    });

    it("should revert withdraw if no commitment", async function () {
        await expect(
            entryPoint.connect(user1).withdrawSecurity()
        ).to.be.revertedWith("Invalid amount");
    });

    it("should withdraw committed tokens successfully", async function () {
        const amount = ethers.parseEther("200");
        await entryPoint.connect(user1).commitSecurity(amount);
        expect(await entryPoint.connect(user1).withdrawSecurity()).not.to.be.revert;
    });
    it("should allow adding and removing admin and all agreeing", async function () {
        await entryPoint.connect(owner).adminOps("add", await user1.getAddress());
        const adminDataAfterAdd = await entryPoint.admin(1);
        expect(adminDataAfterAdd.admin).to.equal(await user1.getAddress());
        expect(adminDataAfterAdd.isAdminAgreed).to.equal(false);

        await entryPoint.connect(user1).agree();
        const adminDataAfterAgree = await entryPoint.admin(1);
        expect(adminDataAfterAgree.isAdminAgreed).to.equal(true);

        await entryPoint.connect(owner).agree();

        for (let i = 0; i < 2; i++) {
            const a = await entryPoint.admin(i);
            expect(a.isAdminAgreed).to.equal(true);
        }

        expect(await entryPoint.connect(owner).adminOps("remove", await user1.getAddress())).not.to.be.revert;
    });
    it("should allow all admins to agree and reset consensus correctly", async function () {
        await entryPoint.connect(owner).adminOps("add", await user1.getAddress());

        const adminDataAfterAdd = await entryPoint.admin(1);
        expect(adminDataAfterAdd.isAdminAgreed).to.equal(false);

        await entryPoint.connect(owner).agree();
        const admin0 = await entryPoint.admin(0);
        expect(admin0.isAdminAgreed).to.equal(true);

        await entryPoint.connect(user1).agree();
        const admin1 = await entryPoint.admin(1);
        expect(admin1.isAdminAgreed).to.equal(true);

        for (let i = 0; i < 2; i++) {
            const data = await entryPoint.admin(i);
            expect(data.isAdminAgreed).to.equal(true);
        }

        await entryPoint.connect(owner).resetConsensus();

        for (let i = 0; i < 2; i++) {
            const data = await entryPoint.admin(i);
            expect(data.isAdminAgreed).to.equal(false);
        }
    });
});
