export enum Level {
  INTERN = "INTERN",
  FRESHER = "FRESHER",
  JUNIOR = "JUNIOR",
  MIDDLE = "MIDDLE",
  SENIOR = "SENIOR",
  LEADER = "LEADER",
  MANAGER = "MANAGER",
}

export enum WorkingType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  REMOTE = "REMOTE",
  HYBRID = "HYBRID",
  CONTRACT = "CONTRACT",
}

export enum CompanySize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
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
