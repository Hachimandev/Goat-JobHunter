import { ResumeEvaluation } from './model.d';
import {
  ApplicationStatus,
  ChatRoomType,
  CompanySize,
  Education,
  Gender,
  InterviewStatus,
  InterviewType,
  Level,
  MessageTypeEnum,
  MessageTypeRole,
  NotificationTypeEnum,
  WorkingType,
} from '@/types/enum';
import { LucideIcon } from 'lucide-react';

export type Address = {
  addressId: number;
  province: string;
  fullAddress: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type Account = {
  accountId: number;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  enabled: boolean;
  addresses: Address[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  role: Role;
};

export type User = Account & {
  phone: string;
  dob: string;
  fullName: string;
  gender: Gender;
  coverPhoto: string;
  headline: string;
  bio: string;
};

export type Recruiter = User & {
  position: string;
  company: Company;
};

export type Applicant = User & {
  availableStatus: boolean;
  education: Education;
  level: Level;
};

export type Company = Account & {
  name: string;
  description: string;
  logo: string;
  size: CompanySize;
  verified: boolean;
  country: string;
  industry: string;
  workingDays: string;
  overtimePolicy: string;
  coverPhoto?: string;
  website?: string;
  phone?: string;
  awards?: CompanyAward[];
};

export type CompanyAward = {
  companyAwardId: number;
  type: string;
  year: number;
  average?: number;
  totalReviews?: number;
};

export type Review = {
  reviewId: number;
  rating: {
    overall: number;
    salaryBenefits: number;
    trainingLearning: number;
    managementCaresAboutMe: number;
    cultureFun: number;
    officeWorkspace: number;
  };
  summary: string;
  experience: string;
  suggestion: string;
  recommended: boolean;
  verified: boolean;
  enabled: boolean;

  user: User;
  company: Company;

  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type Skill = {
  skillId: number;
  name: string;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Career = {
  careerId: number;
  name: string;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Job = {
  jobId: number;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  enabled: boolean;
  level: Level;
  quantity: number;
  salary: number;
  title: string;
  workingType: WorkingType;
  address: Address;
  skills: Skill[];
  career: Career;
  company: Company;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Application = {
  applicationId: number;
  email: string;
  coverLetter: string;
  status: ApplicationStatus;

  job: { jobId: string; title: string };
  applicant: { accountId: number; email: string; fullName: string };
  resume: { resumeId: number; fileUrl: string };
  interview?: {
    interviewId?: number;
    scheduledAt?: string;
  };

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Permission = {
  permissionId: number;
  apiPath: string;
  method: string;
  module: string;
  name: string;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Role = {
  roleId: number;
  description: string;
  active: boolean;
  name: string;

  permissions: Permission[];

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Contact = {
  phone?: string;
  email?: string;
};

export type Select = {
  label: string | undefined;
  value: string | undefined;
  key?: string | undefined;
};

export type Subscriber = {
  subscriberId: number;
  name: string;
  email: string;
  skills: Skill[];

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Blog = {
  blogId: number;
  images: string[];
  content: string;
  tags: string[];
  draft: boolean;
  enabled: boolean;
  activity?: {
    totalLikes: number;
    totalComments: number;
    totalReads: number;
    totalParentComments: number;
  };
  author: {
    accountId: number;
    fullName: string;
    username: string;
    avatar: string;
    bio: string;
    headline: string;
    coverPhoto: string;
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

type CommentedBy = {
  accountId: number;
  fullName: string;
  username: string;
  avatar: string;
};

export type CommentType = {
  commentId: number;
  comment: string;
  reply: boolean;
  blog: {
    blogId: number;
    title: string;
  };
  parent?: {
    commentId: string;
    comment: string;
    commentedBy: CommentedBy;
  };
  commentedBy: CommentedBy;
  createdAt: string;
};

export type NotificationType = {
  notificationId: number;
  type: NotificationTypeEnum;
  seen: boolean;
  blog: {
    blogId: string;
    title: string;
  };
  lastActor: {
    userId: string;
    fullName: string;
    username: string;
    avatar: string;
  };
  actorCount: number;
  recipient: {
    userId: string;
    fullName: string;
    username: string;
    avatar: string;
  };
  comment?: {
    commentId: string;
    comment: string;
  };
  reply?: {
    commentId: string;
    comment: string;
  };
  repliedOnComment?: {
    commentId: string;
    comment: string;
  };
  createdAt: string;
};

export type Conversation = {
  conversationId: number;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type MessageType = {
  chatRoomBucket: string;
  messageSk: string;
  chatRoomId: string;
  messageId: string;
  sender: {
    accountId: number;
    fullName: string;
    username: string;
    email: string;
    avatar: string;
  };
  content: string;
  messageType: MessageTypeEnum;
  replyTo?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  role?: MessageTypeRole; // temporary field to avoid error for build in chat container
};

export type Reaction = {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
  hoverColor: string;
};

export type ChatRoom = {
  roomId: number;
  type: ChatRoomType;
  name: string;
  avatar: string | null;
  memberCount: number;
  lastMessagePreview: string | null;
  lastMessageTime: string | null;
  currentUserSentLastMessage: boolean | null;
};

export type Resume = {
  resumeId: number;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  default: boolean;
  public: boolean;

  applicant: Applicant;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type ResumeEvaluation = {
  resumeEvaluationId: number;
  score: number;
  strengths: string;
  weaknesses: string;
  missingSkills: string;
  skills: string;
  suggestions: string;
  aiModel: string;

  resume: Resume;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type Interview = {
  interviewId: number;
  scheduledAt: string;
  durationMinutes: number;
  type: InterviewType;
  status: InterviewStatus;
  location?: string;
  meetingLink?: string;
  notes?: string;
  feedback?: string;
  rating?: number;

  interviewer: { accountId: number; email: string; fullName: string };
  application: { applicationId: number; email: string; status: ApplicationStatus; fullName: string };

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};
