import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {ReplaySubject} from 'rxjs';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  language$ = new ReplaySubject<LangChangeEvent>(1);
  translate = this.translateService;
  urlHasLang = false;
  urlLangCode = '';
  urlPathname = '';
  urlSearch: {
    [key: string]: string;
  } | undefined;
  basicTitleArray = ['webTitle'];

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private title: Title,
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.setPageTitle();
    });
  }

  setInitState(): void {
    this.translateService.addLangs(['en', 'tc', 'sc']);
    this.detectUrlLang();
    if (this.urlHasLang) {
      this.setLang(this.urlLangCode);
    } else {
      switch (!!this.translateService.getBrowserCultureLang()) {
        case ['zh-CN', 'zh-SG'].includes(this.translateService.getBrowserCultureLang()): {
          this.setUrlLang('sc');
          break;
        }
        case ['zh-HK', 'zh-TW', 'zh'].includes(this.translateService.getBrowserCultureLang()): {
          this.setUrlLang('tc');
          break;
        }
        default: {
          this.setUrlLang('en');
          break;
        }
      }
    }
  }

  setLang(lang: string): void {
    this.translateService.onLangChange.pipe(take(1)).subscribe(result => {
      this.language$.next(result);
    });
    this.translateService.use(lang);
  }

  setUrlLang(lang: string): void {
    let navigateCommands = [lang];
    this.translateService.onLangChange.pipe(take(1)).subscribe(result => {
      this.language$.next(result);
    });
    this.translateService.use(lang);
    this.detectUrlLang();
    if (this.urlPathname && this.urlPathname.toString().length) {
      navigateCommands = [lang, ...this.urlPathname.split('/')];
    }
    this.router.navigate(navigateCommands, {
      queryParams: this.urlSearch,
      replaceUrl: true
    }).then(r => r);
  }

  detectUrlLang(): void {
    const {pathname, search} = window.location;
    this.urlHasLang = pathname.search(/^\/(en|tc|sc)/) === 0;
    this.urlLangCode = pathname.substr(1, 2);
    this.urlPathname = decodeURIComponent(pathname.substr(4));
    if (search && search.toString().length) {
      search.toString().substr(1).split('&').forEach((param) => {
        const [key, value] = param.split('=');
        if (this.urlSearch) {
          this.urlSearch[key] = value;
        }
      });
    }
  }

  setPageTitle(arr?: Array<string>): void {
    let titleArray = [];
    if (arr && arr.length) {
      arr.forEach((code) => {
        this.basicTitleArray.push(code);
      });
    }
    titleArray = Array.from(new Set(this.basicTitleArray));
    if (titleArray && titleArray.length) {
      titleArray.forEach((code, idx) => {
        titleArray[idx] = this.translateService.instant(code);
      });
    }
    this.title.setTitle(titleArray.reverse().join(' - '));
  }

  resetPageTitle(): void {
    this.basicTitleArray = ['webTitle'];
    this.setPageTitle();
  }
}
