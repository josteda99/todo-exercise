import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
  updateDoc,
  collectionData,
  QueryDocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { getDocs, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreApi {
  constructor(private readonly firestore: Firestore) {}

  public collectionFn(path: string) {
    return collection(this.firestore, path);
  }

  private collectionDataFn(query: any, options?: any) {
    return collectionData(query, options);
  }

  public getCollectionData<T>(path: string, options?: any): Observable<T[]> {
    return this.collectionDataFn(
      this.collectionFn(path),
      options,
    ) as Observable<T[]>;
  }

  private addDocFn(collectionRef: any, data: any) {
    return addDoc(collectionRef, data);
  }

  public addDocToCollection(path: string, data: any) {
    return this.addDocFn(this.collectionFn(path), data);
  }

  public deleteDocFromCollection(path: string, data: any) {
    return this.deleteDocFn(this.docFn(this.firestore, path));
  }

  public updateDocFn(docRef: any, data: any) {
    return updateDoc(docRef, data);
  }

  private deleteDocFn(docRef: any) {
    return deleteDoc(docRef);
  }

  private setDocFn(docRef: any, data: any) {
    return setDoc(docRef, data);
  }

  public docFn(firestore: Firestore, path: string) {
    return doc(firestore, path);
  }

  public getDocsFn(query: any) {
    return getDocs(query);
  }

  public getDocFn(path: string) {
    return this.docFn(this.firestore, path);
  }

  public async getDocByField(
    path: string,
    field: string,
    value: string,
  ): Promise<QueryDocumentSnapshot<unknown, DocumentData> | null> {
    const collectionRef = this.collectionFn(path);
    const q = query(collectionRef, where(field, '==', value));
    const snapshot = await this.getDocsFn(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return doc;
  }

  public updateDocFromCollection(docRef: any, data: any) {
    const resolvedDocRef = docRef?.ref ?? docRef;
    return this.updateDocFn(resolvedDocRef, data);
  }
}
