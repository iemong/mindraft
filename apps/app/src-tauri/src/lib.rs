use std::fs;
use std::path::Path;
use tauri_plugin_shell::{process::CommandEvent, ShellExt};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct WorkspaceInfo {
    path: String,
    files: Vec<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn load_workspace(workspace_path: String) -> Result<WorkspaceInfo, String> {
    // ディレクトリが存在するか確認
    if !Path::new(&workspace_path).exists() {
        return Err("Workspace directory does not exist".to_string());
    }
    
    // assets フォルダの確認と作成
    let assets_path = Path::new(&workspace_path).join("assets");
    if !assets_path.exists() {
        fs::create_dir_all(&assets_path).map_err(|e| e.to_string())?;
    }
    
    // .md ファイル一覧を取得
    let entries = fs::read_dir(&workspace_path).map_err(|e| e.to_string())?;
    let mut md_files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.is_file() {
            if let Some(extension) = path.extension() {
                if extension == "md" {
                    md_files.push(path.to_string_lossy().to_string());
                }
            }
        }
    }
    
    Ok(WorkspaceInfo {
        path: workspace_path,
        files: md_files,
    })
}

#[tauri::command]
async fn open_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_file(file_path: String, content: String) -> Result<bool, String> {
    fs::write(&file_path, content).map_err(|e| e.to_string())?;
    Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
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
        .invoke_handler(tauri::generate_handler![
            greet,
            load_workspace,
            open_file,
            save_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
