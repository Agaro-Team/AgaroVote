use ethers::abi::Abi;
use serde_json::Value;
use std::fs::File;
use std::io::Read;

pub fn load_abi_from_file(path: &str) -> anyhow::Result<Abi> {
    let mut file = File::open(path)?;
    let mut abi_json = String::new();
    file.read_to_string(&mut abi_json)?;

    let v: Value = serde_json::from_str(&abi_json)?;

    let abi_value = v
        .get("abi")
        .ok_or_else(|| anyhow::anyhow!("Missing 'abi' field"))?;

    let abi: Abi = serde_json::from_value(abi_value.clone())?;

    Ok(abi)
}
