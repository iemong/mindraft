use serde::{Deserialize, Serialize};
use std::fs;
use std::str;
use std::path::{Path};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

// ファイルシステムノードを表すenum
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
enum FileSystemNode {
    File { name: String, path: String },
    Directory { name: String, path: String, children: Vec<FileSystemNode> },
}

#[derive(Debug, Serialize, Deserialize)]
struct WorkspaceInfo {
    path: String,
    tree: Vec<FileSystemNode>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 指定されたディレクトリを再帰的に探索し、FileSystemNode の階層構造を構築する関数
fn build_file_tree(dir_path: &Path) -> Result<Vec<FileSystemNode>, String> {
    let mut nodes = Vec::new();

    for entry in fs::read_dir(dir_path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let name = path.file_name().map_or_else(
            || "".to_string(),
            |os_name| os_name.to_string_lossy().to_string(),
        );
        let path_str = path.to_string_lossy().to_string();

        if name == "assets" && path.is_dir() {
            continue;
        }

        if path.is_dir() {
            let children = build_file_tree(&path)?;
            nodes.push(FileSystemNode::Directory {
                name,
                path: path_str,
                children,
            });
        } else if path.is_file() {
            if path.extension().map_or(false, |ext| ext == "md") {
                nodes.push(FileSystemNode::File { name, path: path_str });
            }
        }
    }

    nodes.sort_by(|a, b| {
        match (a, b) {
            (FileSystemNode::Directory { .. }, FileSystemNode::File { .. }) => std::cmp::Ordering::Less,
            (FileSystemNode::File { .. }, FileSystemNode::Directory { .. }) => std::cmp::Ordering::Greater,
            (FileSystemNode::Directory { name: name_a, .. }, FileSystemNode::Directory { name: name_b, .. }) => name_a.cmp(name_b),
            (FileSystemNode::File { name: name_a, .. }, FileSystemNode::File { name: name_b, .. }) => name_a.cmp(name_b),
        }
    });

    Ok(nodes)
}

#[tauri::command]
async fn load_workspace(workspace_path: String) -> Result<WorkspaceInfo, String> {
    let workspace_path_obj = Path::new(&workspace_path);
    if !workspace_path_obj.exists() || !workspace_path_obj.is_dir() {
        return Err("Workspace directory does not exist or is not a directory".to_string());
    }

    let assets_path = workspace_path_obj.join("assets");
    if !assets_path.exists() {
        fs::create_dir_all(&assets_path).map_err(|e| e.to_string())?;
    }

    let file_tree = build_file_tree(workspace_path_obj)?;

    Ok(WorkspaceInfo {
        path: workspace_path,
        tree: file_tree,
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

#[tauri::command]
async fn start_api_server(app_handle: tauri::AppHandle) -> Result<(), String> {
    let sidecar = app_handle.shell().sidecar("server")
        .map_err(|e| e.to_string())?;
    
    let (mut rx, _child) = sidecar
        .args(["--start"])
        .spawn()
        .map_err(|e| e.to_string())?;
    
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    if let Ok(text) = str::from_utf8(&line) {
                        println!("API Server: {}", text);
                    }
                }
                CommandEvent::Stderr(line) => {
                    if let Ok(text) = str::from_utf8(&line) {
                        eprintln!("API Server Error: {}", text);
                    }
                }
                _ => {}
            }
        }
    });
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match start_api_server(handle).await {
                    Ok(_) => println!("API server started successfully"),
                    Err(e) => eprintln!("Failed to start API server: {}", e),
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            load_workspace,
            open_file,
            save_file,
            start_api_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
