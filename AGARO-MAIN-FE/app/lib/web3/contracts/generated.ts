import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AGARO
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const agaroAbi = [
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_amount', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AgaroTierSystem
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const agaroTierSystemAbi = [
  {
    type: 'function',
    inputs: [{ name: '_minHoldAGR', internalType: 'uint256', type: 'uint256' }],
    name: '_normalizeTier',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseIncentives',
    outputs: [
      { name: 'tier1', internalType: 'uint256', type: 'uint256' },
      { name: 'tier5', internalType: 'uint256', type: 'uint256' },
      { name: 'tier10', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'lastCreatedPoll',
    outputs: [
      { name: 'lastResetTime', internalType: 'uint256', type: 'uint256' },
      { name: 'pollsCreated', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minHold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tiers',
    outputs: [
      { name: 'discount', internalType: 'uint8', type: 'uint8' },
      { name: 'maxPollingPerDay', internalType: 'uint256', type: 'uint256' },
      { name: 'minHoldAGR', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

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
      {
        name: '_syntheticRewardImplementation',
        internalType: 'address',
        type: 'address',
      },
      { name: '_token', internalType: 'address', type: 'address' },
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
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'commitToken', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'PollNeedsCommitToken',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
    ],
    name: 'SenderIsNotVoterOf',
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
    type: 'error',
    inputs: [{ name: 'creator', internalType: 'address', type: 'address' }],
    name: 'insufficientBalance',
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
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SystemHalted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SystemResumed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenCommitted',
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
        name: 'selected',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'commitToken',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newPollVoterHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'voter',
        internalType: 'address',
        type: 'address',
        indexed: true,
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
        name: 'syntheticRewardContract',
        internalType: 'address',
        type: 'address',
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
        name: 'withdrawedToken',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'withdrawedReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'voter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'WithdrawSucceeded',
  },
  {
    type: 'function',
    inputs: [{ name: '_minHoldAGR', internalType: 'uint256', type: 'uint256' }],
    name: '_normalizeTier',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'admin',
    outputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: 'isAdminAgreed', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'option', internalType: 'string', type: 'string' },
      { name: '_admin', internalType: 'address', type: 'address' },
    ],
    name: 'adminOps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'agree',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseIncentives',
    outputs: [
      { name: 'tier1', internalType: 'uint256', type: 'uint256' },
      { name: 'tier5', internalType: 'uint256', type: 'uint256' },
      { name: 'tier10', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountToCommit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'commitSecurity',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'commitThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'committedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
        internalType: 'struct CandidateData[]',
        type: 'tuple[]',
        components: [
          { name: 'count', internalType: 'uint256', type: 'uint256' },
          { name: 'commitToken', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'owner', internalType: 'address', type: 'address' },
      {
        name: 'syntheticRewardContract',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'haltAll',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'isHalted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'lastCreatedPoll',
    outputs: [
      { name: 'lastResetTime', internalType: 'uint256', type: 'uint256' },
      { name: 'pollsCreated', internalType: 'uint256', type: 'uint256' },
    ],
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
    inputs: [],
    name: 'minHold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
          { name: 'rewardShare', internalType: 'uint256', type: 'uint256' },
          { name: 'isTokenRequired', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'newVotingPoll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'proof', internalType: 'bytes32', type: 'bytes32' },
      { name: 'selected', internalType: 'uint8', type: 'uint8' },
      { name: 'commitedToken', internalType: 'uint256', type: 'uint256' },
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
      {
        name: 'syntheticRewardContract',
        internalType: 'address',
        type: 'address',
      },
      { name: 'pollVoterHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'count', internalType: 'uint256', type: 'uint256' },
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
      { name: 'isTokenRequired', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resetConsensus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resumeAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_baseIncentives',
        internalType: 'struct BaseIncentives',
        type: 'tuple',
        components: [
          { name: 'tier1', internalType: 'uint256', type: 'uint256' },
          { name: 'tier5', internalType: 'uint256', type: 'uint256' },
          { name: 'tier10', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'setBaseIncentives',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'threshold', internalType: 'uint256', type: 'uint256' }],
    name: 'setCommitTreshold',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_minHold', internalType: 'uint256', type: 'uint256' }],
    name: 'setMinHold',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_fee', internalType: 'uint256', type: 'uint256' }],
    name: 'setPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'syntheticRewardImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tiers',
    outputs: [
      { name: 'discount', internalType: 'uint8', type: 'uint8' },
      { name: 'maxPollingPerDay', internalType: 'uint256', type: 'uint256' },
      { name: 'minHoldAGR', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IAGARO', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tier', internalType: 'uint8', type: 'uint8' },
      { name: '_discount', internalType: 'uint8', type: 'uint8' },
      { name: '_minHoldAGR', internalType: 'uint256', type: 'uint256' },
      { name: '_maxPollingPerDay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateTier',
    outputs: [],
    stateMutability: 'nonpayable',
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
          { name: 'commitToken', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawSecurity',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAGARO
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iagaroAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_amount', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAgaroTierSystem
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAgaroTierSystemAbi = [
  {
    type: 'function',
    inputs: [{ name: '_minHoldAGR', internalType: 'uint256', type: 'uint256' }],
    name: '_normalizeTier',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minHold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'commitToken', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'PollNeedsCommitToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'pollHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
    ],
    name: 'SenderIsNotVoterOf',
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
    type: 'error',
    inputs: [{ name: 'creator', internalType: 'address', type: 'address' }],
    name: 'insufficientBalance',
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
        name: 'selected',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'commitToken',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newPollVoterHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'voter',
        internalType: 'address',
        type: 'address',
        indexed: true,
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
        name: 'syntheticRewardContract',
        internalType: 'address',
        type: 'address',
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
        name: 'withdrawedToken',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'withdrawedReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'voter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'WithdrawSucceeded',
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
          { name: 'rewardShare', internalType: 'uint256', type: 'uint256' },
          { name: 'isTokenRequired', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'newVotingPoll',
    outputs: [],
    stateMutability: 'nonpayable',
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
          { name: 'commitToken', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_pollHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMerkleTreeAllowList
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMerkleTreeAllowListAbi = [
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'InvalidProof',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'NotAuthorized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newRoot',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'MerkleRootUpdated',
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
    outputs: [{ name: 'isValid', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'merkleRoot',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ISecurity
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iSecurityAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SystemHalted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SystemResumed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenCommitted',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isHalted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ISyntheticReward
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iSyntheticRewardAbi = [
  { type: 'error', inputs: [], name: 'AmountZero' },
  { type: 'error', inputs: [], name: 'ContractNotFinished' },
  { type: 'error', inputs: [], name: 'DurationNotElapsed' },
  { type: 'error', inputs: [], name: 'InvalidRewardRate' },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_sender', internalType: 'address', type: 'address' },
    ],
    name: 'commit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'earned',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'finishAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
      { name: 'rewardShare', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastTimeRewardApplicable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardPerToken',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardPerTokenStored',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardRate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'rewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'updatedAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'userRewardPerTokenPaid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_sender', internalType: 'address', type: 'address' }],
    name: 'withdraw',
    outputs: [
      { name: 'rewards', internalType: 'uint256', type: 'uint256' },
      { name: 'principalToken', internalType: 'uint256', type: 'uint256' },
    ],
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
        internalType: 'struct CandidateData[]',
        type: 'tuple[]',
        components: [
          { name: 'count', internalType: 'uint256', type: 'uint256' },
          { name: 'commitToken', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'owner', internalType: 'address', type: 'address' },
      {
        name: 'syntheticRewardContract',
        internalType: 'address',
        type: 'address',
      },
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
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MerkleTreeAllowlist
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const merkleTreeAllowlistAbi = [
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'InvalidProof',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'NotAuthorized',
  },
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
        name: 'newRoot',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'MerkleRootUpdated',
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
      { name: '_initialRoot', internalType: 'bytes32', type: 'bytes32' },
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
// Security
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const securityAbi = [
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SystemHalted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SystemResumed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenCommitted',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'admin',
    outputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: 'isAdminAgreed', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'option', internalType: 'string', type: 'string' },
      { name: '_admin', internalType: 'address', type: 'address' },
    ],
    name: 'adminOps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'agree',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'commitThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'committedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'haltAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isHalted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resetConsensus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resumeAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'threshold', internalType: 'uint256', type: 'uint256' }],
    name: 'setCommitTreshold',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SyntheticReward
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const syntheticRewardAbi = [
  { type: 'error', inputs: [], name: 'AmountZero' },
  { type: 'error', inputs: [], name: 'ContractNotFinished' },
  { type: 'error', inputs: [], name: 'DurationNotElapsed' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidRewardRate' },
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
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
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
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_sender', internalType: 'address', type: 'address' },
    ],
    name: 'commit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'earned',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'finishAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
      { name: '_rewardShare', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastTimeRewardApplicable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'rewardPerToken',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardPerTokenStored',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardRate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'rewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IAGARO', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'updatedAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userRewardPerTokenPaid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_sender', internalType: 'address', type: 'address' }],
    name: 'withdraw',
    outputs: [
      { name: 'rewardsPaid', internalType: 'uint256', type: 'uint256' },
      { name: 'principalReturned', internalType: 'uint256', type: 'uint256' },
    ],
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
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'proof', internalType: 'bytes32', type: 'bytes32' },
      { name: 'selected', internalType: 'uint8', type: 'uint8' },
      { name: 'commitedToken', internalType: 'uint256', type: 'uint256' },
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
        internalType: 'struct CandidateData[]',
        type: 'tuple[]',
        components: [
          { name: 'count', internalType: 'uint256', type: 'uint256' },
          { name: 'commitToken', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'owner', internalType: 'address', type: 'address' },
      {
        name: 'syntheticRewardContract',
        internalType: 'address',
        type: 'address',
      },
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
      {
        name: 'syntheticRewardContract',
        internalType: 'address',
        type: 'address',
      },
      { name: 'pollVoterHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'count', internalType: 'uint256', type: 'uint256' },
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
      { name: 'isTokenRequired', internalType: 'bool', type: 'bool' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__
 */
export const useReadAgaro = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadAgaroAllowance = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"approve"`
 */
export const useReadAgaroApprove = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadAgaroBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadAgaroDecimals = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"name"`
 */
export const useReadAgaroName = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadAgaroSymbol = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadAgaroTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: agaroAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link agaroAbi}__
 */
export const useWriteAgaro = /*#__PURE__*/ createUseWriteContract({
  abi: agaroAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteAgaroBurn = /*#__PURE__*/ createUseWriteContract({
  abi: agaroAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteAgaroMint = /*#__PURE__*/ createUseWriteContract({
  abi: agaroAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteAgaroTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: agaroAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteAgaroTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: agaroAbi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link agaroAbi}__
 */
export const useSimulateAgaro = /*#__PURE__*/ createUseSimulateContract({
  abi: agaroAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateAgaroBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: agaroAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateAgaroMint = /*#__PURE__*/ createUseSimulateContract({
  abi: agaroAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateAgaroTransfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: agaroAbi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link agaroAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateAgaroTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: agaroAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link agaroAbi}__
 */
export const useWatchAgaroEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: agaroAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link agaroAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchAgaroApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: agaroAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link agaroAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchAgaroTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: agaroAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroTierSystemAbi}__
 */
export const useReadAgaroTierSystem = /*#__PURE__*/ createUseReadContract({
  abi: agaroTierSystemAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroTierSystemAbi}__ and `functionName` set to `"_normalizeTier"`
 */
export const useReadAgaroTierSystemNormalizeTier =
  /*#__PURE__*/ createUseReadContract({
    abi: agaroTierSystemAbi,
    functionName: '_normalizeTier',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroTierSystemAbi}__ and `functionName` set to `"baseIncentives"`
 */
export const useReadAgaroTierSystemBaseIncentives =
  /*#__PURE__*/ createUseReadContract({
    abi: agaroTierSystemAbi,
    functionName: 'baseIncentives',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroTierSystemAbi}__ and `functionName` set to `"lastCreatedPoll"`
 */
export const useReadAgaroTierSystemLastCreatedPoll =
  /*#__PURE__*/ createUseReadContract({
    abi: agaroTierSystemAbi,
    functionName: 'lastCreatedPoll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroTierSystemAbi}__ and `functionName` set to `"minHold"`
 */
export const useReadAgaroTierSystemMinHold =
  /*#__PURE__*/ createUseReadContract({
    abi: agaroTierSystemAbi,
    functionName: 'minHold',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroTierSystemAbi}__ and `functionName` set to `"platformFee"`
 */
export const useReadAgaroTierSystemPlatformFee =
  /*#__PURE__*/ createUseReadContract({
    abi: agaroTierSystemAbi,
    functionName: 'platformFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link agaroTierSystemAbi}__ and `functionName` set to `"tiers"`
 */
export const useReadAgaroTierSystemTiers = /*#__PURE__*/ createUseReadContract({
  abi: agaroTierSystemAbi,
  functionName: 'tiers',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useReadEntryPoint = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"_normalizeTier"`
 */
export const useReadEntryPointNormalizeTier =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: '_normalizeTier',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"admin"`
 */
export const useReadEntryPointAdmin = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'admin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"baseIncentives"`
 */
export const useReadEntryPointBaseIncentives =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'baseIncentives',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"commitThreshold"`
 */
export const useReadEntryPointCommitThreshold =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'commitThreshold',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"committedAmount"`
 */
export const useReadEntryPointCommittedAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'committedAmount',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"isHalted"`
 */
export const useReadEntryPointIsHalted = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'isHalted',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"lastCreatedPoll"`
 */
export const useReadEntryPointLastCreatedPoll =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'lastCreatedPoll',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"minHold"`
 */
export const useReadEntryPointMinHold = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'minHold',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"platformFee"`
 */
export const useReadEntryPointPlatformFee = /*#__PURE__*/ createUseReadContract(
  { abi: entryPointAbi, functionName: 'platformFee' },
)

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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"syntheticRewardImplementation"`
 */
export const useReadEntryPointSyntheticRewardImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: 'syntheticRewardImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"tiers"`
 */
export const useReadEntryPointTiers = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'tiers',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"token"`
 */
export const useReadEntryPointToken = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: 'token',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"adminOps"`
 */
export const useWriteEntryPointAdminOps = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
  functionName: 'adminOps',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"agree"`
 */
export const useWriteEntryPointAgree = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
  functionName: 'agree',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"commitSecurity"`
 */
export const useWriteEntryPointCommitSecurity =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'commitSecurity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"haltAll"`
 */
export const useWriteEntryPointHaltAll = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
  functionName: 'haltAll',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"resetConsensus"`
 */
export const useWriteEntryPointResetConsensus =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'resetConsensus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"resumeAll"`
 */
export const useWriteEntryPointResumeAll = /*#__PURE__*/ createUseWriteContract(
  { abi: entryPointAbi, functionName: 'resumeAll' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setBaseIncentives"`
 */
export const useWriteEntryPointSetBaseIncentives =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'setBaseIncentives',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setCommitTreshold"`
 */
export const useWriteEntryPointSetCommitTreshold =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'setCommitTreshold',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setMinHold"`
 */
export const useWriteEntryPointSetMinHold =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'setMinHold',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setPlatformFee"`
 */
export const useWriteEntryPointSetPlatformFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"updateTier"`
 */
export const useWriteEntryPointUpdateTier =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'updateTier',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"vote"`
 */
export const useWriteEntryPointVote = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
  functionName: 'vote',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteEntryPointWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawFee"`
 */
export const useWriteEntryPointWithdrawFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'withdrawFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawSecurity"`
 */
export const useWriteEntryPointWithdrawSecurity =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: 'withdrawSecurity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useSimulateEntryPoint = /*#__PURE__*/ createUseSimulateContract({
  abi: entryPointAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"adminOps"`
 */
export const useSimulateEntryPointAdminOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'adminOps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"agree"`
 */
export const useSimulateEntryPointAgree =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'agree',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"commitSecurity"`
 */
export const useSimulateEntryPointCommitSecurity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'commitSecurity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"haltAll"`
 */
export const useSimulateEntryPointHaltAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'haltAll',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"resetConsensus"`
 */
export const useSimulateEntryPointResetConsensus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'resetConsensus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"resumeAll"`
 */
export const useSimulateEntryPointResumeAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'resumeAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setBaseIncentives"`
 */
export const useSimulateEntryPointSetBaseIncentives =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'setBaseIncentives',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setCommitTreshold"`
 */
export const useSimulateEntryPointSetCommitTreshold =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'setCommitTreshold',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setMinHold"`
 */
export const useSimulateEntryPointSetMinHold =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'setMinHold',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"setPlatformFee"`
 */
export const useSimulateEntryPointSetPlatformFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"updateTier"`
 */
export const useSimulateEntryPointUpdateTier =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'updateTier',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateEntryPointWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawFee"`
 */
export const useSimulateEntryPointWithdrawFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'withdrawFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawSecurity"`
 */
export const useSimulateEntryPointWithdrawSecurity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: 'withdrawSecurity',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"SystemHalted"`
 */
export const useWatchEntryPointSystemHaltedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'SystemHalted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"SystemResumed"`
 */
export const useWatchEntryPointSystemResumedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'SystemResumed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"TokenCommitted"`
 */
export const useWatchEntryPointTokenCommittedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'TokenCommitted',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"WithdrawSucceeded"`
 */
export const useWatchEntryPointWithdrawSucceededEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: 'WithdrawSucceeded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iagaroAbi}__
 */
export const useReadIagaro = /*#__PURE__*/ createUseReadContract({
  abi: iagaroAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadIagaroAllowance = /*#__PURE__*/ createUseReadContract({
  abi: iagaroAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIagaroBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: iagaroAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadIagaroDecimals = /*#__PURE__*/ createUseReadContract({
  abi: iagaroAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"name"`
 */
export const useReadIagaroName = /*#__PURE__*/ createUseReadContract({
  abi: iagaroAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIagaroSymbol = /*#__PURE__*/ createUseReadContract({
  abi: iagaroAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIagaroTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: iagaroAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iagaroAbi}__
 */
export const useWriteIagaro = /*#__PURE__*/ createUseWriteContract({
  abi: iagaroAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIagaroApprove = /*#__PURE__*/ createUseWriteContract({
  abi: iagaroAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteIagaroBurn = /*#__PURE__*/ createUseWriteContract({
  abi: iagaroAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteIagaroMint = /*#__PURE__*/ createUseWriteContract({
  abi: iagaroAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIagaroTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: iagaroAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIagaroTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: iagaroAbi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iagaroAbi}__
 */
export const useSimulateIagaro = /*#__PURE__*/ createUseSimulateContract({
  abi: iagaroAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIagaroApprove = /*#__PURE__*/ createUseSimulateContract(
  { abi: iagaroAbi, functionName: 'approve' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateIagaroBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: iagaroAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateIagaroMint = /*#__PURE__*/ createUseSimulateContract({
  abi: iagaroAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIagaroTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iagaroAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iagaroAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIagaroTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iagaroAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iAgaroTierSystemAbi}__
 */
export const useReadIAgaroTierSystem = /*#__PURE__*/ createUseReadContract({
  abi: iAgaroTierSystemAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iAgaroTierSystemAbi}__ and `functionName` set to `"_normalizeTier"`
 */
export const useReadIAgaroTierSystemNormalizeTier =
  /*#__PURE__*/ createUseReadContract({
    abi: iAgaroTierSystemAbi,
    functionName: '_normalizeTier',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iAgaroTierSystemAbi}__ and `functionName` set to `"minHold"`
 */
export const useReadIAgaroTierSystemMinHold =
  /*#__PURE__*/ createUseReadContract({
    abi: iAgaroTierSystemAbi,
    functionName: 'minHold',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iAgaroTierSystemAbi}__ and `functionName` set to `"platformFee"`
 */
export const useReadIAgaroTierSystemPlatformFee =
  /*#__PURE__*/ createUseReadContract({
    abi: iAgaroTierSystemAbi,
    functionName: 'platformFee',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"vote"`
 */
export const useWriteIEntryPointVote = /*#__PURE__*/ createUseWriteContract({
  abi: iEntryPointAbi,
  functionName: 'vote',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteIEntryPointWithdraw = /*#__PURE__*/ createUseWriteContract(
  { abi: iEntryPointAbi, functionName: 'withdraw' },
)

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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"vote"`
 */
export const useSimulateIEntryPointVote =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iEntryPointAbi,
    functionName: 'vote',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iEntryPointAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateIEntryPointWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iEntryPointAbi,
    functionName: 'withdraw',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iEntryPointAbi}__ and `eventName` set to `"WithdrawSucceeded"`
 */
export const useWatchIEntryPointWithdrawSucceededEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iEntryPointAbi,
    eventName: 'WithdrawSucceeded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__
 */
export const useReadIMerkleTreeAllowList = /*#__PURE__*/ createUseReadContract({
  abi: iMerkleTreeAllowListAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__ and `functionName` set to `"isAllowed"`
 */
export const useReadIMerkleTreeAllowListIsAllowed =
  /*#__PURE__*/ createUseReadContract({
    abi: iMerkleTreeAllowListAbi,
    functionName: 'isAllowed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__ and `functionName` set to `"merkleRoot"`
 */
export const useReadIMerkleTreeAllowListMerkleRoot =
  /*#__PURE__*/ createUseReadContract({
    abi: iMerkleTreeAllowListAbi,
    functionName: 'merkleRoot',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__
 */
export const useWriteIMerkleTreeAllowList =
  /*#__PURE__*/ createUseWriteContract({ abi: iMerkleTreeAllowListAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteIMerkleTreeAllowListInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: iMerkleTreeAllowListAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__
 */
export const useSimulateIMerkleTreeAllowList =
  /*#__PURE__*/ createUseSimulateContract({ abi: iMerkleTreeAllowListAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateIMerkleTreeAllowListInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iMerkleTreeAllowListAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__
 */
export const useWatchIMerkleTreeAllowListEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iMerkleTreeAllowListAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iMerkleTreeAllowListAbi}__ and `eventName` set to `"MerkleRootUpdated"`
 */
export const useWatchIMerkleTreeAllowListMerkleRootUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iMerkleTreeAllowListAbi,
    eventName: 'MerkleRootUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSecurityAbi}__
 */
export const useReadISecurity = /*#__PURE__*/ createUseReadContract({
  abi: iSecurityAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSecurityAbi}__ and `functionName` set to `"isHalted"`
 */
export const useReadISecurityIsHalted = /*#__PURE__*/ createUseReadContract({
  abi: iSecurityAbi,
  functionName: 'isHalted',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iSecurityAbi}__
 */
export const useWatchISecurityEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: iSecurityAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iSecurityAbi}__ and `eventName` set to `"SystemHalted"`
 */
export const useWatchISecuritySystemHaltedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iSecurityAbi,
    eventName: 'SystemHalted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iSecurityAbi}__ and `eventName` set to `"SystemResumed"`
 */
export const useWatchISecuritySystemResumedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iSecurityAbi,
    eventName: 'SystemResumed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iSecurityAbi}__ and `eventName` set to `"TokenCommitted"`
 */
export const useWatchISecurityTokenCommittedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iSecurityAbi,
    eventName: 'TokenCommitted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__
 */
export const useReadISyntheticReward = /*#__PURE__*/ createUseReadContract({
  abi: iSyntheticRewardAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadISyntheticRewardBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"duration"`
 */
export const useReadISyntheticRewardDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'duration',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"earned"`
 */
export const useReadISyntheticRewardEarned =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'earned',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"finishAt"`
 */
export const useReadISyntheticRewardFinishAt =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'finishAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"lastTimeRewardApplicable"`
 */
export const useReadISyntheticRewardLastTimeRewardApplicable =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'lastTimeRewardApplicable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"rewardPerToken"`
 */
export const useReadISyntheticRewardRewardPerToken =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'rewardPerToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"rewardPerTokenStored"`
 */
export const useReadISyntheticRewardRewardPerTokenStored =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'rewardPerTokenStored',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"rewardRate"`
 */
export const useReadISyntheticRewardRewardRate =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'rewardRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"rewards"`
 */
export const useReadISyntheticRewardRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'rewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadISyntheticRewardTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"updatedAt"`
 */
export const useReadISyntheticRewardUpdatedAt =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'updatedAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"userRewardPerTokenPaid"`
 */
export const useReadISyntheticRewardUserRewardPerTokenPaid =
  /*#__PURE__*/ createUseReadContract({
    abi: iSyntheticRewardAbi,
    functionName: 'userRewardPerTokenPaid',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__
 */
export const useWriteISyntheticReward = /*#__PURE__*/ createUseWriteContract({
  abi: iSyntheticRewardAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"commit"`
 */
export const useWriteISyntheticRewardCommit =
  /*#__PURE__*/ createUseWriteContract({
    abi: iSyntheticRewardAbi,
    functionName: 'commit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteISyntheticRewardInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: iSyntheticRewardAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteISyntheticRewardWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: iSyntheticRewardAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__
 */
export const useSimulateISyntheticReward =
  /*#__PURE__*/ createUseSimulateContract({ abi: iSyntheticRewardAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"commit"`
 */
export const useSimulateISyntheticRewardCommit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iSyntheticRewardAbi,
    functionName: 'commit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateISyntheticRewardInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iSyntheticRewardAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iSyntheticRewardAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateISyntheticRewardWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iSyntheticRewardAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iVoterStorageAbi}__
 */
export const useReadIVoterStorage = /*#__PURE__*/ createUseReadContract({
  abi: iVoterStorageAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iVoterStorageAbi}__ and `functionName` set to `"isPollHaveVoterStorage"`
 */
export const useReadIVoterStorageIsPollHaveVoterStorage =
  /*#__PURE__*/ createUseReadContract({
    abi: iVoterStorageAbi,
    functionName: 'isPollHaveVoterStorage',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iVotingPollAbi}__ and `functionName` set to `"getPollData"`
 */
export const useReadIVotingPollGetPollData =
  /*#__PURE__*/ createUseReadContract({
    abi: iVotingPollAbi,
    functionName: 'getPollData',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link merkleTreeAllowlistAbi}__ and `eventName` set to `"MerkleRootUpdated"`
 */
export const useWatchMerkleTreeAllowlistMerkleRootUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: merkleTreeAllowlistAbi,
    eventName: 'MerkleRootUpdated',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityAbi}__
 */
export const useReadSecurity = /*#__PURE__*/ createUseReadContract({
  abi: securityAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"admin"`
 */
export const useReadSecurityAdmin = /*#__PURE__*/ createUseReadContract({
  abi: securityAbi,
  functionName: 'admin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"commitThreshold"`
 */
export const useReadSecurityCommitThreshold =
  /*#__PURE__*/ createUseReadContract({
    abi: securityAbi,
    functionName: 'commitThreshold',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"committedAmount"`
 */
export const useReadSecurityCommittedAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: securityAbi,
    functionName: 'committedAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"isHalted"`
 */
export const useReadSecurityIsHalted = /*#__PURE__*/ createUseReadContract({
  abi: securityAbi,
  functionName: 'isHalted',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityAbi}__
 */
export const useWriteSecurity = /*#__PURE__*/ createUseWriteContract({
  abi: securityAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"adminOps"`
 */
export const useWriteSecurityAdminOps = /*#__PURE__*/ createUseWriteContract({
  abi: securityAbi,
  functionName: 'adminOps',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"agree"`
 */
export const useWriteSecurityAgree = /*#__PURE__*/ createUseWriteContract({
  abi: securityAbi,
  functionName: 'agree',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"haltAll"`
 */
export const useWriteSecurityHaltAll = /*#__PURE__*/ createUseWriteContract({
  abi: securityAbi,
  functionName: 'haltAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"resetConsensus"`
 */
export const useWriteSecurityResetConsensus =
  /*#__PURE__*/ createUseWriteContract({
    abi: securityAbi,
    functionName: 'resetConsensus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"resumeAll"`
 */
export const useWriteSecurityResumeAll = /*#__PURE__*/ createUseWriteContract({
  abi: securityAbi,
  functionName: 'resumeAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"setCommitTreshold"`
 */
export const useWriteSecuritySetCommitTreshold =
  /*#__PURE__*/ createUseWriteContract({
    abi: securityAbi,
    functionName: 'setCommitTreshold',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityAbi}__
 */
export const useSimulateSecurity = /*#__PURE__*/ createUseSimulateContract({
  abi: securityAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"adminOps"`
 */
export const useSimulateSecurityAdminOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityAbi,
    functionName: 'adminOps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"agree"`
 */
export const useSimulateSecurityAgree = /*#__PURE__*/ createUseSimulateContract(
  { abi: securityAbi, functionName: 'agree' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"haltAll"`
 */
export const useSimulateSecurityHaltAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityAbi,
    functionName: 'haltAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"resetConsensus"`
 */
export const useSimulateSecurityResetConsensus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityAbi,
    functionName: 'resetConsensus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"resumeAll"`
 */
export const useSimulateSecurityResumeAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityAbi,
    functionName: 'resumeAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityAbi}__ and `functionName` set to `"setCommitTreshold"`
 */
export const useSimulateSecuritySetCommitTreshold =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityAbi,
    functionName: 'setCommitTreshold',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link securityAbi}__
 */
export const useWatchSecurityEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: securityAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link securityAbi}__ and `eventName` set to `"SystemHalted"`
 */
export const useWatchSecuritySystemHaltedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: securityAbi,
    eventName: 'SystemHalted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link securityAbi}__ and `eventName` set to `"SystemResumed"`
 */
export const useWatchSecuritySystemResumedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: securityAbi,
    eventName: 'SystemResumed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link securityAbi}__ and `eventName` set to `"TokenCommitted"`
 */
export const useWatchSecurityTokenCommittedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: securityAbi,
    eventName: 'TokenCommitted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__
 */
export const useReadSyntheticReward = /*#__PURE__*/ createUseReadContract({
  abi: syntheticRewardAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadSyntheticRewardBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"duration"`
 */
export const useReadSyntheticRewardDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'duration',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"earned"`
 */
export const useReadSyntheticRewardEarned = /*#__PURE__*/ createUseReadContract(
  { abi: syntheticRewardAbi, functionName: 'earned' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"finishAt"`
 */
export const useReadSyntheticRewardFinishAt =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'finishAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"lastTimeRewardApplicable"`
 */
export const useReadSyntheticRewardLastTimeRewardApplicable =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'lastTimeRewardApplicable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"owner"`
 */
export const useReadSyntheticRewardOwner = /*#__PURE__*/ createUseReadContract({
  abi: syntheticRewardAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"rewardPerToken"`
 */
export const useReadSyntheticRewardRewardPerToken =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'rewardPerToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"rewardPerTokenStored"`
 */
export const useReadSyntheticRewardRewardPerTokenStored =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'rewardPerTokenStored',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"rewardRate"`
 */
export const useReadSyntheticRewardRewardRate =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'rewardRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"rewards"`
 */
export const useReadSyntheticRewardRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'rewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"token"`
 */
export const useReadSyntheticRewardToken = /*#__PURE__*/ createUseReadContract({
  abi: syntheticRewardAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadSyntheticRewardTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"updatedAt"`
 */
export const useReadSyntheticRewardUpdatedAt =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'updatedAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"userRewardPerTokenPaid"`
 */
export const useReadSyntheticRewardUserRewardPerTokenPaid =
  /*#__PURE__*/ createUseReadContract({
    abi: syntheticRewardAbi,
    functionName: 'userRewardPerTokenPaid',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link syntheticRewardAbi}__
 */
export const useWriteSyntheticReward = /*#__PURE__*/ createUseWriteContract({
  abi: syntheticRewardAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"commit"`
 */
export const useWriteSyntheticRewardCommit =
  /*#__PURE__*/ createUseWriteContract({
    abi: syntheticRewardAbi,
    functionName: 'commit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteSyntheticRewardInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: syntheticRewardAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteSyntheticRewardRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: syntheticRewardAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteSyntheticRewardTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: syntheticRewardAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteSyntheticRewardWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: syntheticRewardAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link syntheticRewardAbi}__
 */
export const useSimulateSyntheticReward =
  /*#__PURE__*/ createUseSimulateContract({ abi: syntheticRewardAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"commit"`
 */
export const useSimulateSyntheticRewardCommit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: syntheticRewardAbi,
    functionName: 'commit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateSyntheticRewardInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: syntheticRewardAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateSyntheticRewardRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: syntheticRewardAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateSyntheticRewardTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: syntheticRewardAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link syntheticRewardAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateSyntheticRewardWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: syntheticRewardAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link syntheticRewardAbi}__
 */
export const useWatchSyntheticRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: syntheticRewardAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link syntheticRewardAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchSyntheticRewardInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: syntheticRewardAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link syntheticRewardAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchSyntheticRewardOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: syntheticRewardAbi,
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
