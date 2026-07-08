import { Component, inject, signal } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { TodoTask } from '../../interfaces/task.interface';
import { addOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TodoTaskStore } from '../../store/task.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-task-list',
  templateUrl: 'task-list.page.html',
  styleUrls: ['task-list.page.scss'],
  imports: [
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
  ],
  providers: [TodoTaskStore],
})
export class TaskListPage {
  private readonly _store = inject(TodoTaskStore);
  private alertController = inject(AlertController);

  public newTask = signal('');
  public pendingTasks = this._store.pendingTasks;
  public completedTasks = this._store.completedTasks;
  public allTasks = this._store.allTasks;

  constructor() {
    addIcons({ trashOutline, addOutline });
    this._store
      .loadTasks()
      .pipe(takeUntilDestroyed())
      .subscribe((a) => console.log(a));
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

  public addTask() {
    if (!this.newTask().trim()) return;

    this._store.createTask(this.newTask());
    this.newTask.set('');
  }

  public onNewTaskInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    this.newTask.set($event.detail.value || '');
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
    //todo
  }
}
