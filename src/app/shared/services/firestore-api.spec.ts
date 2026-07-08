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

  it('should get a document id by a field value', async () => {
    const collectionSpy = spyOn(service, 'collectionFn').and.returnValue(
      {} as any,
    );
    const getDocsSpy = spyOn(service, 'getDocsFn').and.returnValue(
      Promise.resolve({
        empty: false,
        docs: [{ id: 'abc123', data: () => ({ name: 'Work' }) }],
      }) as any,
    );

    const result = await service.getDocByField('categories', 'name', 'Work');

    expect(collectionSpy).toHaveBeenCalledWith('categories');
    expect(getDocsSpy).toHaveBeenCalled();
    expect(result).toEqual({ id: 'abc123', name: 'Work' });
  });

  it('should update a document using its reference when a snapshot is passed', async () => {
    const updateDocSpy = spyOn(service, 'updateDocFn').and.returnValue(
      Promise.resolve({} as any),
    );
    const docRef = {} as any;
    const snapshot = { ref: docRef, data: () => ({ name: 'Work' }) } as any;

    await service.updateDocFromCollection(snapshot, { name: 'Study' });

    expect(updateDocSpy).toHaveBeenCalledWith(docRef, { name: 'Study' });
  });
});
