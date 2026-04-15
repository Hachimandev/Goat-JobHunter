export enum Level {
  INTERN = 'INTERN',
  FRESHER = 'FRESHER',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
}

export enum WorkingType {
  FULLTIME = 'FULLTIME',
  PARTTIME = 'PARTTIME',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum Gender {
  NAM = 'MALE',
  NỮ = 'FEMALE',
}

export enum Education {
  COLLEGE = 'COLLEGE',
  UNIVERSITY = 'UNIVERSITY',
  SCHOOL = 'SCHOOL',
  ENGINEER = 'ENGINEER',
}

export enum CompanySize {
  STARTUP = 'Khởi nghiệp',
  SMALL = 'Nhỏ',
  MEDIUM = 'Vừa',
  LARGE = 'Lớn',
  ENTERPRISE = 'Tập đoàn',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum InterviewType {
  PERSON = 'Trực tiếp',
  VIDEO = 'Video',
  TECHNICAL = 'Kỹ thuật',
  ONLINE_TEST = 'Bài test online',
  HR_INTERVIEW = 'Phỏng vấn HR',
  GROUP_INTERVIEW = 'Phỏng vấn nhóm',
  PANEL_INTERVIEW = 'Phỏng vấn hội đồng',
  ASSESSMENT_CENTER = 'Trung tâm đánh giá',
}

export enum InterviewStatus {
  SCHEDULED = 'Đã lên lịch',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Đã hủy',
  RESCHEDULED = 'Đã lên lịch lại',
}

export enum BlogActionType {
  DELETE = 'DELETE',
  REJECT = 'REJECT',
  ACCEPT = 'ACCEPT',
}

export enum JobActionType {
  REJECT = 'REJECT',
  ACCEPT = 'ACCEPT',
}

export enum NotificationTypeEnum {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  FOLLOW = 'FOLLOW',
}

export enum MessageTypeRole {
  User = 'USER',
  AI = 'AI',
}

export enum MessageTypeEnum {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  CONTACT_CARD = 'CONTACT_CARD',
  SYSTEM = 'SYSTEM',
}

export enum MessageEvent {
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_LEFT = 'MEMBER_LEFT',
  ROLE_CHANGED = 'ROLE_CHANGED',
  GROUP_CREATED = 'GROUP_CREATED',
  GROUP_NAME_CHANGED = 'GROUP_NAME_CHANGED',
  GROUP_AVATAR_CHANGED = 'GROUP_AVATAR_CHANGED',
  MESSAGE_PINNED = 'MESSAGE_PINNED',
  MESSAGE_UNPINNED = 'MESSAGE_UNPINNED',
}

export enum ReactionType {
  LIKE = 'LIKE',
  CELEBRATE = 'CELEBRATE',
  SUPPORT = 'SUPPORT',
  LOVE = 'LOVE',
  INSIGHTFUL = 'INSIGHTFUL',
  FUNNY = 'FUNNY',
}

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  VIOLENCE = 'VIOLENCE',
  FALSE_INFO = 'FALSE_INFO',
  OTHER = 'OTHER',
}

export enum ChatRoomType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  BROADCAST = 'BROADCAST',
  AI = 'AI',
}
