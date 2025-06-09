import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ROUTES, RouteInfo } from './sidebar.metadata';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public sidebarItems: RouteInfo[] = [];
  public isCollapsed = false;
  public listMaxHeight = 0;
  public submenuOpen: boolean[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.sidebarItems = ROUTES;
    this.submenuOpen = this.sidebarItems.map(() => false);
    this.updateListMaxHeight();
  }

  @HostListener('window:resize')
  updateListMaxHeight(): void {
    this.listMaxHeight = window.innerHeight - 80;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  callToggleMenu(index: number, hasSub: number): void {
    if (hasSub > 0) this.submenuOpen[index] = !this.submenuOpen[index];
  }

  mouseHover(): void {
    this.isCollapsed = false;
  }

  mouseOut(): void {
    // opcional
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
