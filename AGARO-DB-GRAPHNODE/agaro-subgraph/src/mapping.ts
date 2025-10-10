import { VotingPoolCreated, VoteSucceeded } from "../generated/EntryPoint/EntryPoint";
import { VotingPool, Vote } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleVotingPoolCreated(event: VotingPoolCreated): void {
  let pool = new VotingPool(event.params.poolHash.toHex());
  pool.version = event.params.version;
  pool.poolHash = event.params.poolHash;
  pool.save();
}

export function handleVoteSucceeded(event: VoteSucceeded): void {
  let vote = new Vote(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  vote.poolHash = event.params.poolHash;
  vote.voter = event.params.voter;
  vote.candidateSelected = new BigInt(1);
  vote.newPoolVoterHash = event.params.newPoolVoterHash;
  vote.timestamp = event.block.timestamp;
  vote.save();
}
