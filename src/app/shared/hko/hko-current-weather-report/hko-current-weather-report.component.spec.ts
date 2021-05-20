import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HkoCurrentWeatherReportComponent } from './hko-current-weather-report.component';

describe('HkoCurrentWeatherReportComponent', () => {
  let component: HkoCurrentWeatherReportComponent;
  let fixture: ComponentFixture<HkoCurrentWeatherReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HkoCurrentWeatherReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HkoCurrentWeatherReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
