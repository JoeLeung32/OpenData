import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {faLongArrowAltUp, faLongArrowAltDown, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {faCloudRain, faWind, faThermometerHalf, faTint} from '@fortawesome/free-solid-svg-icons';
import {LanguageService} from '../../../services/language.service';
import {HkoLatestService} from '../../../services/hkgov/hko/hko-latest.service';

interface LangPackType {
    overview?: string;
    tcInformation?: string;
    fireDangerWarnings?: string;
    outlook?: string;
    seaTemp?: string;
    soilTemp?: string;
    weatherForecast?: string;
    nineDayWeatherForecast?: string;
}

@Component({
    selector: 'app-hko-forecast-local',
    templateUrl: './hko-forecast-local.component.html',
    styleUrls: ['./hko-forecast-local.component.scss']
})
export class HkoForecastLocalComponent implements OnInit {

    @ViewChildren('carousels', {read: NgbCarousel}) carouselComponent: QueryList<NgbCarousel> | undefined;

    language = this.languageService.translate.currentLang;
    public langPack: LangPackType = {};
    public localForecast: any = null;
    public nineDayForecast: any = null;
    public iconLongUp = faLongArrowAltUp;
    public iconLongDown = faLongArrowAltDown;
    public iconCloudRain = faCloudRain;
    public iconWind = faWind;
    public iconThermometer = faThermometerHalf;
    public iconWet = faTint;
    public iconInfo = faInfoCircle;

    constructor(
        private httpClient: HttpClient,
        private languageService: LanguageService,
        private hkoLatestService: HkoLatestService,
    ) {
        this.i18nLazyLoad();
        languageService.translate.onLangChange.subscribe(({lang}) => {
            this.language = lang;
            this.i18nLazyLoad();
            this.ngOnInit();
        });
    }

    ngOnInit(): void {
        this.hkoLatestService.requestLocalWeatherForecast();
        this.hkoLatestService.requestNineDayForecast();
        this.hkoLatestService.response.localWeatherForecast.subscribe(data => {
            const result = JSON.parse(JSON.stringify(data));
            this.localForecast = result;
        });
        this.hkoLatestService.response.nineDayForecast.subscribe(data => {
            const result = JSON.parse(JSON.stringify(data));
            this.nineDayForecast = result;
        });
    }

    i18nDateTime(datetime: string, format?: string): string {
        return this.languageService.dateTime(datetime, format);
    }

    i18nLazyLoad(): void {
        this.httpClient.get(`./assets/i18n/shared/hko/${this.language}.json`).subscribe(data => {
            this.languageService.translate.setTranslation(this.language, data, true);
            this.langPack = data;
        });
    }

    onSwipe(event: any): void {
        const x = Math.abs(event.deltaX) > 40 ? (event.deltaX > 0 ? 'right' : 'left') : null;
        // const y = Math.abs(event.deltaY) > 40 ? (event.deltaY > 0 ? 'down' : 'up') : null;
        this.carouselComponent?.toArray().forEach(child => {
            const activeId = `slide-${child.activeId}`;
            if (activeId === event.target.closest('ngb-carousel').getAttribute('aria-activedescendant')) {
                if (x === 'right') {
                    child.prev();
                } else {
                    child.next();
                }
            }
        });
    }

}
