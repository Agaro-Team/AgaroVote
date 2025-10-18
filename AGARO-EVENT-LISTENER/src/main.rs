mod events;
mod utils;

use crate::events::*;
use dotenvy::dotenv;
use ethers::prelude::*;
use futures::StreamExt;
use serde_json::json;
use std::{env, sync::Arc};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let rpc_url = env::var("RPC_URL")?;
    let contract_addr: Address = env::var("CONTRACT_ADDR")?.parse()?;
    let api_base_url = env::var("API_BASE_URL")?;

    let abi_json = utils::load_abi_from_file("abi/EntryPoint.json")?;

    let provider = Arc::new(Provider::<Http>::try_from(rpc_url)?);
    let contract = Contract::new(contract_addr, abi_json, provider);

    println!("Listening to contract: {:?}", contract.address());

    let poll_created_task = tokio::spawn({
        let contract = contract.clone();
        let api_base = api_base_url.clone();
        async move {
            let client = reqwest::Client::new();

            let event_builder = contract
                .event::<VotingPollCreated>()
                .from_block(BlockNumber::Number(0.into()));

            let mut stream = event_builder
                .stream()
                .await
                .expect("Failed to create VotingPollCreated stream");

            println!("Listening for VotingPollCreated events...");

            while let Some(Ok(event)) = stream.next().await {
                println!(
                    "[VotingPollCreated] poll_hash={:?}, version={}",
                    event.poll_hash, event.version
                );

                let poll_hash_hex = format!("{:?}", event.poll_hash);
                let url = format!("{}/polls/activate", api_base);

                let payload = json!({
                    "pollHash":event.poll_hash,
                    "syntheticRewardContractAddress": event.synthetic_reward_contract
                });

                match client.post(&url).json(&payload).send().await {
                    Ok(resp) => {
                        if resp.status().is_success() {
                            println!("Activated poll {} successfully", poll_hash_hex);
                        } else {
                            println!(
                                "Failed to activate poll {} — status: {}",
                                poll_hash_hex,
                                resp.status()
                            );
                        }
                    }
                    Err(err) => {
                        eprintln!("HTTP request failed for {}: {:?}", poll_hash_hex, err);
                    }
                }
            }
        }
    });

    let vote_succeeded_task = tokio::spawn({
        let contract = contract.clone();
        async move {
            let client = reqwest::Client::new();

            let event_builder = contract
                .clone()
                .event::<VoteSucceeded>()
                .from_block(BlockNumber::Number(0.into()));

            let mut stream = event_builder
                .stream()
                .await
                .expect("Failed to create VoteSucceeded stream");

            println!("Listening for VoteSucceeded events...");

            while let Some(Ok(event)) = stream.next().await {
                println!(
                    "[VoteSucceeded] poll_hash={:?}, voter={:?}, selected={}, voter_hash={}, commit_token={}",
                    event.poll_hash, event.voter, event.selected, event.new_poll_voter_hash, event.commit_token
                );
                let poll_hash_hex = format!("{:?}", event.poll_hash);
                let url = format!(
                    "{}/polls/{}/update-voter-hash",
                    api_base_url,
                    poll_hash_hex.trim_matches('"')
                );

                let payload = json!({
                    "voterHash": event.new_poll_voter_hash
                });

                match client.put(&url).json(&payload).send().await {
                    Ok(resp) => {
                        if resp.status().is_success() {
                            println!(
                                "Verified voter's credibility {} successfully",
                                poll_hash_hex
                            );
                        } else {
                            println!(
                                "Failed to verify credibility {} — status: {}",
                                poll_hash_hex,
                                resp.status()
                            );
                        }
                    }
                    Err(err) => {
                        eprintln!("HTTP request failed for {}: {:?}", poll_hash_hex, err);
                    }
                }
            }
        }
    });

    let withdraw_succeeded_task = tokio::spawn({
        let contract = contract.clone();
        async move {
            let event_builder = contract
                .clone()
                .event::<WithdrawSucceeded>()
                .from_block(BlockNumber::Number(0.into()));

            let mut stream = event_builder
                .stream()
                .await
                .expect("Failed to create WithdrawSucceeded stream");

            println!("Listening for WithdrawSucceeded events...");
            while let Some(Ok(event)) = stream.next().await {
                println!(
                "[WithdrawSucceeded] poll_hash={:?}, voter={:?}, withdrawed_token={}, reward={}",
                event.poll_hash, event.voter, event.withdrawed_token, event.withdrawed_reward
            );
            }
        }
    });

    tokio::try_join!(
        poll_created_task,
        vote_succeeded_task,
        withdraw_succeeded_task
    )?;

    Ok(())
}
