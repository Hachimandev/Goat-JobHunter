import { CompanySize, Level, WorkingType, ApplicationStatus } from "./enum";

export type Address = {
  addressId: number;
  province: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
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
};

export type CompanyAward = {
  companyAwardId: number;
  type: string;
  year: number;
  average?: number;
  totalReviews?: number;
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
  company?: Company;
  applicant?: Account;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
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

export type Reaction = {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
  hoverColor: string;
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

export type Application = {
  applicationId: number;
  email: string;
  coverLetter: string;
  status: ApplicationStatus;
  job: { jobId: number; title: string };
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
