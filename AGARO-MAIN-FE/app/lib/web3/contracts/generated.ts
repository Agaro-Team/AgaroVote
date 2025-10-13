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
        name: '_merkleAllowListImplementation',
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
      { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AddressIsNotAllowed',
  },
  {
    type: 'error',
    inputs: [
      { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'storageHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'voter', internalType: 'address', type: 'address' },
    ],
    name: 'AlreadyVoted',
  },
  {
    type: 'error',
    inputs: [
      { name: '_poolHash', internalType: 'bytes32', type: 'bytes32' },
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
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolAlreadyExists',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolDoesNotHaveVoterStorage',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolHashDoesNotExist',
  },
  {
    type: 'error',
    inputs: [{ name: 'version', internalType: 'uint256', type: 'uint256' }],
    name: 'VersioningError',
  },
  {
    type: 'error',
    inputs: [
      { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
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
        name: 'poolHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'poolStorageHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'PoolBinded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolHash',
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
        name: 'newPoolVoterHash',
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
        name: 'poolHash',
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
    name: 'VotingPoolCreated',
  },
  {
    type: 'function',
    inputs: [{ name: '_poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPoolData',
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
    inputs: [{ name: '_poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isContractValid',
    outputs: [{ name: 'isExist', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isPoolHaveVoterStorage',
    outputs: [{ name: 'isBinded', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'merkleAllowListImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_poolData',
        internalType: 'struct VotingPoolDataArgument',
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
            internalType: 'struct VotingPoolExpiry',
            type: 'tuple',
            components: [
              { name: 'startDate', internalType: 'uint256', type: 'uint256' },
              { name: 'endDate', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'newVotingPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'poolHashToStorage',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'poolStorageVoters',
    outputs: [
      { name: 'selected', internalType: 'uint8', type: 'uint8' },
      { name: 'isVoted', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'pools',
    outputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'isPrivate', internalType: 'bool', type: 'bool' },
      { name: 'merkleRootContract', internalType: 'address', type: 'address' },
      { name: 'poolVoterHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'expiry',
        internalType: 'struct VotingPoolExpiry',
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
    name: 'storageHashToPool',
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
          { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
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
      { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
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
      { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
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
        name: 'poolHash',
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
        name: 'newPoolVoterHash',
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
        name: 'poolHash',
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
    name: 'VotingPoolCreated',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_poolData',
        internalType: 'struct VotingPoolDataArgument',
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
            internalType: 'struct VotingPoolExpiry',
            type: 'tuple',
            components: [
              { name: 'startDate', internalType: 'uint256', type: 'uint256' },
              { name: 'endDate', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'newVotingPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMerkleAllowlist
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMerkleAllowlistAbi = [
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
      { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'storageHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'voter', internalType: 'address', type: 'address' },
    ],
    name: 'AlreadyVoted',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolAlreadyExists',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolDoesNotHaveVoterStorage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'poolStorageHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'PoolBinded',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVotingPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iVotingPoolAbi = [
  {
    type: 'error',
    inputs: [
      { name: '_poolHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'candidate', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'CandidateDoesNotExist',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolHashDoesNotExist',
  },
  {
    type: 'function',
    inputs: [{ name: '_poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isContractValid',
    outputs: [{ name: 'isExist', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MerkleAllowlist
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const merkleAllowlistAbi = [
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
      { name: 'poolHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'storageHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'voter', internalType: 'address', type: 'address' },
    ],
    name: 'AlreadyVoted',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolAlreadyExists',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolDoesNotHaveVoterStorage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'poolStorageHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'PoolBinded',
  },
  {
    type: 'function',
    inputs: [{ name: '_poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isPoolHaveVoterStorage',
    outputs: [{ name: 'isBinded', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'poolHashToStorage',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'poolStorageVoters',
    outputs: [
      { name: 'selected', internalType: 'uint8', type: 'uint8' },
      { name: 'isVoted', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'storageHashToPool',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VotingPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const votingPoolAbi = [
  {
    type: 'error',
    inputs: [
      { name: '_poolHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'candidate', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'CandidateDoesNotExist',
  },
  {
    type: 'error',
    inputs: [{ name: 'poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'PoolHashDoesNotExist',
  },
  {
    type: 'function',
    inputs: [{ name: '_poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPoolData',
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
    inputs: [{ name: '_poolHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isContractValid',
    outputs: [{ name: 'isExist', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'pools',
    outputs: [
      { name: 'version', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'isPrivate', internalType: 'bool', type: 'bool' },
      { name: 'merkleRootContract', internalType: 'address', type: 'address' },
      { name: 'poolVoterHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'expiry',
        internalType: 'struct VotingPoolExpiry',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"getPoolData"`
 */
export const useReadEntryPointGetPoolData = /*#__PURE__*/ createUseReadContract(
  { abi: entryPointAbi, functionName: 'getPoolData' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"isPoolHaveVoterStorage"`
 */
export const useReadEntryPointIsPoolHaveVoterStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'isPoolHaveVoterStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"merkleAllowListImplementation"`
 */
export const useReadEntryPointMerkleAllowListImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'merkleAllowListImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"poolHashToStorage"`
 */
export const useReadEntryPointPoolHashToStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'poolHashToStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"poolStorageVoters"`
 */
export const useReadEntryPointPoolStorageVoters =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'poolStorageVoters',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"pools"`
 */
export const useReadEntryPointPools = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'pools',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"storageHashToPool"`
 */
export const useReadEntryPointStorageHashToPool =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'storageHashToPool',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"newVotingPool"`
 */
export const useWriteEntryPointNewVotingPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'newVotingPool',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"newVotingPool"`
 */
export const useSimulateEntryPointNewVotingPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'newVotingPool',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"PoolBinded"`
 */
export const useWatchEntryPointPoolBindedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'PoolBinded',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"VotingPoolCreated"`
 */
export const useWatchEntryPointVotingPoolCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'VotingPoolCreated',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iEntryPointAbi}__
 */
export const useWriteIEntryPoint = /*#__PURE__*/ createUseWriteContract({
  abi: iEntryPointAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"newVotingPool"`
 */
export const useWriteIEntryPointNewVotingPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: iEntryPointAbi,
    functionName: 'newVotingPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iEntryPointAbi}__
 */
export const useSimulateIEntryPoint = /*#__PURE__*/ createUseSimulateContract({
  abi: iEntryPointAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"newVotingPool"`
 */
export const useSimulateIEntryPointNewVotingPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iEntryPointAbi,
    functionName: 'newVotingPool',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iEntryPointAbi}__ and `eventName` set to `"VotingPoolCreated"`
 */
export const useWatchIEntryPointVotingPoolCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iEntryPointAbi,
    eventName: 'VotingPoolCreated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMerkleAllowlistAbi}__
 */
export const useReadIMerkleAllowlist = /*#__PURE__*/ createUseReadContract({
  abi: iMerkleAllowlistAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMerkleAllowlistAbi}__ and `functionName` set to `"isAllowed"`
 */
export const useReadIMerkleAllowlistIsAllowed =
  /*#__PURE__*/ createUseReadContract({
    abi: iMerkleAllowlistAbi,
    functionName: 'isAllowed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iVoterStorageAbi}__
 */
export const useWatchIVoterStorageEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iVoterStorageAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iVoterStorageAbi}__ and `eventName` set to `"PoolBinded"`
 */
export const useWatchIVoterStoragePoolBindedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iVoterStorageAbi,
    eventName: 'PoolBinded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iVotingPoolAbi}__
 */
export const useReadIVotingPool = /*#__PURE__*/ createUseReadContract({
  abi: iVotingPoolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iVotingPoolAbi}__ and `functionName` set to `"isContractValid"`
 */
export const useReadIVotingPoolIsContractValid =
  /*#__PURE__*/ createUseReadContract({
    abi: iVotingPoolAbi,
    functionName: 'isContractValid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleAllowlistAbi}__
 */
export const useReadMerkleAllowlist = /*#__PURE__*/ createUseReadContract({
  abi: merkleAllowlistAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"isAllowed"`
 */
export const useReadMerkleAllowlistIsAllowed =
  /*#__PURE__*/ createUseReadContract({
    abi: merkleAllowlistAbi,
    functionName: 'isAllowed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"merkleRoot"`
 */
export const useReadMerkleAllowlistMerkleRoot =
  /*#__PURE__*/ createUseReadContract({
    abi: merkleAllowlistAbi,
    functionName: 'merkleRoot',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMerkleAllowlistOwner = /*#__PURE__*/ createUseReadContract({
  abi: merkleAllowlistAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleAllowlistAbi}__
 */
export const useWriteMerkleAllowlist = /*#__PURE__*/ createUseWriteContract({
  abi: merkleAllowlistAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteMerkleAllowlistInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: merkleAllowlistAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteMerkleAllowlistRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: merkleAllowlistAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteMerkleAllowlistTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: merkleAllowlistAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleAllowlistAbi}__
 */
export const useSimulateMerkleAllowlist =
  /*#__PURE__*/ createUseSimulateContract({ abi: merkleAllowlistAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateMerkleAllowlistInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: merkleAllowlistAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateMerkleAllowlistRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: merkleAllowlistAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateMerkleAllowlistTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: merkleAllowlistAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link merkleAllowlistAbi}__
 */
export const useWatchMerkleAllowlistEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: merkleAllowlistAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchMerkleAllowlistInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: merkleAllowlistAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link merkleAllowlistAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchMerkleAllowlistOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: merkleAllowlistAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__
 */
export const useReadVoterStorage = /*#__PURE__*/ createUseReadContract({
  abi: voterStorageAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"isPoolHaveVoterStorage"`
 */
export const useReadVoterStorageIsPoolHaveVoterStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'isPoolHaveVoterStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"poolHashToStorage"`
 */
export const useReadVoterStoragePoolHashToStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'poolHashToStorage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"poolStorageVoters"`
 */
export const useReadVoterStoragePoolStorageVoters =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'poolStorageVoters',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterStorageAbi}__ and `functionName` set to `"storageHashToPool"`
 */
export const useReadVoterStorageStorageHashToPool =
  /*#__PURE__*/ createUseReadContract({
    abi: voterStorageAbi,
    functionName: 'storageHashToPool',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterStorageAbi}__
 */
export const useWatchVoterStorageEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: voterStorageAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterStorageAbi}__ and `eventName` set to `"PoolBinded"`
 */
export const useWatchVoterStoragePoolBindedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterStorageAbi,
    eventName: 'PoolBinded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPoolAbi}__
 */
export const useReadVotingPool = /*#__PURE__*/ createUseReadContract({
  abi: votingPoolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPoolAbi}__ and `functionName` set to `"getPoolData"`
 */
export const useReadVotingPoolGetPoolData = /*#__PURE__*/ createUseReadContract(
  { abi: votingPoolAbi, functionName: 'getPoolData' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPoolAbi}__ and `functionName` set to `"isContractValid"`
 */
export const useReadVotingPoolIsContractValid =
  /*#__PURE__*/ createUseReadContract({
    abi: votingPoolAbi,
    functionName: 'isContractValid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPoolAbi}__ and `functionName` set to `"pools"`
 */
export const useReadVotingPoolPools = /*#__PURE__*/ createUseReadContract({
  abi: votingPoolAbi,
  functionName: 'pools',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingPoolAbi}__ and `functionName` set to `"version"`
 */
export const useReadVotingPoolVersion = /*#__PURE__*/ createUseReadContract({
  abi: votingPoolAbi,
  functionName: 'version',
})
