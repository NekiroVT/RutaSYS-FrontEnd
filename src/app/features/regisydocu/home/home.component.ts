import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // 1. Importar esto


@Component({
  selector: 'app-home',
  imports: [RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
