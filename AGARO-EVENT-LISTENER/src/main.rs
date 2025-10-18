mod events;
mod utils;

use crate::events::*;
use dotenvy::dotenv;
use ethers::prelude::*;
use futures::StreamExt;
use std::{env, sync::Arc};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let rpc_url = env::var("RPC_URL")?;
    let contract_addr: Address = env::var("CONTRACT_ADDR")?.parse()?;

    let abi_json = utils::load_abi_from_file("abi/EntryPoint.json")?;

    let provider = Arc::new(Provider::<Http>::try_from(rpc_url)?);
    let contract = Contract::new(contract_addr, abi_json, provider);

    println!("Listening to contract: {:?}", contract.address());

    let poll_created_task = tokio::spawn({
        let contract = contract.clone();
        async move {
            let client = reqwest::Client::new(); // ✅ create HTTP client once per task

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

                let poll_hash_hex = format!("{:?}", event.poll_hash); // Convert H256 to string
                let url = format!(
                    "https://agaro-api.ardial.tech/api/v1/polls/{}/activate",
                    poll_hash_hex.trim_matches('"')
                );

                match client.post(&url).send().await {
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
                    "[VoteSucceeded] poll_hash={:?}, voter={:?}, selected={}, commit_token={}",
                    event.poll_hash, event.voter, event.selected, event.commit_token
                );
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
