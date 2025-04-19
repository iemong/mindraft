use tauri_plugin_shell::{process::CommandEvent, ShellExt};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let (mut rx, mut child) = handle
                    .shell()
                    .sidecar("server")
                    .expect("failed to create sidecar")
                    .args(["--port", "3300"])
                    .spawn()
                    .expect("Failed to spawn sidecar");

                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        println!("Sidecar: {}", String::from_utf8_lossy(&line));
                    }
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
