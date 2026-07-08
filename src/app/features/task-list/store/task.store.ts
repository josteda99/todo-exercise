import { TodoTask } from '../interfaces/task.interface';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

interface TodoTaskState {
  tasks: TodoTask[];
}

const initialState: TodoTaskState = {
  tasks: [],
};

export const TodoTaskStore = signalStore(
  withState(initialState),
  withComputed((store) => ({})),
  withMethods((store) => ({})),
);
