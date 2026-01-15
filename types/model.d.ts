import { CompanySize, Level, WorkingType } from "./enum";

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
