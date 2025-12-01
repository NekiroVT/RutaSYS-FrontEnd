import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regisllegada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regisllegada.component.html',
  styleUrl: './regisllegada.component.css'
})
export class RegisllegadaComponent implements OnInit {
  
  // ⬅️ DEFINIMOS LAS PROPIEDADES QUE EL HTML NECESITA
  ubicacionActual: string = 'Detectando ubicación...';
  fechaHoraActual: string = '';

  ngOnInit(): void {
    // Al cargar el componente, simulamos la detección de datos
    this.detectarDatosAutomaticos();
  }

  detectarDatosAutomaticos() {
    // 1. Obtener Fecha y Hora actual
    const now = new Date();
    this.fechaHoraActual = `${now.toLocaleDateString()} - ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    // 2. Simular Ubicación (Aquí luego podrías usar la API del navegador)
    this.ubicacionActual = 'Almacén Central, Calle Principal 123';
  }

  registrarLlegada() {
    console.log('Registrando llegada en:', this.ubicacionActual);
    alert('¡Llegada registrada correctamente!');
  }
}