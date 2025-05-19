import { ACTION_PUSH_DATA_TYPE } from './enum';

export interface PushDataMessage {
  type: ACTION_PUSH_DATA_TYPE;
  data: PushData;
}

export interface PushData {}
