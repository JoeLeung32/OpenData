import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import * as moment from 'moment';
import {HttpService} from '../../http.service';
import {LanguageService} from '../../language.service';

type DataType = 'flw' | 'fnd' | 'rhrread' | 'warnsum' | 'warningInfo' | 'swt'

@Injectable({
    providedIn: 'root'
})
export class HkoLatestService {

    public moment = moment;
    public response = {
        latestMinTemperature: new BehaviorSubject<null|any[]>(null),
        latestMinHumidity: new BehaviorSubject<null|any[]>(null),
        currentWeatherReport: new BehaviorSubject<null|{}>(null),
        localWeatherForecast: new BehaviorSubject<null|{}>(null),
        nineDayForecast: new BehaviorSubject<null|{}>(null),
    };
    private bridge = {
        csv: 'https://www.chunkit.hk/to/govhk/proxy.php?csv=',
        json: 'https://www.chunkit.hk/to/govhk/proxy.php?json=',
    };
    /* https://data.weather.gov.hk/weatherAPI/doc/HKO_Open_Data_API_Documentation_tc.pdf */
    private resources = {
        weather: 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType={{dataType}}&lang={{lang}}',
        earthquake: 'https://data.weather.gov.hk/weatherAPI/opendata/earthquake.php',
        opendata: 'https://data.weather.gov.hk/weatherAPI/opendata/opendata.php',
        latestMinTemperature: 'https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_temperature.csv',
        latestMinHumidity: 'https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_humidity.csv',
        latestMinVisibility: 'https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=LTMV&lang=en&rformat=csv',
    };

    constructor(
        private httpService: HttpService,
        private languageService: LanguageService,
    ) {

    }

    requestRecentTemperature(): void {
        this.httpService.getCsv(this.bridge.csv + this.resources.latestMinTemperature).subscribe({
            next: value => {
                if (!value) {
                    return;
                }
                const jsonDataObj: any[] = [];
                value.split('\n')
                    .filter((v: string) => v.split(',').length && parseInt(v.split(',')[0], 0))
                    .forEach((d: { split: (arg0: string) => [any, any, any]; }) => {
                        const [dateTime, location, temperature] = d.split(',');
                        const momentedValue = moment(dateTime, 'YYYYMMDDHHmm');
                        jsonDataObj.push({
                            location,
                            dateTime: {
                                en: momentedValue.locale('en-au').format('LLL'),
                                tc: momentedValue.locale('zh-tw').format('LLL'),
                                sc: momentedValue.locale('zh-cn').format('LLL'),
                            },
                            temperature,
                            humidity: null,
                        });
                    });
                this.response.latestMinTemperature.next(jsonDataObj);
            }
        });
    }

    requestRecentHumidity(): void {
        this.httpService.getCsv(this.bridge.csv + this.resources.latestMinHumidity).subscribe({
            next: value => {
                if (!value) {
                    return;
                }
                const jsonDataObj: any[] = [];
                value.split('\n')
                    .filter((v: string) => v.split(',').length && parseInt(v.split(',')[0], 0))
                    .forEach((d: { split: (arg0: string) => [any, any, any]; }) => {
                        const [dateTime, location, humidity] = d.split(',');
                        const momentedValue = moment(dateTime, 'YYYYMMDDHHmm');
                        jsonDataObj.push({
                            location,
                            dateTime: {
                                en: momentedValue.locale('en-au').format('LLL'),
                                tc: momentedValue.locale('zh-tw').format('LLL'),
                                sc: momentedValue.locale('zh-cn').format('LLL'),
                            },
                            humidity
                        });
                    });
                this.response.latestMinHumidity.next(jsonDataObj);
            }
        });
    }

    requestLocalWeatherForecast(): void {
        this.weatherAPI('flw').subscribe({
            next: value => {
                this.response.localWeatherForecast.next(value);
            }
        });
    }

    requestNineDayForecast(): void {
        this.weatherAPI('fnd').subscribe({
            next: value => {
                this.response.nineDayForecast.next(value);
            }
        });
    }

