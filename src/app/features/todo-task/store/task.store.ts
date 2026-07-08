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
import { from, map, pipe, switchMap, tap } from 'rxjs';

interface TodoTaskState {
  tasks: TodoTask[];
  categories: string[];
  isLoading: boolean;
  selectedTaskId: string | null;
  selectedCategoriesFilter: string[];
  categoryFilter: string[];
  tempCategory: string | null;
  selectedAssignCategory: string | null;
}

const initialState: TodoTaskState = {
  tasks: [],
  categories: [],
  isLoading: false,
  selectedTaskId: null,
  selectedCategoriesFilter: [],
  categoryFilter: [],
  tempCategory: null,
  selectedAssignCategory: null,
};

export const TodoTaskStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    completedTasks: computed(() =>
      store.tasks().filter((task) => {
        const matchesCategory =
          store.categoryFilter().length === 0 ||
          store.categoryFilter().includes(task.category);

        return task.completed && matchesCategory;
      }),
    ),
    pendingTasks: computed(() =>
      store.tasks().filter((task) => {
        const matchesCategory =
          store.categoryFilter().length === 0 ||
          store.categoryFilter().includes(task.category);

        return !task.completed && matchesCategory;
      }),
    ),
    allTasks: computed(() => store.tasks()),
    selectedTask: computed(
      () =>
        store.tasks().find((task) => task.id === store.selectedTaskId()) ||
        null,
    ),
    allCategories: computed(() => store.categories()),
    selectedCategoriesFilter: computed(() => store.selectedCategoriesFilter()),
    categoryFilter: computed(() => store.categoryFilter()),
    tempCategory: computed(() => store.tempCategory()),
    selectedAssignCategory: computed(() => store.selectedAssignCategory()),
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
    loadCategories() {
      patchState(store, { isLoading: true });
      return firestoreApi
        .getCollectionData<{ id: string; name: string }>('categories', {
          idField: 'id',
        })
        .pipe(
          map((categories) => categories.map((category) => category.name)),
          tap({
            next: (categories) =>
              patchState(store, { categories, isLoading: false }),
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
    addCategory: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((name) =>
          from(
            firestoreApi.addDocToCollection('categories', {
              name,
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
    editCategory: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(async (name) => {
          const categoryDocRef = await firestoreApi.getDocByField(
            'categories',
            'name',
            store.tempCategory() || '',
          );
          if (!categoryDocRef) {
            console.error(`category with name ${name} not found.`);
            patchState(store, { isLoading: false });
            return from([]);
          }

          const tasksToUpdate = store
            .allTasks()
            .filter((task) => task.category === store.tempCategory());

          for (const task of tasksToUpdate) {
            const taskDocRef = firestoreApi.getDocFn(`tasks/${task.id}`);
            await firestoreApi.updateDocFromCollection(taskDocRef, {
              category: name,
            });
          }

          return from(
            firestoreApi.updateDocFromCollection(categoryDocRef, {
              name,
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
    assignTaskCategory: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
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
              category: store.selectedAssignCategory(),
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
    removeCategoryFromTask: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
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
          );
        }),
      ),
    ),
    deleteCategory: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(async (category) => {
          const categoryDocRef = await firestoreApi.getDocByField(
            'categories',
            'name',
            category,
          );
          if (!categoryDocRef) {
            console.error(`category with name ${category} not found.`);
            patchState(store, { isLoading: false });
            return from([]);
          }
          const data = categoryDocRef.data() as Record<string, unknown>;
          const categoryObject = {
            id: categoryDocRef.id,
            ...data,
          };

          const tasksToUpdate = store
            .allTasks()
            .filter((task) => task.category === category);

          for (const task of tasksToUpdate) {
            const taskDocRef = firestoreApi.getDocFn(`tasks/${task.id}`);
            await firestoreApi.updateDocFromCollection(taskDocRef, {
              category: '',
            });
          }

          return from(
            firestoreApi.deleteDocFromCollection(
              `categories/${categoryObject['id']}`,
              {},
            ),
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
    changeSelectedCategoriesFilter(categories: string[]): void {
      patchState(store, {
        selectedCategoriesFilter: categories,
      });
    },
    changeTempCategory(category: string | null): void {
      patchState(store, {
        tempCategory: category,
      });
    },
    setCategoryFilter(): void {
      patchState(store, {
        categoryFilter: store.selectedCategoriesFilter(),
      });
    },
    changeSelectedAssignCategory(category: string | null): void {
      patchState(store, {
        selectedAssignCategory: category,
      });
    },
    clearCategoryFilter(): void {
      patchState(store, {
        categoryFilter: [],
        selectedCategoriesFilter: [],
      });
    },
  })),
);
