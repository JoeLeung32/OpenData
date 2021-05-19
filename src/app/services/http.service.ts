import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export type ObserverType = {
    next?: (value: any) => void,
    error?: (err: any) => void,
    complete?: () => void
};

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(
        private httpClient: HttpClient,
    ) {

    }

    getCsv(url: string, observer?: ObserverType): Observable<any> {
        const call = this.httpClient.get(url, {
            responseType: 'text',
        });
        if (observer) {
            call.subscribe({
                next: value => {
                    if (observer.next && typeof observer.next === 'function') {
                        observer.next(value);
                    }
                },
                error: err => {
                    if (observer.error && typeof observer.error === 'function') {
                        observer.error(err);
                    }
                },
                complete: () => {
                    if (observer.complete && typeof observer.complete === 'function') {
                        observer.complete();
                    }
                }
            });
        }
        return call;
    }

    getJson(url: string, observer?: ObserverType): Observable<any> {
        const call = this.httpClient.get(url);
        if (observer) {
            call.subscribe({
                next: value => {
                    if (observer.next && typeof observer.next === 'function') {
                        observer.next(value);
                    }
                },
                error: err => {
                    if (observer.error && typeof observer.error === 'function') {
                        observer.error(err);
                    }
                },
                complete: () => {
                    if (observer.complete && typeof observer.complete === 'function') {
                        observer.complete();
                    }
                }
            });
        }
        return call;
    }
}
