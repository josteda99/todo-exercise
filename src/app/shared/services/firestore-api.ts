import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
  updateDoc,
  collectionData,
} from '@angular/fire/firestore';
import { getDocs } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreApi {
  private firestore = inject(Firestore);

  protected collectionFn(firestore: Firestore, path: string) {
    return collection(firestore, path);
  }

  protected collectionDataFn(query: any, options?: any) {
    return collectionData(query, options);
  }

  protected addDocFn(collectionRef: any, data: any) {
    return addDoc(collectionRef, data);
  }

  protected updateDocFn(docRef: any, data: any) {
    return updateDoc(docRef, data);
  }

  protected deleteDocFn(docRef: any) {
    return deleteDoc(docRef);
  }

  protected setDocFn(docRef: any, data: any) {
    return setDoc(docRef, data);
  }

  protected docFn(firestore: Firestore, path: string) {
    return doc(firestore, path);
  }

  protected getDocsFn(query: any) {
    return getDocs(query);
  }
}
