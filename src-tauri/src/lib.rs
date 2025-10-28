#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // .plugin(
        //     tauri_plugin_log::Builder::new()
        //         .level(tauri_plugin_log::log::LevelFilter::Debug)
        //         .build(),
        // )
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            // if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Debug)
                        .build(),
                )?;
            // }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
