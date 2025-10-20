mod events;
mod logger;
mod utils;

use crate::events::*;
use crate::logger::*;
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

    log_info(&format!("Listening to contract: {:?}", contract.address()));

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

            log_info("Listening for VotingPollCreated events...");

            while let Some(Ok(event)) = stream.next().await {
                log_info(&format!(
                    "[VotingPollCreated] poll_hash={:?}, version={}",
                    event.poll_hash, event.version
                ));

                let poll_hash_hex = format!("{:?}", event.poll_hash);
                let url = format!("{}/polls/activate", api_base);

                let payload = json!({
                    "pollHash": event.poll_hash,
                    "syntheticRewardContractAddress": event.synthetic_reward_contract
                });

                match client.post(&url).json(&payload).send().await {
                    Ok(resp) => {
                        if resp.status().is_success() {
                            log_success(&format!("Activated poll {} successfully", poll_hash_hex));
                        } else {
                            log_warning(&format!(
                                "Failed to activate poll {} — status: {}. Retrying...",
                                poll_hash_hex,
                                resp.status()
                            ));

                            let mut retries = 0;
                            let max_retries = 3;
                            let mut success = false;

                            while retries < max_retries {
                                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                                retries += 1;

                                match client.post(&url).json(&payload).send().await {
                                    Ok(retry_resp) => {
                                        if retry_resp.status().is_success() {
                                            log_success(&format!(
                                                "Activated poll {} successfully after {} retries",
                                                poll_hash_hex, retries
                                            ));
                                            success = true;
                                            break;
                                        } else {
                                            log_warning(&format!(
                                                "Retry {} failed for poll {} — status: {}",
                                                retries,
                                                poll_hash_hex,
                                                retry_resp.status()
                                            ));
                                        }
                                    }
                                    Err(retry_err) => {
                                        log_error(&format!(
                                            "Retry {} failed for {}: {:?}",
                                            retries, poll_hash_hex, retry_err
                                        ));
                                    }
                                }
                            }

                            if !success {
                                log_error(&format!(
                                    "All retries failed for poll {} after {} attempts.",
                                    poll_hash_hex, max_retries
                                ));
                            }
                        }
                    }
                    Err(err) => {
                        log_error(&format!(
                            "HTTP request failed for {}: {:?}",
                            poll_hash_hex, err
                        ));
                    }
                }
            }
        }
    });

    let vote_succeeded_task = tokio::spawn({
        let contract = contract.clone();
        let api_base = api_base_url.clone();
        async move {
            let client = reqwest::Client::new();

            let event_builder = contract
                .event::<VoteSucceeded>()
                .from_block(BlockNumber::Number(0.into()));

            let mut stream = event_builder
                .stream()
                .await
                .expect("Failed to create VoteSucceeded stream");

            log_info("Listening for VoteSucceeded events...");

            while let Some(Ok(event)) = stream.next().await {
                log_info(&format!(
                    "[VoteSucceeded] poll_hash={:?}, voter={:?}, selected={}, voter_hash={}, commit_token={}",
                    event.poll_hash, event.voter, event.selected, event.new_poll_voter_hash, event.commit_token
                ));

                let poll_hash_hex = format!("{:?}", event.poll_hash);
                let url = format!(
                    "{}/polls/{}/update-voter-hash",
                    api_base,
                    poll_hash_hex.trim_matches('"')
                );

                let payload = json!({
                    "voterHash": event.new_poll_voter_hash
                });

                match client.put(&url).json(&payload).send().await {
                    Ok(resp) => {
                        if resp.status().is_success() {
                            log_success(&format!(
                                "Verified voter's credibility {} successfully",
                                poll_hash_hex
                            ));
                        } else {
                            log_warning(&format!(
                                "Failed to verify credibility {} — status: {}. Retrying...",
                                poll_hash_hex,
                                resp.status()
                            ));

                            let mut retries = 0;
                            let max_retries = 3;
                            let mut success = false;

                            while retries < max_retries {
                                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                                retries += 1;

                                match client.put(&url).json(&payload).send().await {
                                    Ok(retry_resp) => {
                                        if retry_resp.status().is_success() {
                                            log_success(&format!(
                                                "Verified voter's credibility {} after {} retries",
                                                poll_hash_hex, retries
                                            ));
                                            success = true;
                                            break;
                                        } else {
                                            log_warning(&format!(
                                                "Retry {} failed for {} — status: {}",
                                                retries,
                                                poll_hash_hex,
                                                retry_resp.status()
                                            ));
                                        }
                                    }
                                    Err(retry_err) => {
                                        log_error(&format!(
                                            "Retry {} failed for {}: {:?}",
                                            retries, poll_hash_hex, retry_err
                                        ));
                                    }
                                }
                            }

                            if !success {
                                log_error(&format!(
                                    "All retries failed for {} after {} attempts.",
                                    poll_hash_hex, max_retries
                                ));
                            }
                        }
                    }
                    Err(err) => {
                        log_error(&format!(
                            "HTTP request failed for {}: {:?}",
                            poll_hash_hex, err
                        ));
                    }
                }
            }
        }
    });

    let withdraw_succeeded_task = tokio::spawn({
        let contract = contract.clone();
        let api_base = api_base_url.clone();
        async move {
            let client = reqwest::Client::new();

            let event_builder = contract
                .event::<WithdrawSucceeded>()
                .from_block(BlockNumber::Number(0.into()));

            let mut stream = event_builder
                .stream()
                .await
                .expect("Failed to create WithdrawSucceeded stream");

            log_info("Listening for WithdrawSucceeded events...");

            while let Some(Ok(event)) = stream.next().await {
                log_info(&format!(
                    "[WithdrawSucceeded] poll_hash={:?}, voter={:?}, withdrawed_token={}, reward={}",
                    event.poll_hash, event.voter, event.withdrawed_token, event.withdrawed_reward
                ));

                let poll_hash_hex = format!("{:?}", event.poll_hash)
                    .trim_matches('"')
                    .to_string();

                let principal_amount_str = event.withdrawed_token.to_string();
                let reward_amount_str = event.withdrawed_reward.to_string();
                let voter_address_str = format!("{:?}", event.voter).trim_matches('"').to_string();

                let url = format!("{}/rewards/claim", api_base);

                let payload = json!({
                    "pollHash": poll_hash_hex,
                    "principalAmount": principal_amount_str,
                    "rewardAmount": reward_amount_str,
                    "voterWalletAddress": voter_address_str
                });

                match client.put(&url).json(&payload).send().await {
                    Ok(resp) => {
                        if resp.status().is_success() {
                            log_success(&format!(
                                "Reported withdrawal success for poll={} voter={}",
                                poll_hash_hex, voter_address_str
                            ));
                        } else {
                            log_warning(&format!(
                                "Failed to report withdrawal for poll={} — status: {}. Retrying...",
                                poll_hash_hex,
                                resp.status()
                            ));

                            let mut retries = 0;
                            let max_retries = 3;
                            let mut success = false;

                            while retries < max_retries {
                                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                                retries += 1;

                                match client.put(&url).json(&payload).send().await {
                                    Ok(retry_resp) => {
                                        if retry_resp.status().is_success() {
                                            log_success(&format!(
                                                "Reported withdrawal success for poll={} voter={} after {} retries",
                                                poll_hash_hex, voter_address_str, retries
                                            ));
                                            success = true;
                                            break;
                                        } else {
                                            log_warning(&format!(
                                                "Retry {} failed for poll={} — status: {}",
                                                retries,
                                                poll_hash_hex,
                                                retry_resp.status()
                                            ));
                                        }
                                    }
                                    Err(retry_err) => {
                                        log_error(&format!(
                                            "Retry {} failed for poll={} voter={}: {:?}",
                                            retries, poll_hash_hex, voter_address_str, retry_err
                                        ));
                                    }
                                }
                            }

                            if !success {
                                log_error(&format!(
                                    "All retries failed for poll={} after {} attempts.",
                                    poll_hash_hex, max_retries
                                ));
                            }
                        }
                    }
                    Err(err) => {
                        log_error(&format!(
                            "HTTP request failed for poll={} voter={}: {:?}",
                            poll_hash_hex, voter_address_str, err
                        ));
                    }
                }
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
