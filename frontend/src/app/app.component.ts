import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { listen } from '@tauri-apps/api/event';
import { FormsModule } from '@angular/forms'; // <-- Importar FormsModule


@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private ws!: WebSocket;
  logs: string = '';

  constructor(private cdr: ChangeDetectorRef) {} // Inyectar ChangeDetectorRef

  ngOnInit(): void {
    this.connectWebSocket();

    // Escuchar logs desde Rust
    listen<string>('log', (event) => {
      console.log('📩 Log recibido de Rust:', event.payload);
      this.logs += event.payload + '\n';

      // 🔹 Forzar a Angular a detectar cambios en la UI
      this.cdr.detectChanges();
    });
  }

  connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:3002'); // WebSocket del backend para recibir la respuesta

    this.ws.onmessage = (event) => {
      console.log('📩 Respuesta recibida de Tauri:', event.data);
    };

    this.ws.onerror = (error) => {
      console.error('❌ Error en WebSocket:', error);
    };
  }

  sendData() {
    fetch('http://localhost:3000/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', payload: 'Hello from Angular!' }),
    })
      .then((response) => response.json())
      .then((data) => console.log('📤 Enviado al backend:', data))
      .catch((error) => console.error('❌ Error enviando:', error));
  }
}
