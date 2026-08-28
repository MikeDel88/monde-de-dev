import { TestBed } from '@angular/core/testing';

import { Profile } from './profile-service';

describe('ProfileResponse', () => {
  let service: Profile;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Profile);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
