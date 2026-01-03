import { Level, WorkingType } from '../types/enum';

export const LEVEL_OPTIONS = [
  { value: Level.INTERN, label: 'Intern' },
  { value: Level.FRESHER, label: 'Fresher' },
  { value: Level.JUNIOR, label: 'Junior' },
  { value: Level.MIDDLE, label: 'Middle' },
  { value: Level.SENIOR, label: 'Senior' },
  { value: Level.LEADER, label: 'Leader' },
  { value: Level.MANAGER, label: 'Manager' },
];

export const WORKING_TYPE_OPTIONS = [
  { value: WorkingType.FULL_TIME, label: 'Full time' },
  { value: WorkingType.PART_TIME, label: 'Part time' },
  { value: WorkingType.REMOTE, label: 'Remote' },
  { value: WorkingType.HYBRID, label: 'Hybrid' },
  { value: WorkingType.CONTRACT, label: 'Contract' },
];

export const LOCATION_OPTIONS = [
  { label: 'Hà Nội', value: 'Hà Nội' },
  { label: 'Hải Phòng', value: 'Hải Phòng' },
  { label: 'Đà Nẵng', value: 'Đà Nẵng' },
  { label: 'Hồ Chí Minh', value: 'Hồ Chí Minh' },
  { label: 'Cần Thơ', value: 'Cần Thơ' },
];

export const PAGINATION_PAGESIZE = [10, 20, 30, 40, 50];

