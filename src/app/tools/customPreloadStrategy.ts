import {Injectable} from '@angular/core';
import {PreloadingStrategy, Route} from '@angular/router';
import {Observable, of} from 'rxjs';

@Injectable()
export class CustomPreloadStrategy implements PreloadingStrategy {
    preloadedModules: string[] = [];

    preload(route: Route, fn: () => Observable<any>): Observable<any> {
        if (route.data && route.data.preload) {
            if (route.path) {
                this.preloadedModules.push(route.path);
                return fn();
            }
        }
        return of(null);
    }


}
