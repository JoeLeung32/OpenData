import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import {HttpClient} from '@angular/common/http';
import {faLongArrowAltUp, faLongArrowAltDown} from '@fortawesome/free-solid-svg-icons';
import {LanguageService} from '../../../services/language.service';
import {HkoLatestService} from '../../../services/hkgov/hko/hko-latest.service';

interface LangPackType {
    rainstormReminder?: string;
    warningMessage?: string;
    specialWxTips?: string;
    tcmessage?: string;
    uvindex?: string;
    rainfall?: string;
    lightning?: string;
    regionalTemperature?: string;
    humidity?: string;
    minTempFrom00to09?: string;
    HKORainfallFrom00to12?: string;
    rainfallLastMonth?: string;
    cumulativeRainfallFromJan?: string;
    occurring?: string;
    maintain?: string;
    iconUpdateTime?: string;
    dataUpdateTime?: string;
}

@Component({
    selector: 'app-hko-current-weather-report',
    templateUrl: './hko-current-weather-report.component.html',
    styleUrls: ['./hko-current-weather-report.component.scss']
})
export class HkoCurrentWeatherReportComponent implements OnInit {

    @ViewChildren('carousels', {read: NgbCarousel}) carouselComponent: QueryList<NgbCarousel> | undefined;

    language = this.languageService.translate.currentLang;
    public langPack: LangPackType = {};
    public currentWeatherReport: any = null;
    public iconLongUp = faLongArrowAltUp;
    public iconLongDown = faLongArrowAltDown;

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
        this.hkoLatestService.requestCurrentWeatherReport();
        this.hkoLatestService.response.currentWeatherReport.subscribe(data => {
            const result = JSON.parse(JSON.stringify(data));
            if (result) {
                const rainfall = result.rainfall.data.map((d: { max: number; }) => d.max);
                result.rainfall._max = Math.max(...rainfall);
                result.rainfall._min = Math.min(...rainfall);

                const temperature = result.temperature.data.map((d: { value: number; }) => d.value);
                result.temperature._max = Math.max(...temperature);
                result.temperature._min = Math.min(...temperature);
            }
            console.log(result);
            this.currentWeatherReport = result;
        });
    }

    i18nDateTime(datetime: string, format?: string): string {
        if (!format) {
            format = 'LT';
        }
        const time = moment(datetime);
        if (this.language === 'tc') {
            return time.locale('zh-tw').format(format);
        } else if (this.language === 'sc') {
            return time.locale('zh-cn').format(format);
        }
        return time.locale('an-au').format(format);
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
            console.log(child);
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
