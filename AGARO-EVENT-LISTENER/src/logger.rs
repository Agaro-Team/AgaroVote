use chrono::Local;
use colored::*;

fn timestamp() -> String {
    format!("[{}]", Local::now().format("%H:%M:%S")).dimmed().to_string()
}

fn log_line(level: &str, color: &str, message: &str) {
    let level_colored = match color {
        "green" => level.green().bold(),
        "yellow" => level.yellow().bold(),
        "red" => level.red().bold(),
        "blue" => level.blue().bold(),
        _ => level.normal(),
    };
    println!("{} {} {}", timestamp(), level_colored, message);
}

pub fn log_info(message: &str) {
    log_line("INFO:", "blue", message);
}

pub fn log_success(message: &str) {
    log_line("SUCCESS:", "green", message);
}

pub fn log_warning(message: &str) {
    log_line("WARNING:", "yellow", message);
}

pub fn log_error(message: &str) {
    log_line("ERROR:", "red", message);
}
