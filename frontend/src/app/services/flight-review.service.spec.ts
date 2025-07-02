import { TestBed } from '@angular/core/testing';

import { FlightReviewService } from './flight-review.service';

describe('FlightReviewService', () => {
  let service: FlightReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
