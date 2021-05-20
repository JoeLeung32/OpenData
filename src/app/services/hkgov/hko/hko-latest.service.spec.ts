import { TestBed } from '@angular/core/testing';

import { HkoLatestService } from './hko-latest.service';

describe('HkoLatestService', () => {
  let service: HkoLatestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HkoLatestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
