import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Counter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const counterAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Increment',
  },
  {
    type: 'function',
    inputs: [],
    name: 'inc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'by', internalType: 'uint256', type: 'uint256' }],
    name: 'incBy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'x',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CounterTest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const counterTestAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'log',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'log_address',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'val',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'log_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'val',
        internalType: 'int256[]',
        type: 'int256[]',
        indexed: false,
      },
    ],
    name: 'log_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'val',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'log_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'log_bytes',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'log_bytes32',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'int256', type: 'int256', indexed: false },
    ],
    name: 'log_int',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'log_named_address',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'val',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'log_named_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'val',
        internalType: 'int256[]',
        type: 'int256[]',
        indexed: false,
      },
    ],
    name: 'log_named_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'val',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'log_named_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'log_named_bytes',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'log_named_bytes32',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'int256', type: 'int256', indexed: false },
      {
        name: 'decimals',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'log_named_decimal_int',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'decimals',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'log_named_decimal_uint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'int256', type: 'int256', indexed: false },
    ],
    name: 'log_named_int',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'log_named_string',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'log_named_uint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'log_string',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'log_uint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'logs',
  },
  {
    type: 'function',
    inputs: [],
    name: 'IS_TEST',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeArtifacts',
    outputs: [
      {
        name: 'excludedArtifacts_',
        internalType: 'string[]',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeContracts',
    outputs: [
      {
        name: 'excludedContracts_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeSelectors',
    outputs: [
      {
        name: 'excludedSelectors_',
        internalType: 'struct StdInvariant.FuzzSelector[]',
        type: 'tuple[]',
        components: [
          { name: 'addr', internalType: 'address', type: 'address' },
          { name: 'selectors', internalType: 'bytes4[]', type: 'bytes4[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeSenders',
    outputs: [
      {
        name: 'excludedSenders_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'failed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetArtifactSelectors',
    outputs: [
      {
        name: 'targetedArtifactSelectors_',
        internalType: 'struct StdInvariant.FuzzArtifactSelector[]',
        type: 'tuple[]',
        components: [
          { name: 'artifact', internalType: 'string', type: 'string' },
          { name: 'selectors', internalType: 'bytes4[]', type: 'bytes4[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetArtifacts',
    outputs: [
      {
        name: 'targetedArtifacts_',
        internalType: 'string[]',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetContracts',
    outputs: [
      {
        name: 'targetedContracts_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetInterfaces',
    outputs: [
      {
        name: 'targetedInterfaces_',
        internalType: 'struct StdInvariant.FuzzInterface[]',
        type: 'tuple[]',
        components: [
          { name: 'addr', internalType: 'address', type: 'address' },
          { name: 'artifacts', internalType: 'string[]', type: 'string[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetSelectors',
    outputs: [
      {
        name: 'targetedSelectors_',
        internalType: 'struct StdInvariant.FuzzSelector[]',
        type: 'tuple[]',
        components: [
          { name: 'addr', internalType: 'address', type: 'address' },
          { name: 'selectors', internalType: 'bytes4[]', type: 'bytes4[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetSenders',
    outputs: [
      {
        name: 'targetedSenders_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'x', internalType: 'uint8', type: 'uint8' }],
    name: 'testFuzz_Inc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'test_IncByZero',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'test_InitialValue',
    outputs: [],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterAbi}__
 */
export const useReadCounter = /*#__PURE__*/ createUseReadContract({
  abi: counterAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterAbi}__ and `functionName` set to `"x"`
 */
export const useReadCounterX = /*#__PURE__*/ createUseReadContract({
  abi: counterAbi,
  functionName: 'x',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link counterAbi}__
 */
export const useWriteCounter = /*#__PURE__*/ createUseWriteContract({
  abi: counterAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link counterAbi}__ and `functionName` set to `"inc"`
 */
export const useWriteCounterInc = /*#__PURE__*/ createUseWriteContract({
  abi: counterAbi,
  functionName: 'inc',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link counterAbi}__ and `functionName` set to `"incBy"`
 */
export const useWriteCounterIncBy = /*#__PURE__*/ createUseWriteContract({
  abi: counterAbi,
  functionName: 'incBy',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link counterAbi}__
 */
export const useSimulateCounter = /*#__PURE__*/ createUseSimulateContract({
  abi: counterAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link counterAbi}__ and `functionName` set to `"inc"`
 */
export const useSimulateCounterInc = /*#__PURE__*/ createUseSimulateContract({
  abi: counterAbi,
  functionName: 'inc',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link counterAbi}__ and `functionName` set to `"incBy"`
 */
export const useSimulateCounterIncBy = /*#__PURE__*/ createUseSimulateContract({
  abi: counterAbi,
  functionName: 'incBy',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterAbi}__
 */
export const useWatchCounterEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: counterAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterAbi}__ and `eventName` set to `"Increment"`
 */
export const useWatchCounterIncrementEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterAbi,
    eventName: 'Increment',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__
 */
export const useReadCounterTest = /*#__PURE__*/ createUseReadContract({
  abi: counterTestAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"IS_TEST"`
 */
export const useReadCounterTestIsTest = /*#__PURE__*/ createUseReadContract({
  abi: counterTestAbi,
  functionName: 'IS_TEST',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"excludeArtifacts"`
 */
export const useReadCounterTestExcludeArtifacts =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'excludeArtifacts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"excludeContracts"`
 */
export const useReadCounterTestExcludeContracts =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'excludeContracts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"excludeSelectors"`
 */
export const useReadCounterTestExcludeSelectors =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'excludeSelectors',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"excludeSenders"`
 */
export const useReadCounterTestExcludeSenders =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'excludeSenders',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"failed"`
 */
export const useReadCounterTestFailed = /*#__PURE__*/ createUseReadContract({
  abi: counterTestAbi,
  functionName: 'failed',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"targetArtifactSelectors"`
 */
export const useReadCounterTestTargetArtifactSelectors =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'targetArtifactSelectors',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"targetArtifacts"`
 */
export const useReadCounterTestTargetArtifacts =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'targetArtifacts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"targetContracts"`
 */
export const useReadCounterTestTargetContracts =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'targetContracts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"targetInterfaces"`
 */
export const useReadCounterTestTargetInterfaces =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'targetInterfaces',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"targetSelectors"`
 */
export const useReadCounterTestTargetSelectors =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'targetSelectors',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"targetSenders"`
 */
export const useReadCounterTestTargetSenders =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'targetSenders',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"test_InitialValue"`
 */
export const useReadCounterTestTestInitialValue =
  /*#__PURE__*/ createUseReadContract({
    abi: counterTestAbi,
    functionName: 'test_InitialValue',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link counterTestAbi}__
 */
export const useWriteCounterTest = /*#__PURE__*/ createUseWriteContract({
  abi: counterTestAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"setUp"`
 */
export const useWriteCounterTestSetUp = /*#__PURE__*/ createUseWriteContract({
  abi: counterTestAbi,
  functionName: 'setUp',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"testFuzz_Inc"`
 */
export const useWriteCounterTestTestFuzzInc =
  /*#__PURE__*/ createUseWriteContract({
    abi: counterTestAbi,
    functionName: 'testFuzz_Inc',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"test_IncByZero"`
 */
export const useWriteCounterTestTestIncByZero =
  /*#__PURE__*/ createUseWriteContract({
    abi: counterTestAbi,
    functionName: 'test_IncByZero',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link counterTestAbi}__
 */
export const useSimulateCounterTest = /*#__PURE__*/ createUseSimulateContract({
  abi: counterTestAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"setUp"`
 */
export const useSimulateCounterTestSetUp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: counterTestAbi,
    functionName: 'setUp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"testFuzz_Inc"`
 */
export const useSimulateCounterTestTestFuzzInc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: counterTestAbi,
    functionName: 'testFuzz_Inc',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link counterTestAbi}__ and `functionName` set to `"test_IncByZero"`
 */
export const useSimulateCounterTestTestIncByZero =
  /*#__PURE__*/ createUseSimulateContract({
    abi: counterTestAbi,
    functionName: 'test_IncByZero',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__
 */
export const useWatchCounterTestEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: counterTestAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log"`
 */
export const useWatchCounterTestLogEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_address"`
 */
export const useWatchCounterTestLogAddressEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_address',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_array"`
 */
export const useWatchCounterTestLogArrayEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_array',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_bytes"`
 */
export const useWatchCounterTestLogBytesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_bytes',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_bytes32"`
 */
export const useWatchCounterTestLogBytes32Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_bytes32',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_int"`
 */
export const useWatchCounterTestLogIntEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_int',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_address"`
 */
export const useWatchCounterTestLogNamedAddressEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_address',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_array"`
 */
export const useWatchCounterTestLogNamedArrayEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_array',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_bytes"`
 */
export const useWatchCounterTestLogNamedBytesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_bytes',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_bytes32"`
 */
export const useWatchCounterTestLogNamedBytes32Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_bytes32',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_decimal_int"`
 */
export const useWatchCounterTestLogNamedDecimalIntEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_decimal_int',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_decimal_uint"`
 */
export const useWatchCounterTestLogNamedDecimalUintEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_decimal_uint',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_int"`
 */
export const useWatchCounterTestLogNamedIntEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_int',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_string"`
 */
export const useWatchCounterTestLogNamedStringEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_string',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_named_uint"`
 */
export const useWatchCounterTestLogNamedUintEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_named_uint',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_string"`
 */
export const useWatchCounterTestLogStringEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_string',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"log_uint"`
 */
export const useWatchCounterTestLogUintEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'log_uint',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link counterTestAbi}__ and `eventName` set to `"logs"`
 */
export const useWatchCounterTestLogsEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: counterTestAbi,
    eventName: 'logs',
  })
