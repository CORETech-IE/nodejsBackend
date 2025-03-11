import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-sender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-sender.component.html',
  styleUrl: './data-sender.component.scss'
})
export class DataSenderComponent {
  // Objeto que almacenará los datos a enviar
  jsonData: any = {
    nombre: '',
    mensaje: ''
  };
  
  // Variable para guardar la respuesta del servidor
  respuesta: any = null;

  constructor(private apiService: ApiService) {}

  // Método para enviar datos al servidor
  enviarDatos() {
    this.apiService.sendData(this.jsonData).subscribe({
      next: (response) => {
        console.log('Respuesta recibida:', response);
        this.respuesta = response;
      },
      error: (error) => {
        console.error('Error al enviar datos:', error);
        this.respuesta = { error: 'Ocurrió un error al enviar los datos' };
      }
    });
  }
}