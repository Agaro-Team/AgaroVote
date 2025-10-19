import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'viem';

type EthereumAddress = `0x${string}`;

export const createLeaveHashByAddress = (address: EthereumAddress) => {
  return keccak256(address);
};

export const createHexRootByAddresses = (addresses: EthereumAddress[]) => {
  const whitelist = [...addresses];
  const leaves = whitelist.map(createLeaveHashByAddress);
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getHexRoot() as EthereumAddress;
};

export const createHexProofByLeaves = (
  leaves: EthereumAddress[],
  voterAddress: EthereumAddress
) => {
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getHexProof(keccak256(voterAddress)) as EthereumAddress[];
};
