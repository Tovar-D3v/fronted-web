import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Event, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent           // ← aquí
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  currentUrl!: string;
  constructor(public _router: Router) {
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.split('/').pop()!;
      }
      window.scrollTo(0, 0);
    });
  }
}
