import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EntryPoint
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const entryPointAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_merkleTreeAllowListImplementation',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'voter', internalType: 'address', type: 'address' },
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AddressIsNotAllowed',
  },
  {
    type: 'error',
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'storageHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'voter', internalType: 'address', type: 'address' },
    ],
    name: 'AlreadyVoted',
  },
  {
    type: 'error',
    inputs: [
      { name: '_pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'candidate', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'CandidateDoesNotExist',
  },
  { type: 'error', inputs: [], name: 'FailedDeployment' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollAlreadyExists',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollDoesNotHaveVoterStorage',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollHashDoesNotExist',
  },
  {
    type: 'error',
    inputs: [{ name: 'version', internalType: 'uint256', type: 'uint256' }],
    name: 'VersioningError',
  },
  {
    type: 'error',
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'startDate', internalType: 'uint256', type: 'uint256' },
      { name: 'endData', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'VotingIsNotActive',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pollHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'pollStorageLocationHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'PollBinded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pollHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'voter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'selected',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newPollVoterHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'VoteSucceeded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'pollHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'candidateCount',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'VotingPollCreated',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPollData',
    outputs: [
      { name: 'ver', internalType: 'uint256', type: 'uint256' },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'candidatesVotersCount',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isContractValid',
    outputs: [{ name: 'isExist', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isPollHaveVoterStorage',
    outputs: [{ name: 'isBinded', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'merkleTreeAllowListImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_pollData',
        internalType: 'struct VotingPollDataArgument',
        type: 'tuple',
        components: [
          { name: 'versioning', internalType: 'uint256', type: 'uint256' },
          { name: 'title', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'merkleRootHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'isPrivate', internalType: 'bool', type: 'bool' },
          { name: 'candidates', internalType: 'string[]', type: 'string[]' },
          { name: 'candidatesTotal', internalType: 'uint8', type: 'uint8' },
          {
            name: 'expiry',
            internalType: 'struct VotingPollExpiry',
            type: 'tuple',
            components: [
              { name: 'startDate', internalType: 'uint256', type: 'uint256' },
              { name: 'endDate', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'newVotingPoll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'pollHashToStorage',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'pollStorageVoters',
    outputs: [
      { name: 'selected', internalType: 'uint8', type: 'uint8' },
      { name: 'isVoted', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'polls',
    outputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'isPrivate', internalType: 'bool', type: 'bool' },
      { name: 'merkleRootContract', internalType: 'address', type: 'address' },
      { name: 'pollVoterHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'expiry',
        internalType: 'struct VotingPollExpiry',
        type: 'tuple',
        components: [
          { name: 'startDate', internalType: 'uint256', type: 'uint256' },
          { name: 'endDate', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'storageHashToPoll',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_voteData',
        internalType: 'struct VoteArgument',
        type: 'tuple',
        components: [
          { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'candidateSelected', internalType: 'uint8', type: 'uint8' },
          { name: 'proofs', internalType: 'bytes32[]', type: 'bytes32[]' },
        ],
      },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IEntryPoint
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iEntryPointAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'voter', internalType: 'address', type: 'address' },
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AddressIsNotAllowed',
  },
  {
    type: 'error',
    inputs: [{ name: 'version', internalType: 'uint256', type: 'uint256' }],
    name: 'VersioningError',
  },
  {
    type: 'error',
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'startDate', internalType: 'uint256', type: 'uint256' },
      { name: 'endData', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'VotingIsNotActive',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pollHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'voter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'selected',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newPollVoterHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'VoteSucceeded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'pollHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'candidateCount',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'VotingPollCreated',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_pollData',
        internalType: 'struct VotingPollDataArgument',
        type: 'tuple',
        components: [
          { name: 'versioning', internalType: 'uint256', type: 'uint256' },
          { name: 'title', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'merkleRootHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'isPrivate', internalType: 'bool', type: 'bool' },
          { name: 'candidates', internalType: 'string[]', type: 'string[]' },
          { name: 'candidatesTotal', internalType: 'uint8', type: 'uint8' },
          {
            name: 'expiry',
            internalType: 'struct VotingPollExpiry',
            type: 'tuple',
            components: [
              { name: 'startDate', internalType: 'uint256', type: 'uint256' },
              { name: 'endDate', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'newVotingPoll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMerkleTreeAllowlist
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMerkleTreeAllowlistAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'proof', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'isAllowed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVoterStorage
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iVoterStorageAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'storageHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'voter', internalType: 'address', type: 'address' },
    ],
    name: 'AlreadyVoted',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollAlreadyExists',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollDoesNotHaveVoterStorage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pollHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'pollStorageLocationHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'PollBinded',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVotingPoll
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iVotingPollAbi = [
  {
    type: 'error',
    inputs: [
      { name: '_pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'candidate', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'CandidateDoesNotExist',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollHashDoesNotExist',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isContractValid',
    outputs: [{ name: 'isExist', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MerkleTreeAllowlist
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const merkleTreeAllowlistAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: 'initialRoot', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'proof', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'isAllowed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'merkleRoot',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VoterStorage
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const voterStorageAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'storageHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'voter', internalType: 'address', type: 'address' },
    ],
    name: 'AlreadyVoted',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollAlreadyExists',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollDoesNotHaveVoterStorage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pollHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'pollStorageLocationHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'PollBinded',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isPollHaveVoterStorage',
    outputs: [{ name: 'isBinded', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'pollHashToStorage',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'pollStorageVoters',
    outputs: [
      { name: 'selected', internalType: 'uint8', type: 'uint8' },
      { name: 'isVoted', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'storageHashToPoll',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VotingPoll
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const votingPollAbi = [
  {
    type: 'error',
    inputs: [
      { name: '_pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'candidate', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'CandidateDoesNotExist',
  },
  {
    type: 'error',
    inputs: [{ name: 'pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PollHashDoesNotExist',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPollData',
    outputs: [
      { name: 'ver', internalType: 'uint256', type: 'uint256' },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'candidatesVotersCount',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isContractValid',
    outputs: [{ name: 'isExist', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'polls',
    outputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'isPrivate', internalType: 'bool', type: 'bool' },
      { name: 'merkleRootContract', internalType: 'address', type: 'address' },
      { name: 'pollVoterHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'expiry',
        internalType: 'struct VotingPollExpiry',
        type: 'tuple',
        components: [
          { name: 'startDate', internalType: 'uint256', type: 'uint256' },
          { name: 'endDate', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useReadEntryPoint = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"getPollData"`
 */
export const useReadEntryPointGetPollData = /*#__PURE__*/ createUseReadContract(
  { abi: entryPointAbi, functionName: 'getPollData' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"isContractValid"`
 */
export const useReadEntryPointIsContractValid =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'isContractValid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"isPollHaveVoterStorage"`
 */
export const useReadEntryPointIsPollHaveVoterStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'isPollHaveVoterStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"merkleTreeAllowListImplementation"`
 */
export const useReadEntryPointMerkleTreeAllowListImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'merkleTreeAllowListImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"pollHashToStorage"`
 */
export const useReadEntryPointPollHashToStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'pollHashToStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"pollStorageVoters"`
 */
export const useReadEntryPointPollStorageVoters =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'pollStorageVoters',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"polls"`
 */
export const useReadEntryPointPolls = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'polls',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"storageHashToPoll"`
 */
export const useReadEntryPointStorageHashToPoll =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'storageHashToPoll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"version"`
 */
export const useReadEntryPointVersion = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'version',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useWriteEntryPoint = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"newVotingPoll"`
 */
export const useWriteEntryPointNewVotingPoll =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'newVotingPoll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"vote"`
 */
export const useWriteEntryPointVote = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
  functionName: 'vote',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useSimulateEntryPoint = /*#__PURE__*/ createUseSimulateContract({
  abi: entryPointAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"newVotingPoll"`
 */
export const useSimulateEntryPointNewVotingPoll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'newVotingPoll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"vote"`
 */
export const useSimulateEntryPointVote =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'vote',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useWatchEntryPointEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: entryPointAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"PollBinded"`
 */
export const useWatchEntryPointPollBindedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'PollBinded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"VoteSucceeded"`
 */
export const useWatchEntryPointVoteSucceededEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'VoteSucceeded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"VotingPollCreated"`
 */
export const useWatchEntryPointVotingPollCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'VotingPollCreated',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iEntryPointAbi}__
 */
export const useWriteIEntryPoint = /*#__PURE__*/ createUseWriteContract({
  abi: iEntryPointAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"newVotingPoll"`
 */
export const useWriteIEntryPointNewVotingPoll =
  /*#__PURE__*/ createUseWriteContract({
    abi: iEntryPointAbi,
    functionName: 'newVotingPoll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iEntryPointAbi}__
 */
export const useSimulateIEntryPoint = /*#__PURE__*/ createUseSimulateContract({
  abi: iEntryPointAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"newVotingPoll"`
 */
export const useSimulateIEntryPointNewVotingPoll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iEntryPointAbi,
    functionName: 'newVotingPoll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iEntryPointAbi}__
 */
export const useWatchIEntryPointEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iEntryPointAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iEntryPointAbi}__ and `eventName` set to `"VoteSucceeded"`
 */
export const useWatchIEntryPointVoteSucceededEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iEntryPointAbi,
    eventName: 'VoteSucceeded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iEntryPointAbi}__ and `eventName` set to `"VotingPollCreated"`
 */
export const useWatchIEntryPointVotingPollCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iEntryPointAbi,
    eventName: 'VotingPollCreated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMerkleTreeAllowlistAbi}__
 */
export const useReadIMerkleTreeAllowlist = /*#__PURE__*/ createUseReadContract({
  abi: iMerkleTreeAllowlistAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMerkleTreeAllowlistAbi}__ and `functionName` set to `"isAllowed"`
 */
export const useReadIMerkleTreeAllowlistIsAllowed =
  /*#__PURE__*/ createUseReadContract({
    abi: iMerkleTreeAllowlistAbi,
    functionName: 'isAllowed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iVoterStorageAbi}__
 */
export const useWatchIVoterStorageEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iVoterStorageAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iVoterStorageAbi}__ and `eventName` set to `"PollBinded"`
 */
export const useWatchIVoterStoragePollBindedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iVoterStorageAbi,
    eventName: 'PollBinded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iVotingPollAbi}__
 */
export const useReadIVotingPoll = /*#__PURE__*/ createUseReadContract({
  abi: iVotingPollAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iVotingPollAbi}__ and `functionName` set to `"isContractValid"`
 */
export const useReadIVotingPollIsContractValid =
  /*#__PURE__*/ createUseReadContract({
    abi: iVotingPollAbi,
    functionName: 'isContractValid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__
 */
export const useReadMerkleTreeAllowlist = /*#__PURE__*/ createUseReadContract({
  abi: merkleTreeAllowlistAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"isAllowed"`
 */
export const useReadMerkleTreeAllowlistIsAllowed =
  /*#__PURE__*/ createUseReadContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'isAllowed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"merkleRoot"`
 */
export const useReadMerkleTreeAllowlistMerkleRoot =
  /*#__PURE__*/ createUseReadContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'merkleRoot',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMerkleTreeAllowlistOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__
 */
export const useWriteMerkleTreeAllowlist = /*#__PURE__*/ createUseWriteContract(
  { abi: merkleTreeAllowlistAbi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteMerkleTreeAllowlistInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteMerkleTreeAllowlistRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteMerkleTreeAllowlistTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__
 */
export const useSimulateMerkleTreeAllowlist =
  /*#__PURE__*/ createUseSimulateContract({ abi: merkleTreeAllowlistAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateMerkleTreeAllowlistInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateMerkleTreeAllowlistRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateMerkleTreeAllowlistTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: merkleTreeAllowlistAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__
 */
export const useWatchMerkleTreeAllowlistEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: merkleTreeAllowlistAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchMerkleTreeAllowlistInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: merkleTreeAllowlistAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchMerkleTreeAllowlistOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: merkleTreeAllowlistAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__
 */
export const useReadVoterStorage = /*#__PURE__*/ createUseReadContract({
  abi: voterStorageAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"isPollHaveVoterStorage"`
 */
export const useReadVoterStorageIsPollHaveVoterStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'isPollHaveVoterStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"pollHashToStorage"`
 */
export const useReadVoterStoragePollHashToStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'pollHashToStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"pollStorageVoters"`
 */
export const useReadVoterStoragePollStorageVoters =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'pollStorageVoters',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"storageHashToPoll"`
 */
export const useReadVoterStorageStorageHashToPoll =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'storageHashToPoll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterStorageAbi}__
 */
export const useWatchVoterStorageEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: voterStorageAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterStorageAbi}__ and `eventName` set to `"PollBinded"`
 */
export const useWatchVoterStoragePollBindedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterStorageAbi,
    eventName: 'PollBinded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPollAbi}__
 */
export const useReadVotingPoll = /*#__PURE__*/ createUseReadContract({
  abi: votingPollAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPollAbi}__ and `functionName` set to `"getPollData"`
 */
export const useReadVotingPollGetPollData = /*#__PURE__*/ createUseReadContract(
  { abi: votingPollAbi, functionName: 'getPollData' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPollAbi}__ and `functionName` set to `"isContractValid"`
 */
export const useReadVotingPollIsContractValid =
  /*#__PURE__*/ createUseReadContract({
    abi: votingPollAbi,
    functionName: 'isContractValid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPollAbi}__ and `functionName` set to `"polls"`
 */
export const useReadVotingPollPolls = /*#__PURE__*/ createUseReadContract({
  abi: votingPollAbi,
  functionName: 'polls',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPollAbi}__ and `functionName` set to `"version"`
 */
export const useReadVotingPollVersion = /*#__PURE__*/ createUseReadContract({
  abi: votingPollAbi,
  functionName: 'version',
})
