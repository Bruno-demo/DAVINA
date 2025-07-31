import { Component } from '@angular/core';
import { Router, RouterOutlet, Event } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      console.log('Router Event:', event);
    });
  }

}
