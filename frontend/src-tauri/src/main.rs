// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::thread;
use tokio_tungstenite::{ connect_async, tungstenite::protocol::Message };
use futures_util::{ StreamExt, SinkExt };
use url::Url;
use std::env;
use tauri::Emitter;


  fn execute_java_jar(app_handle: tauri::AppHandle, json_data: &str) -> String {
    let jar_path = r"c:\\CORE\\libs\\jarWrapper.jar";
  
    let command_string = format!(r#"java -jar "{}" '{}'"#, jar_path, json_data);
    println!("🔹 Ejecutando comando: {}", command_string);
    app_handle.emit("log", format!("Ejecutando: {}", command_string)).unwrap();
  
    let output = Command::new("java").arg("-jar").arg(jar_path).arg(json_data).output();
  
    match output {
      Ok(output) => {
        let result = String::from_utf8_lossy(&output.stdout).to_string();
        println!("✅ Resultado del JAR: {}", result);
        app_handle.emit("log", result.clone()).unwrap(); // Enviar salida del JAR a Angular
        result
      }
      Err(e) => {
        let error_msg = format!("❌ Error ejecutando el JAR: {:?}", e);
        println!("{}", error_msg);
        app_handle.emit("log", error_msg.clone()).unwrap(); // Enviar error a Angular
        error_msg
      }
    }
  }

async fn connect_to_websocket(app_handle: tauri::AppHandle) {
  let url = match Url::parse("ws://cul-cor-nodejs:3001") {
    Ok(url) => url.to_string(),
    Err(e) => {
      let error_msg = format!("❌ Error al parsear la URL: {:?}", e);
      println!("{}", error_msg);
      app_handle.emit("log", error_msg).unwrap();
      return;
    }
  };

  match connect_async(&url).await {
    Ok((ws_stream, _)) => {
      let (mut write, mut read) = ws_stream.split();
      let connected_msg = format!("✅ Tauri conectado al WebSocket en {}", url);
      println!("{}", connected_msg);
      app_handle.emit("log", connected_msg).unwrap();

      while let Some(message) = read.next().await {
        match message {
          Ok(Message::Text(text)) => {
            let received_msg = format!("📩 Mensaje recibido del backend: {}", text);
            println!("{}", received_msg);
            app_handle.emit("log", received_msg.clone()).unwrap();

            // Ejecutar el JAR con el JSON recibido
            let result = execute_java_jar(app_handle.clone(), &text);

            // Enviar respuesta al backend
            if let Err(e) = write.send(Message::Text(result.clone().into())).await {
              let error_msg = format!("❌ Error enviando respuesta a backend: {:?}", e);
              println!("{}", error_msg);
              app_handle.emit("log", error_msg).unwrap();
              break;
            }
          }
          Err(e) => {
            let error_msg = format!("❌ Error en WebSocket: {:?}", e);
            println!("{}", error_msg);
            app_handle.emit("log", error_msg).unwrap();
            break;
          }
          _ => {}
        }
      }
    }
    Err(e) => {
      let error_msg = format!("❌ Error al conectar al WebSocket: {:?}", e);
      println!("{}", error_msg);
      app_handle.emit("log", error_msg).unwrap();
    }
  }
}    


fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let app_handle = app.handle().clone();

      // 🔹 Emitimos un log de prueba para ver si Angular lo recibe
      app_handle.emit("log", "🔹 Tauri iniciado correctamente").unwrap();

      thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(connect_to_websocket(app_handle));
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("Error mientras se ejecutaba la aplicación");
}