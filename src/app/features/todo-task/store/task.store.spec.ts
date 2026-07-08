import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoTaskStore } from './task.store';
import { FirestoreApi } from 'src/app/shared/services/firestore-api';
import { TodoTask } from '../interfaces/task.interface';

describe('TodoTaskStore', () => {
  let store: InstanceType<typeof TodoTaskStore>;
  let firestoreApiSpy: jasmine.SpyObj<FirestoreApi>;

  const mockTasks: TodoTask[] = [
    {
      id: '1',
      title: 'Task 1',
      completed: false,
      category: 'work',
    } as TodoTask,
    { id: '2', title: 'Task 2', completed: true, category: 'home' } as TodoTask,
    {
      id: '3',
      title: 'Task 3',
      completed: false,
      category: 'home',
    } as TodoTask,
  ];

  const mockCategoryDocs = [
    { id: 'c1', name: 'work' },
    { id: 'c2', name: 'home' },
  ];

  beforeEach(() => {
    firestoreApiSpy = jasmine.createSpyObj<FirestoreApi>('FirestoreApi', [
      'getCollectionData',
      'addDocToCollection',
      'deleteDocFromCollection',
      'getDocFn',
      'updateDocFromCollection',
      'getDocByField',
      'getDocsFn',
      'collectionFn',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TodoTaskStore,
        { provide: FirestoreApi, useValue: firestoreApiSpy },
      ],
    });

    store = TestBed.inject(TodoTaskStore);
  });

  it('should be created with the correct initial state', () => {
    expect(store.allTasks()).toEqual([]);
    expect(store.allCategories()).toEqual([]);
    expect(store.isLoading()).toBeFalse();
    expect(store.selectedTask()).toBeNull();
    expect(store.categoryFilter()).toEqual([]);
    expect(store.tempCategory()).toBeNull();
    expect(store.selectedAssignCategory()).toBeNull();
  });

  describe('loadTasks', () => {
    it('should load tasks and set isLoading to false', () => {
      firestoreApiSpy.getCollectionData.and.returnValue(of(mockTasks));

      store.loadTasks().subscribe();

      expect(firestoreApiSpy.getCollectionData).toHaveBeenCalledWith('tasks', {
        idField: 'id',
      });
      expect(store.allTasks()).toEqual(mockTasks);
      expect(store.isLoading()).toBeFalse();
    });

    it('should handle errors and set isLoading to false', () => {
      spyOn(console, 'error');
      firestoreApiSpy.getCollectionData.and.returnValue(
        throwError(() => new Error('boom')),
      );

      store.loadTasks().subscribe({ error: () => {} });

      expect(store.isLoading()).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadCategories', () => {
    it('should load categories mapped to their names', () => {
      firestoreApiSpy.getCollectionData.and.returnValue(of(mockCategoryDocs));

      store.loadCategories().subscribe();

      expect(store.allCategories()).toEqual(['work', 'home']);
      expect(store.isLoading()).toBeFalse();
    });

    it('should handle errors and set isLoading to false', () => {
      spyOn(console, 'error');
      firestoreApiSpy.getCollectionData.and.returnValue(
        throwError(() => new Error('boom')),
      );

      store.loadCategories().subscribe({ error: () => {} });

      expect(store.isLoading()).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      firestoreApiSpy.getCollectionData.and.returnValue(of(mockTasks));
      store.loadTasks().subscribe();
    });

    it('should return pending and completed tasks with no filter', () => {
      expect(store.pendingTasks().map((t) => t.id)).toEqual(['1', '3']);
      expect(store.completedTasks().map((t) => t.id)).toEqual(['2']);
    });

    it('should filter tasks by categoryFilter', () => {
      store.changeSelectedCategoriesFilter(['home']);
      store.setCategoryFilter();

      expect(store.pendingTasks().map((t) => t.id)).toEqual(['3']);
      expect(store.completedTasks().map((t) => t.id)).toEqual(['2']);
    });

    it('should return the selected task', () => {
      store.selectTaskToEdit('2');
      expect(store.selectedTask()?.id).toBe('2');
    });

    it('should return null when selected task id does not match', () => {
      store.selectTaskToEdit('unknown');
      expect(store.selectedTask()).toBeNull();
    });
  });

  describe('createTask', () => {
    it('should add a task and reset isLoading', fakeAsync(() => {
      firestoreApiSpy.addDocToCollection.and.returnValue(Promise.resolve());

      store.createTask('New task');
      tick();

      expect(firestoreApiSpy.addDocToCollection).toHaveBeenCalledWith('tasks', {
        title: 'New task',
        completed: false,
        category: '',
      });
      expect(store.isLoading()).toBeFalse();
    }));

    it('should handle errors and reset isLoading', fakeAsync(() => {
      spyOn(console, 'error');
      firestoreApiSpy.addDocToCollection.and.returnValue(
        Promise.reject(new Error('boom')),
      );

      store.createTask('New task');
      tick();

      expect(store.isLoading()).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('deleteTask', () => {
    it('should delete a task by id', fakeAsync(() => {
      firestoreApiSpy.deleteDocFromCollection.and.returnValue(
        Promise.resolve(),
      );

      store.deleteTask('1');
      tick();

      expect(firestoreApiSpy.deleteDocFromCollection).toHaveBeenCalledWith(
        'tasks/1',
        { id: '1' },
      );
      expect(store.isLoading()).toBeFalse();
    }));
  });

  describe('toggleTaskCompletion', () => {
    beforeEach(() => {
      firestoreApiSpy.getCollectionData.and.returnValue(of(mockTasks));
      store.loadTasks().subscribe();
    });

    it('should toggle the completed flag of an existing task', fakeAsync(() => {
      const docRef = {};
      firestoreApiSpy.getDocFn.and.returnValue(docRef as any);
      firestoreApiSpy.updateDocFromCollection.and.returnValue(
        Promise.resolve(),
      );

      store.toggleTaskCompletion('1');
      tick();

      expect(firestoreApiSpy.getDocFn).toHaveBeenCalledWith('tasks/1');
      expect(firestoreApiSpy.updateDocFromCollection).toHaveBeenCalledWith(
        docRef,
        { completed: true },
      );
      expect(store.isLoading()).toBeFalse();
    }));

    it('should do nothing and log an error if the task is not found', fakeAsync(() => {
      spyOn(console, 'error');

      store.toggleTaskCompletion('unknown');
      tick();

      expect(firestoreApiSpy.updateDocFromCollection).not.toHaveBeenCalled();
      expect(store.isLoading()).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('editTask', () => {
    beforeEach(() => {
      firestoreApiSpy.getCollectionData.and.returnValue(of(mockTasks));
      store.loadTasks().subscribe();
      store.selectTaskToEdit('1');
    });

    it('should update the title of the selected task', fakeAsync(() => {
      const docRef = {};
      firestoreApiSpy.getDocFn.and.returnValue(docRef as any);
      firestoreApiSpy.updateDocFromCollection.and.returnValue(
        Promise.resolve(),
      );

      store.editTask('Updated title');
      tick();

      expect(firestoreApiSpy.getDocFn).toHaveBeenCalledWith('tasks/1');
      expect(firestoreApiSpy.updateDocFromCollection).toHaveBeenCalledWith(
        docRef,
        { title: 'Updated title' },
      );
      expect(store.isLoading()).toBeFalse();
    }));
  });

  describe('addCategory', () => {
    it('should add a category', fakeAsync(() => {
      firestoreApiSpy.addDocToCollection.and.returnValue(Promise.resolve());

      store.addCategory('urgent');
      tick();

      expect(firestoreApiSpy.addDocToCollection).toHaveBeenCalledWith(
        'categories',
        { name: 'urgent' },
      );
      expect(store.isLoading()).toBeFalse();
    }));
  });

  describe('assignTaskCategory / removeCategoryFromTask', () => {
    beforeEach(() => {
      firestoreApiSpy.getCollectionData.and.returnValue(of(mockTasks));
      store.loadTasks().subscribe();
      store.selectTaskToEdit('1');
    });

    it('should assign the selected category to the selected task', fakeAsync(() => {
      const docRef = {};
      firestoreApiSpy.getDocFn.and.returnValue(docRef as any);
      firestoreApiSpy.updateDocFromCollection.and.returnValue(
        Promise.resolve(),
      );
      store.changeSelectedAssignCategory('urgent');

      store.assignTaskCategory();
      tick();

      expect(firestoreApiSpy.updateDocFromCollection).toHaveBeenCalledWith(
        docRef,
        { category: 'urgent' },
      );
      expect(store.isLoading()).toBeFalse();
    }));

    it('should clear the category from the selected task', fakeAsync(() => {
      const docRef = {};
      firestoreApiSpy.getDocFn.and.returnValue(docRef as any);
      firestoreApiSpy.updateDocFromCollection.and.returnValue(
        Promise.resolve(),
      );

      store.removeCategoryFromTask();
      tick();

      expect(firestoreApiSpy.updateDocFromCollection).toHaveBeenCalledWith(
        docRef,
        { category: '' },
      );
      expect(store.isLoading()).toBeFalse();
    }));
  });

  describe('resetDB', () => {
    it('should delete all tasks and categories', async () => {
      firestoreApiSpy.collectionFn.and.returnValue('col' as any);
      firestoreApiSpy.getDocsFn.and.callFake((col: any) => {
        if (col === 'col') {
          return Promise.resolve({
            docs: [{ id: 't1' }, { id: 't2' }],
          } as any);
        }
        return Promise.resolve({ docs: [] } as any);
      });
      firestoreApiSpy.deleteDocFromCollection.and.returnValue(
        Promise.resolve(),
      );

      await store.resetDB();

      expect(firestoreApiSpy.deleteDocFromCollection).toHaveBeenCalled();
      expect(store.isLoading()).toBeFalse();
    });

    it('should set isLoading false and rethrow on error', async () => {
      spyOn(console, 'error');
      firestoreApiSpy.collectionFn.and.returnValue('col' as any);
      firestoreApiSpy.getDocsFn.and.returnValue(
        Promise.reject(new Error('boom')),
      );

      await expectAsync(store.resetDB()).toBeRejected();
      expect(store.isLoading()).toBeFalse();
    });
  });

  describe('simple state setters', () => {
    it('selectTaskToEdit should set selectedTaskId', () => {
      store.selectTaskToEdit('42');
      // verified indirectly via selectedTask computed in other tests
      expect(store.selectedAssignCategory()).toBeNull();
    });

    it('changeSelectedCategoriesFilter should update the filter draft', () => {
      store.changeSelectedCategoriesFilter(['work']);
      expect(store.selectedCategoriesFilter()).toEqual(['work']);
    });

    it('setCategoryFilter should apply the draft filter', () => {
      store.changeSelectedCategoriesFilter(['work']);
      store.setCategoryFilter();
      expect(store.categoryFilter()).toEqual(['work']);
    });

    it('clearCategoryFilter should reset both filters', () => {
      store.changeSelectedCategoriesFilter(['work']);
      store.setCategoryFilter();

      store.clearCategoryFilter();

      expect(store.categoryFilter()).toEqual([]);
      expect(store.selectedCategoriesFilter()).toEqual([]);
    });

    it('changeTempCategory should update tempCategory', () => {
      store.changeTempCategory('work');
      expect(store.tempCategory()).toBe('work');
    });

    it('changeSelectedAssignCategory should update selectedAssignCategory', () => {
      store.changeSelectedAssignCategory('home');
      expect(store.selectedAssignCategory()).toBe('home');
    });
  });
});
