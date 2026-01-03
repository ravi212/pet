export enum Provider {
  local,
  google
}

export enum ProjectType {
  one_time,
  recurring
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
  pending,
  done,
  failed,
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
