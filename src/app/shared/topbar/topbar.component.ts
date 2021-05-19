import {Component, Inject, Input, OnInit, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../services/language.service';
import {ThemeModeType, ThemeService} from '../../services/theme.service';
import {faHome, faArrowLeft, faGlobeAmericas, faMoon} from '@fortawesome/free-solid-svg-icons';
import {faMoon as faBorderMoon} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {

  @Input() displayHomeIcon: boolean = false;
  @Input() displayBackIcon: boolean = false;
  @Input() displayPageTitle: string = 'webTitle';
  @Input() displayThemeIcon: boolean = false;
  @Input() displayLanguageIcon: boolean = false;
  homeIcon = faHome;
  backIcon = faArrowLeft;
  themeModeIcon = faBorderMoon;
  languageIcon = faGlobeAmericas;
  private renderer: Renderer2;

  constructor(
    public router: Router,
    public translateService: TranslateService,
    public languageService: LanguageService,
    public themeService: ThemeService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  get currentLanguage(): string {
    return this.languageService.translate.currentLang;
  }

  ngOnInit(): void {
    this.themeService.themeMode.subscribe((data) => {
      if (data === ThemeModeType.dark) {
        this.themeModeIcon = faMoon;
      } else {
        this.themeModeIcon = faBorderMoon;
      }
    });
  }

  changeLanguageAndUrl(lang: string): void {
    this.languageService.setUrlLang(lang);
    this.renderer.setProperty(document.getElementById('localMenu'), 'checked', false);
  }

  changeMode(): void {
    this.themeService.set(this.themeService.themeMode.getValue() === ThemeModeType.dark ? ThemeModeType.light : ThemeModeType.dark);
  }

}
