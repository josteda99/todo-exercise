import {
  Component,
  inject,
  signal,
  ViewChild,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonInputCustomEvent,
  InputInputEventDetail,
  AlertInput,
} from '@ionic/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardContent,
  IonItem,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonButton,
  IonIcon,
  IonCheckbox,
  IonLabel,
  IonChip,
  IonProgressBar,
  IonButtons,
  IonText,
  AlertController,
  IonModal,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { TodoTask } from '../../interfaces/task.interface';
import {
  addOutline,
  closeOutline,
  filterOutline,
  optionsOutline,
  trashOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TodoTaskStore } from '../../store/task.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OverlayEventDetail } from '@ionic/core/components';
import { RemoteConfig } from '../../../../shared/services/remote-config';
@Component({
  selector: 'app-task-list',
  templateUrl: 'task-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonModal,
    IonText,
    IonButtons,
    IonProgressBar,
    IonChip,
    IonLabel,
    IonCheckbox,
    IonIcon,
    IonButton,
    IonList,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonInput,
    IonItem,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    CommonModule,
    IonSelect,
    IonSelectOption,
  ],
  providers: [TodoTaskStore],
})
export class TaskListPage {
  @ViewChild('createCategoryModal') createCategoryModal!: IonModal;
  @ViewChild('assignCategoryModal') assignCategoryModal!: IonModal;
  @ViewChild('completedInfinite') completedInfinite!: IonInfiniteScroll;

  private readonly _store = inject(TodoTaskStore);
  private alertController = inject(AlertController);
  private remoteConfigService = inject(RemoteConfig);

  public newTask = signal('');
  public newCategory = signal('');
  public pendingTasks = this._store.pendingTasks;
  public completedTasks = this._store.completedTasks;
  public allTasks = this._store.allTasks;
  public selectedCategoriesFilter = this._store.selectedCategoriesFilter;
  public allCategories = this._store.allCategories;
  public categoryFilter = this._store.categoryFilter;
  public selectedAssignCategory = this._store.selectedAssignCategory;
  public completedDisplayLimit = signal(20);
  public displayedCompletedTasks = computed(() =>
    this.completedTasks().slice(0, this.completedDisplayLimit()),
  );
  public showResetStorage = signal(false);

  constructor() {
    addIcons({
      trashOutline,
      addOutline,
      optionsOutline,
      closeOutline,
      filterOutline,
    });
    this._store.loadTasks().pipe(takeUntilDestroyed()).subscribe();
    this._store
      .loadCategories()
      .pipe(takeUntilDestroyed())
      .subscribe(console.log);
  }

  async ngOnInit() {
    await this.remoteConfigService.initialize();

    const showReset =
      await this.remoteConfigService.getBoolean('show_reset_storage');

    this.showResetStorage.set(showReset);
  }

  private getTaskDialogButtons() {
    return [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Edit',
        role: 'confirm',
        handler: (input: { taskTitle: string }) => {
          const value = input.taskTitle;
          if (!value) return;
          this._store.editTask(value);
        },
      },
    ];
  }

  private getCreateTaskInputs(): AlertInput[] {
    return [
      {
        name: 'taskTitle',
        type: 'text',
        value: this._store.selectedTask()?.title || '',
        placeholder: 'New task',
        attributes: {
          maxlength: 50,
          minlength: 1,
        },
      },
    ];
  }

  private getCategoryDialogButtons() {
    return [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Edit',
        role: 'confirm',
        handler: (input: { categoryName: string }) => {
          const value = input.categoryName;
          if (!value) return;
          this._store.editCategory(value);
        },
      },
    ];
  }

  private getCreateCategoryInputs(): AlertInput[] {
    return [
      {
        name: 'categoryName',
        type: 'text',
        value: this._store.tempCategory() || '',
        placeholder: 'New category',
        attributes: {
          maxlength: 50,
          minlength: 1,
        },
      },
    ];
  }

  public addTask() {
    if (!this.newTask().trim()) return;

    this._store.createTask(this.newTask());
    this.newTask.set('');
  }

  public deleteTask(e: Event, id: string) {
    e.stopPropagation();
    this._store.deleteTask(id);
  }

  async editTaskDialog(task?: TodoTask) {
    if (task) {
      this._store.selectTaskToEdit(task.id);
    }
    const alert = await this.alertController.create({
      header: 'Edit Task',
      buttons: this.getTaskDialogButtons(),
      inputs: this.getCreateTaskInputs(),
    });

    await alert.present();
  }

  public toggleTask(e: Event, id: string) {
    e.stopPropagation();
    this._store.toggleTaskCompletion(id);
  }

  public openAssignCategoryModal(taskId: string) {
    this._store.selectTaskToEdit(taskId);
    const task = this._store.selectedTask();
    this._store.changeSelectedAssignCategory(task?.category || null);
    this.assignCategoryModal.present();
  }

  public onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this._store.setCategoryFilter();
    }
  }

  public changeSelectedCategoriesFilter(value: string[]) {
    this._store.changeSelectedCategoriesFilter(value);
  }

  public clearCategoryFilter() {
    this._store.clearCategoryFilter();
  }

  public changeSelectedAssignCategoryFilter(value: string) {
    this._store.changeSelectedAssignCategory(value);
  }

  public cancel() {
    this.createCategoryModal.dismiss(null, 'cancel');
    this.assignCategoryModal.dismiss(null, 'cancel');
    this.changeSelectedCategoriesFilter([]);
  }

  public confirm() {
    this.createCategoryModal.dismiss('', 'confirm');
    this.assignCategoryModal.dismiss('', 'confirm');
  }

  async editCategoryDialog(category: string) {
    if (category) {
      this._store.changeTempCategory(category);
    }
    const alert = await this.alertController.create({
      header: 'Edit Category',
      buttons: this.getCategoryDialogButtons(),
      inputs: this.getCreateCategoryInputs(),
    });

    await alert.present();
  }

  public addCategory() {
    if (!this.newCategory().trim()) return;

    this._store.addCategory(this.newCategory());
    this.newCategory.set('');
  }

  public onNewTaskInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    this.newTask.set($event.detail.value || '');
  }

  public onNewCategoryInput(
    $event: IonInputCustomEvent<InputInputEventDetail>,
  ) {
    this.newCategory.set($event.detail.value || '');
  }

  public loadMoreCompleted(event: any) {
    const increment = 10;
    const current = this.completedDisplayLimit();
    const total = this.completedTasks().length;
    this.completedDisplayLimit.set(Math.min(current + increment, total));

    try {
      event.target.complete();
    } catch (e) {
      // ignore
    }

    if (this.completedDisplayLimit() >= total) {
      try {
        event.target.disabled = true;
      } catch (e) {
        // ignore
      }
    }
  }

  public trackById(_: number, item: TodoTask) {
    return item.id;
  }

  public unassignCategoryFromTask() {
    this._store.removeCategoryFromTask();
    this.assignCategoryModal.dismiss();
  }

  public applyAssignCategory() {
    this._store.assignTaskCategory();
    this.assignCategoryModal.dismiss();
  }

  public deleteCategory(e: PointerEvent, category: string) {
    e.stopPropagation();
    this._store.deleteCategory(category);
  }

  public resetLocalStorage() {
    this._store.resetDB();
  }
}
