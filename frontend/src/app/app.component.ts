import { Component } from '@angular/core';
import { Router, RouterOutlet, Event, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { BackToTopComponent } from './shared/back-to-top/back-to-top.component';
import { SeoService } from './services/seo.service';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, BackToTopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService
  ) {
    this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => { while (route.firstChild) route = route.firstChild; return route; }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      this.seoService.updateMeta({
        title: data['title'] || undefined,
        description: data['description'] || undefined,
      });
    });
  }

}
