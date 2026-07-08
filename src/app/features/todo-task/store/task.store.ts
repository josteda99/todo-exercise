import { computed, inject } from '@angular/core';
import { TodoTask } from '../interfaces/task.interface';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { FirestoreApi } from 'src/app/shared/services/firestore-api';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { from, pipe, switchMap, tap } from 'rxjs';

interface TodoTaskState {
  tasks: TodoTask[];
  isLoading: boolean;
  selectedTaskId: string | null;
}

const initialState: TodoTaskState = {
  tasks: [],
  isLoading: false,
  selectedTaskId: null,
};

export const TodoTaskStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    completedTasks: computed(() =>
      store.tasks().filter((task) => task.completed),
    ),
    pendingTasks: computed(() =>
      store.tasks().filter((task) => !task.completed),
    ),
    allTasks: computed(() => store.tasks()),
    selectedTask: computed(
      () =>
        store.tasks().find((task) => task.id === store.selectedTaskId()) ||
        null,
    ),
  })),
  withMethods((store, firestoreApi = inject(FirestoreApi)) => ({
    loadTasks() {
      patchState(store, { isLoading: true });

      return firestoreApi
        .getCollectionData<TodoTask>('tasks', { idField: 'id' })
        .pipe(
          tap({
            next: (tasks) => patchState(store, { tasks, isLoading: false }),
            error: (err) => {
              patchState(store, { isLoading: false });
              console.error(err);
            },
          }),
        );
    },
    createTask: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((title) =>
          from(
            firestoreApi.addDocToCollection('tasks', {
              title,
              completed: false,
              category: '',
            }),
          ).pipe(
            tap({
              next: () => patchState(store, { isLoading: false }),
              error: (err) => {
                patchState(store, { isLoading: false });
                console.error(err);
              },
            }),
          ),
        ),
      ),
    ),
    deleteTask: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((taskId) =>
          from(
            firestoreApi.deleteDocFromCollection(`tasks/${taskId}`, {
              id: taskId,
            }),
          ).pipe(
            tap({
              next: () => patchState(store, { isLoading: false }),
              error: (err) => {
                patchState(store, { isLoading: false });
                console.error(err);
              },
            }),
          ),
        ),
      ),
    ),
    toggleTaskCompletion: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((taskId) => {
          const taskDocRef = firestoreApi.getDocFn(`tasks/${taskId}`);
          const currentTask = store.tasks().find((task) => task.id === taskId);
          if (!currentTask) {
            console.error(`Task with ID ${taskId} not found.`);
            patchState(store, { isLoading: false });
            return from([]);
          }
          return from(
            firestoreApi.updateDocFromCollection(taskDocRef, {
              completed: !currentTask.completed,
            }),
          ).pipe(
            tap({
              next: () => patchState(store, { isLoading: false }),
              error: (err) => {
                patchState(store, { isLoading: false });
                console.error(err);
              },
            }),
          );
        }),
      ),
    ),
    editTask: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((title) => {
          const taskDocRef = firestoreApi.getDocFn(
            `tasks/${store.selectedTaskId()}`,
          );
          const currentTask = store
            .tasks()
            .find((task) => task.id === store.selectedTaskId());
          if (!currentTask) {
            console.error(`Task with ID ${store.selectedTaskId()} not found.`);
            patchState(store, { isLoading: false });
            return from([]);
          }
          return from(
            firestoreApi.updateDocFromCollection(taskDocRef, {
              title,
            }),
          ).pipe(
            tap({
              next: () => patchState(store, { isLoading: false }),
              error: (err) => {
                patchState(store, { isLoading: false });
                console.error(err);
              },
            }),
          );
        }),
      ),
    ),
    selectTaskToEdit(taskId: string): void {
      patchState(store, {
        selectedTaskId: taskId,
      });
    },
  })),
);
