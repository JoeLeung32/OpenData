import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {BehaviorSubject} from 'rxjs';
import {SessionKeys, SessionStorage} from '../tools/sessionStorage';
import {ThemeModeType} from '../types/enums';

@Injectable({
  providedIn: 'root'
})
class ThemeService {

  public themeMode = new BehaviorSubject<string>('');
  private renderer: Renderer2;
  private session = new SessionStorage();

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initial();
  }

  set(mode: string): void {
    this.renderer.removeClass(document.body, ThemeModeType.dark);
    this.renderer.removeClass(document.body, ThemeModeType.light);
    if (Object.keys(ThemeModeType).includes(mode)) {
      this.renderer.addClass(document.body, mode);
      this.session.set(SessionKeys.themeMode, mode);
      this.themeMode.next(mode);
    }
  }

  detect(): void {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const result = isDark ? ThemeModeType.dark : ThemeModeType.light;
    this.set(result);
  }

  initial(): void {
    const themeMode = this.session.get(SessionKeys.themeMode)?.toString();
    if (Object.keys(ThemeModeType).includes(themeMode as string)) {
      this.set(themeMode as string);
    } else {
      this.detect();
    }
  }
}

export {
  ThemeModeType,
  ThemeService,
};
