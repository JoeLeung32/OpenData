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
                console.log(value.generalSituation); // 概況
                console.log(value.tcInfo); // 熱帶氣旋資訊
                console.log(value.fireDangerWarning); // 火災危險警告信息
                console.log(value.forecastPeriod); // 預測時段
                console.log(value.forecastDesc); // 預測內容
                console.log(value.outlook); // 展望
                console.log(value.updateTime); // 更新時間
            }
        });
    }

    requestNineDayForecast(): void {
        this.weatherAPI('fnd').subscribe({
            next: value => {
                console.log(value.generalSituation); // 概況
                console.log(value.seaTemp); // 海面溫度
                console.log(value.soilTemp); // 土壤溫度
                console.log(value.updateTime);
                console.log(value.weatherForecast); // 天氣預報
                // console.log(forecastDate); // 預報日期
                // console.log(forecastWeather); // 預測天氣
                // console.log(forecastMaxtemp); // 預測最高溫度
                // console.log(forecastMintemp); // 預測最低溫度
                // console.log(week); // 星期天數
                // console.log(forecastWind); // 預測風向風速
                // console.log(forecastMaxrh); // 預測最高相對濕度
                // console.log(forecastMinrh); // 預測最低相對濕度
                // console.log(ForecastIcon); // 預測天氣圖示
                // console.log(PSR); // 顯著降雨概率
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
        tc: '跑馬地',
        sc: '跑马地',
        district: 'hk',
    },
    {
        en: 'HK Park',
        tc: '香港公園',
        sc: '香港公园',
        district: 'hk',
    },
    {
        en: 'Shau Kei Wan',
        tc: '筲箕灣',
        sc: '筲箕湾',
        district: 'hk',
    },
    {
        en: 'Stanley',
        tc: '赤柱',
        sc: '赤柱',
        district: 'hk',
    },
    {
        en: 'The Peak',
        tc: '山頂',
        sc: '山顶',
        district: 'hk',
    },
    {
        en: 'Wong Chuk Hang',
        tc: '黄竹坑',
        sc: '黄竹坑',
        district: 'hk',
    },
    {
        en: 'HK Observatory',
        tc: '天文台',
        sc: '天文台',
        district: 'kln',
    },
    {
        en: 'Kai Tak Runway Park',
        tc: '啟德跑道公園',
        sc: '启德跑道公园',
        district: 'kln',
    },
    {
        en: 'King\'s Park',
        tc: '京士柏',
        sc: '京士柏',
        district: 'kln',
    },
    {
        en: 'Kowloon City',
        tc: '九龍城',
        sc: '九龙城',
        district: 'kln',
    },
    {
        en: 'Kwun Tong',
        tc: '觀塘',
        sc: '观塘',
        district: 'kln',
    },
    {
        en: 'Wong Tai Sin',
        tc: '黄大仙',
        sc: '黄大仙',
        district: 'kln',
    },
    {
        en: 'Chek Lap Kok',
        tc: '赤鱲角',
        sc: '赤鱲角',
        district: 'nt',
    },
    {
        en: 'Cheung Chau',
        tc: '長洲',
        sc: '长洲',
        district: 'nt',
    },
    {
        en: 'Clear Water Bay',
        tc: '清水灣',
        sc: '清水湾',
        district: 'nt',
    },
    {
        en: 'Kau Sai Chau',
        tc: '滘西洲',
        sc: '滘西洲',
        district: 'nt',
    },
    {
        en: 'Lau Fau Shan',
        tc: '流浮山',
        sc: '流浮山',
        district: 'nt',
    },
    {
        en: 'Ngong Ping',
        tc: '昂坪',
        sc: '昂坪',
        district: 'nt',
    },
    {
        en: 'Pak Tam Chung',
        tc: '北潭涌',
        sc: '北潭涌',
        district: 'nt',
    },
    {
        en: 'Peng Chau',
        tc: '坪洲',
        sc: '坪洲',
        district: 'nt',
    },
    {
        en: 'Sai Kung',
        tc: '西貢',
        sc: '西贡',
        district: 'nt',
    },
    {
        en: 'Sha Tin',
        tc: '沙田',
        sc: '沙田',
        district: 'nt',
    },
    {
        en: 'Sham Shui Po',
        tc: '深水埗',
        sc: '深水埗',
        district: 'nt',
    },
    {
        en: 'Shek Kong',
        tc: '石崗',
        sc: '石岗',
        district: 'nt',
    },
    {
        en: 'Sheung Shui',
        tc: '上水',
        sc: '上水',
        district: 'nt',
    },
    {
        en: 'Ta Kwu Ling',
        tc: '打鼓嶺',
        sc: '打鼓岭',
        district: 'nt',
    },
    {
        en: 'Tai Lung',
        tc: '大隴',
        sc: '大陇',
        district: 'nt',
    },
    {
        en: 'Tai Mei Tuk',
        tc: '大美督',
        sc: '大美督',
        district: 'nt',
    },
    {
        en: 'Tai Mo Shan',
        tc: '大帽山',
        sc: '大帽山',
        district: 'nt',
    },
    {
        en: 'Tai Po',
        tc: '大埔',
        sc: '大埔',
        district: 'nt',
    },
    {
        en: 'Tate\'s Cairn',
        tc: '大老山',
        sc: '大老山',
        district: 'nt',
    },
    {
        en: 'Tseung Kwan O',
        tc: '將軍澳',
        sc: '将军澳',
        district: 'nt',
    },
    {
        en: 'Tsing Yi',
        tc: '青衣',
        sc: '青衣',
        district: 'nt',
    },
    {
        en: 'Tsuen Wan Ho Koon',
        tc: '荃灣可觀',
        sc: '荃湾可观',
        district: 'nt',
    },
    {
        en: 'Tsuen Wan Shing Mun Valley',
        tc: '荃灣城門谷',
        sc: '荃湾城门谷',
        district: 'nt',
    },
    {
        en: 'Tuen Mun',
        tc: '屯門',
        sc: '屯门',
        district: 'nt',
    },
    {
        en: 'Waglan Island',
        tc: '橫瀾島',
        sc: '横澜岛',
        district: 'nt',
    },
    {
        en: 'Wetland Park',
        tc: '濕地公園',
        sc: '湿地公园',
        district: 'nt',
    },
    {
        en: 'Yuen Long Park',
        tc: '元朗公園',
        sc: '元朗公园',
        district: 'nt',
    },
];
