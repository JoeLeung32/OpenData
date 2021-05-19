import {Injectable, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MomentModule} from 'ngx-moment';
import * as Hammer from 'hammerjs';
import {HammerModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {TopbarComponent} from './topbar/topbar.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {PageWrapperComponent} from './page-wrapper/page-wrapper.component';
import {LayFlexTwoOneComponent} from './layouts/lay-flex-two-one/lay-flex-two-one.component';
// import {EleChangelogListComponent} from './elements/ele-changelog-list/ele-changelog-list.component';
// import {HkoLatestMinTemperatureComponent} from './hkgov/hko/hko-latest-min-temperature/hko-latest-min-temperature.component';

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
    overrides = {
        swipe: { direction: Hammer.DIRECTION_ALL },
    } as any;
}

@NgModule({
    declarations: [
        TopbarComponent,
        FooterComponent,
        HeaderComponent,
        PageWrapperComponent,
        LayFlexTwoOneComponent,
        // EleChangelogListComponent,
        // HkoLatestMinTemperatureComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        NgbModule,
        FontAwesomeModule,
        MomentModule,
        HammerModule,
    ],
    exports: [
        TopbarComponent,
        HeaderComponent,
        FooterComponent,
        PageWrapperComponent,
        LayFlexTwoOneComponent,
        // EleChangelogListComponent,
        // HkoLatestMinTemperatureComponent,
    ],
    providers: [
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: MyHammerConfig,
        },
    ],
})
export class SharedModule {
}
