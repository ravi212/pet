export enum Provider {
  local,
  google
}

export enum ProjectType {
  one_time = 'one_time',
  recurring = 'recurring'
}

export enum CollaboratorRole {
  owner,
  editor,
  commenter,
  viewer,
}

export enum RolloverMode {
  none,
  rollover_positive,
  rollover_negative,
}

export enum OCRStatus {
  pending = 'pending',
  done = 'done',
  failed = 'failed',
}

export enum VIEW_MODE {
  TABLE = 0,
  GRID = 1
}

export enum TaskStatus {
  todo,
  in_progress,
  done
}

export enum DeviceType {
  web,
  mobile
}
