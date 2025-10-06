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
    ],
    name: 'VoteSucced',
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
    inputs: [
      {
        name: '_poolData',
        internalType: 'struct VotingPoolDataArgument',
        type: 'tuple',
        components: [
          { name: 'title', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'candidates', internalType: 'string[]', type: 'string[]' },
          { name: 'candidatesTotal', internalType: 'uint8', type: 'uint8' },
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
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      { name: 'owner', internalType: 'address', type: 'address' },
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
    ],
    name: 'VoteSucced',
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
          { name: 'title', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'candidates', internalType: 'string[]', type: 'string[]' },
          { name: 'candidatesTotal', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'newVotingPool',
    outputs: [],
    stateMutability: 'nonpayable',
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
      {
        name: 'voterStorageHashLocation',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      { name: 'owner', internalType: 'address', type: 'address' },
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"VoteSucced"`
 */
export const useWatchEntryPointVoteSuccedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'VoteSucced',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iEntryPointAbi}__ and `eventName` set to `"VoteSucced"`
 */
export const useWatchIEntryPointVoteSuccedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iEntryPointAbi,
    eventName: 'VoteSucced',
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
