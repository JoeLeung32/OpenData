import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HkoForecastLocalComponent } from './hko-forecast-local.component';

describe('HkoForecastLocalComponent', () => {
  let component: HkoForecastLocalComponent;
  let fixture: ComponentFixture<HkoForecastLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HkoForecastLocalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HkoForecastLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
