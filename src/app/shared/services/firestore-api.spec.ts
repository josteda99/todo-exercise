import { TestBed } from '@angular/core/testing';

import { FirestoreApi } from './firestore-api';

describe('FirestoreApi', () => {
  let service: FirestoreApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
