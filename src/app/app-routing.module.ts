import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CustomPreloadStrategy} from './tools/customPreloadStrategy';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/en'
  },
  {
    path: ':lang',
    loadChildren: () => import('./journeys/home/home.module').then(m => m.HomeModule),
  },
  {
    path: ':lang/dummy1',
    loadChildren: () => import('./journeys/error/error.module').then(m => m.ErrorModule)
  },
  {
    path: ':lang/dummy2',
    loadChildren: () => import('./journeys/error/error.module').then(m => m.ErrorModule),
    data: {
      preload: true,
    }
  },
  {
    path: '**',
    loadChildren: () => import('./journeys/error/error.module').then(m => m.ErrorModule)
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: CustomPreloadStrategy,
  })],
  exports: [RouterModule],
  providers: [CustomPreloadStrategy]
})

export class AppRoutingModule {
}