    requestCurrentWeatherReport(): void {
        this.weatherAPI('rhrread').subscribe({
            next: value => {
                this.response.currentWeatherReport.next(value);
            }
        });
    }

    requestWeatherWarningSummary(): void {
        this.weatherAPI('warnsum').subscribe({
            next: value => {
                console.log(value);
            }
        });
    }

    requestWeatherWarningInfo(): void {
        this.weatherAPI('warningInfo').subscribe({
            next: value => {
                console.log(value);
            }
        });
    }

    requestSpecialWeatherTips(): void {
        this.weatherAPI('swt').subscribe({
            next: value => {
                console.log(value);
            }
        });
    }

    private weatherAPI(dataType: DataType): Observable<any> {
        const replace = (i: string, data: { [x: string]: any; dataType?: DataType; lang?: string; }) => {
            return data[i.replace(/[{}]/g, '')];
        };
        const regex = /{{dataType}}|{{lang}}/g;
        const url = this.resources.weather.replace(regex, i => replace(i, {
            dataType,
            lang: this.languageService.translate.currentLang,
        }));
        return this.httpService.getJson(url);
    }

}

export const WeatherStation = [
    {
        en: 'Happy Valley',
        tc: '?????????',
        sc: '?????????',
        district: 'hk',
    },
    {
        en: 'HK Park',
        tc: '????????????',
        sc: '????????????',
        district: 'hk',
    },
    {
        en: 'Shau Kei Wan',
        tc: '?????????',
        sc: '?????????',
        district: 'hk',
    },
    {
        en: 'Stanley',
        tc: '??????',
        sc: '??????',
        district: 'hk',
    },
    {
        en: 'The Peak',
        tc: '??????',
        sc: '??????',
        district: 'hk',
    },
    {
        en: 'Wong Chuk Hang',
        tc: '?????????',
        sc: '?????????',
        district: 'hk',
    },
    {
        en: 'HK Observatory',
        tc: '?????????',
        sc: '?????????',
        district: 'kln',
    },
    {
        en: 'Kai Tak Runway Park',
        tc: '??????????????????',
        sc: '??????????????????',
        district: 'kln',
    },
    {
        en: 'King\'s Park',
        tc: '?????????',
        sc: '?????????',
        district: 'kln',
    },
    {
        en: 'Kowloon City',
        tc: '?????????',
        sc: '?????????',
        district: 'kln',
    },
    {
        en: 'Kwun Tong',
        tc: '??????',
        sc: '??????',
        district: 'kln',
    },
    {
        en: 'Wong Tai Sin',
        tc: '?????????',
        sc: '?????????',
        district: 'kln',
    },
    {
        en: 'Chek Lap Kok',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Cheung Chau',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Clear Water Bay',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Kau Sai Chau',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Lau Fau Shan',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Ngong Ping',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Pak Tam Chung',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Peng Chau',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Sai Kung',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Sha Tin',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Sham Shui Po',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Shek Kong',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Sheung Shui',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Ta Kwu Ling',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Tai Lung',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Tai Mei Tuk',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Tai Mo Shan',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Tai Po',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Tate\'s Cairn',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Tseung Kwan O',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Tsing Yi',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Tsuen Wan Ho Koon',
        tc: '????????????',
        sc: '????????????',
        district: 'nt',
    },
    {
        en: 'Tsuen Wan Shing Mun Valley',
        tc: '???????????????',
        sc: '???????????????',
        district: 'nt',
    },
    {
        en: 'Tuen Mun',
        tc: '??????',
        sc: '??????',
        district: 'nt',
    },
    {
        en: 'Waglan Island',
        tc: '?????????',
        sc: '?????????',
        district: 'nt',
    },
    {
        en: 'Wetland Park',
        tc: '????????????',
        sc: '????????????',
        district: 'nt',
    },
    {
        en: 'Yuen Long Park',
        tc: '????????????',
        sc: '????????????',
        district: 'nt',
    },
];
