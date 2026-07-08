import { Component, signal } from '@angular/core';
import { IonInputCustomEvent, InputInputEventDetail } from '@ionic/core';

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
} from '@ionic/angular/standalone';
import { TodoTask } from '../../interfaces/task.interface';
import { addOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-task-list',
  templateUrl: 'task-list.page.html',
  styleUrls: ['task-list.page.scss'],
  imports: [
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
})
export class TaskListPage {
  public newTask = signal('');
  public pendingTasks = signal<TodoTask[]>([
    { id: '1', title: 'Task 1', completed: false, category: 'hello' },
  ]);
  public completedTasks = signal<TodoTask[]>([
    { id: '1', title: 'Task 1', completed: true, category: 'hello' },
  ]);
  public allTasks = signal<TodoTask[]>([
    { id: '1', title: 'Task 1', completed: false, category: 'hello' },
    { id: '2', title: 'Task 2', completed: true, category: 'world' },
  ]);

  constructor() {
    addIcons({ trashOutline, addOutline });
  }

  public addTask() {
    //todo
  }

  public onNewTaskInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    //todo
  }

  public deleteTask(e: Event, id: string) {
    //todo
  }

  async editTaskDialog(task?: TodoTask) {
    //todo
  }

  public toggleTask(e: Event, id: string) {
    //todo
  }

  public openAssignCategoryModal(taskId: string) {
    //todo
  }
}
