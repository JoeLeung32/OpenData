import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayFlexTwoOneComponent } from './lay-flex-two-one.component';

describe('LayFlexTwoOneComponent', () => {
  let component: LayFlexTwoOneComponent;
  let fixture: ComponentFixture<LayFlexTwoOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayFlexTwoOneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayFlexTwoOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
