use ethers::contract::EthEvent;
use ethers::types::{Address, H256, U256};

#[derive(Debug, Clone, EthEvent)]
#[ethevent(
    name = "VotingPollCreated",
    abi = "VotingPollCreated(uint256 indexed version, bytes32 indexed pollHash, bytes32 voterStorageHashLocation, uint256[] candidateCount)"
)]
pub struct VotingPollCreated {
    pub version: U256,
    pub poll_hash: H256,
    pub voter_storage_hash_location: H256,
    pub candidate_count: Vec<U256>,
}

#[derive(Debug, Clone, EthEvent)]
#[ethevent(
    name = "VoteSucceeded",
    abi = "VoteSucceeded(bytes32 indexed pollHash, uint8 selected, uint256 commitToken, bytes32 newPollVoterHash, address indexed voter)"
)]
pub struct VoteSucceeded {
    pub poll_hash: H256,
    pub selected: u8,
    pub commit_token: U256,
    pub new_poll_voter_hash: H256,
    pub voter: Address,
}

#[derive(Debug, Clone, EthEvent)]
#[ethevent(
    name = "WithdrawSucceeded",
    abi = "WithdrawSucceeded(bytes32 indexed pollHash, uint256 withdrawedToken, uint256 withdrawedReward, address indexed voter)"
)]
pub struct WithdrawSucceeded {
    pub poll_hash: H256,
    pub withdrawed_token: U256,
    pub withdrawed_reward: U256,
    pub voter: Address,
}
