import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {NgbCarousel} from "@ng-bootstrap/ng-bootstrap";
import * as moment from 'moment';
import {HttpClient} from "@angular/common/http";
import {LanguageService} from "../../../services/language.service";
import {HkoLatestService} from "../../../services/hkgov/hko/hko-latest.service";
import {BehaviorSubject} from "rxjs";

interface LangPackType {
    rainstormReminder?: string,
    warningMessage?: string,
    specialWxTips?: string
    tcmessage?: string,
    uvindex?: string,
    rainfall?: string,
    lightning?: string,
    regionalTemperature?: string,
    humidity?: string,
    minTempFrom00to09?: string,
    HKORainfallFrom00to12?: string,
    rainfallLastMonth?: string,
    cumulativeRainfallFromJan?: string,
    occurring?: string,
    maintain?: string,
    iconUpdateTime?: string,
    dataUpdateTime?: string,
}

@Component({
    selector: 'app-hko-current-weather-report',
    templateUrl: './hko-current-weather-report.component.html',
    styleUrls: ['./hko-current-weather-report.component.scss']
})
export class HkoCurrentWeatherReportComponent implements OnInit {

    @ViewChildren('carousels', {read: NgbCarousel}) carouselComponent: QueryList<NgbCarousel> | undefined;

    language = this.languageService.translate.currentLang;
    public langPack: BehaviorSubject<LangPackType> = new BehaviorSubject<LangPackType>({});
    public currentWeatherReport: any = null;

    constructor(
        private httpClient: HttpClient,
        private languageService: LanguageService,
        private hkoLatestService: HkoLatestService,
    ) {
        httpClient.get(`./assets/i18n/shared/hko/${this.language}.json`).subscribe(() => {
            this.i18nLazyLoad();
        })
        languageService.translate.onLangChange.subscribe(({lang}) => {
            this.language = lang;
            httpClient.get(`./assets/i18n/shared/hko/${lang}.json`).subscribe(() => {
                this.i18nLazyLoad();
                this.ngOnInit();
            })
        })
    }

    ngOnInit(): void {
        this.hkoLatestService.requestCurrentWeatherReport();
        this.hkoLatestService.response.currentWeatherReport.subscribe(data => {
            const result = JSON.parse(JSON.stringify(data));
            if (result) {
                result.updateTime = this.i18nDateTime(result.updateTime);
                result.iconUpdateTime = this.i18nDateTime(result.iconUpdateTime);
            }
            this.currentWeatherReport = result;
        })
    }

    i18nDateTime(datetime: string, format?: string): string {
        if (!format) {
            format = 'LT';
        }
        let time = moment(datetime);
        if (this.language === 'tc') {
            return time.locale('zh-tw').format(format);
        } else if (this.language === 'sc') {
            return time.locale('zh-cn').format(format);
        }
        return time.locale('an-au').format(format);
    }

    i18nLazyLoad() {
        this.langPack.next({
            rainstormReminder: this.languageService.translate.instant('rainstormReminder'),
            warningMessage: this.languageService.translate.instant('warningMessage'),
            specialWxTips: this.languageService.translate.instant('specialWxTips'),
            tcmessage: this.languageService.translate.instant('tcmessage'),
            uvindex: this.languageService.translate.instant('uvindex'),
            rainfall: this.languageService.translate.instant('rainfall'),
            lightning: this.languageService.translate.instant('lightning'),
            regionalTemperature: this.languageService.translate.instant('regionalTemperature'),
            humidity: this.languageService.translate.instant('humidity'),
            minTempFrom00to09: this.languageService.translate.instant('minTempFrom00to09'),
            HKORainfallFrom00to12: this.languageService.translate.instant('HKORainfallFrom00to12'),
            rainfallLastMonth: this.languageService.translate.instant('rainfallLastMonth'),
            cumulativeRainfallFromJan: this.languageService.translate.instant('cumulativeRainfallFromJan'),
            occurring: this.languageService.translate.instant('occurring'),
            maintain: this.languageService.translate.instant('maintain'),
            iconUpdateTime: this.languageService.translate.instant('iconUpdateTime'),
            dataUpdateTime: this.languageService.translate.instant('dataUpdateTime'),
        })
    }

    onSwipe(event: any): void {
        const x = Math.abs(event.deltaX) > 40 ? (event.deltaX > 0 ? 'right' : 'left') : null;
        // const y = Math.abs(event.deltaY) > 40 ? (event.deltaY > 0 ? 'down' : 'up') : null;
        this.carouselComponent?.toArray().forEach(child => {
            if (child['_container'].nativeElement === event.target.closest('ngb-carousel')) {
                if (x === 'right') {
                    child.prev();
                } else {
                    child.next();
                }
            }
        })
    }

}
