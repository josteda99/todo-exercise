import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { FirestoreApi } from './firestore-api';

describe('FirestoreApi', () => {
  let service: FirestoreApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Firestore, useValue: {} }],
    });
    service = TestBed.inject(FirestoreApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a document to a collection path in one call', async () => {
    const addDocSpy = spyOn(service, 'addDocFn').and.returnValue(
      Promise.resolve({} as any),
    );
    const collectionSpy = spyOn(service, 'collectionFn').and.returnValue(
      {} as any,
    );

    await service.addDocToCollection('tasks', { title: 'Test task' });

    expect(collectionSpy).toHaveBeenCalledWith('tasks');
    expect(addDocSpy).toHaveBeenCalledWith({}, { title: 'Test task' });
  });
});
