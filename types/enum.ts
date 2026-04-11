export enum Level {
  INTERN = "INTERN",
  FRESHER = "FRESHER",
  JUNIOR = "JUNIOR",
  MIDDLE = "MIDDLE",
  SENIOR = "SENIOR",
}

export enum WorkingType {
  FULLTIME = "FULLTIME",
  PARTTIME = "PARTTIME",
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export enum CompanySize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export enum Education {
  COLLEGE = "COLLEGE",
  UNIVERSITY = "UNIVERSITY",
  SCHOOL = "SCHOOL",
  ENGINEER = "ENGINEER",
}

export enum BlogActionType {
  DELETE = "DELETE",
  REJECT = "REJECT",
  ACCEPT = "ACCEPT",
}

export enum ReactionType {
  LIKE = "LIKE",
  CELEBRATE = "CELEBRATE",
  SUPPORT = "SUPPORT",
  LOVE = "LOVE",
  INSIGHTFUL = "INSIGHTFUL",
  FUNNY = "FUNNY",
}

export enum ReportReason {
  SPAM = "SPAM",
  HARASSMENT = "Quấy rối",
  HATE_SPEECH = "Lời nói bậy",
  VIOLENCE = "Bạo lực",
  FALSE_INFO = "Tin giả",
  OTHER = "Lý do khác",
}

export const reasonLabels: Record<ReportReason, string> = {
  [ReportReason.SPAM]: "Spam",
  [ReportReason.HARASSMENT]: "Quấy rối",
  [ReportReason.HATE_SPEECH]: "Lời nói bậy",
  [ReportReason.VIOLENCE]: "Bạo lực",
  [ReportReason.FALSE_INFO]: "Tin giả",
  [ReportReason.OTHER]: "Lý do khác",
};

export enum Gender {
  NAM = "NAM",
  NU = "NU",
  OTHER = "OTHER",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}
