import { Option } from '@/components/ui/MultipleSelector';
import { Level, ReactionType, WorkingType } from '@/types/enum';
import { Clover, Heart, Lightbulb, PartyPopper, Smile, ThumbsUp } from 'lucide-react';
import { capitalize } from 'lodash';
import { Reaction } from '@/types/model';

export const LEVEL_OPTIONS = [
  { value: Level.INTERN, label: 'Intern' },
  { value: Level.FRESHER, label: 'Fresher' },
  { value: Level.JUNIOR, label: 'Junior' },
  { value: Level.MIDDLE, label: 'Middle' },
  { value: Level.SENIOR, label: 'Senior' },
];

export const WORKING_TYPE_OPTIONS = [
  { value: WorkingType.FULLTIME, label: 'Full time' },
  { value: WorkingType.PARTTIME, label: 'Part time' },
  { value: WorkingType.ONLINE, label: 'Online' },
  { value: WorkingType.OFFLINE, label: 'Offline' },
];

export const ROLE_LIST = [
  { label: 'Nhà tuyển dụng', value: 'HR' },
  { label: 'Ứng viên', value: 'APPLICANT' },
  { label: 'Công ty', value: 'COMPANY' },
];

export const PROVINCE_OPTIONS: Option[] = [
  { label: 'Hà Nội', value: 'Hà Nội' },
  { label: 'Hải Phòng', value: 'Hải Phòng' },
  { label: 'Đà Nẵng', value: 'Đà Nẵng' },
  { label: 'Hồ Chí Minh', value: 'Hồ Chí Minh' },
  { label: 'Cần Thơ', value: 'Cần Thơ' },
  { label: 'Thừa Thiên Huế', value: 'Thừa Thiên Huế' },

  { label: 'Tuyên Quang', value: 'Tuyên Quang' },
  { label: 'Lào Cai', value: 'Lào Cai' },
  { label: 'Thái Nguyên', value: 'Thái Nguyên' },
  { label: 'Phú Thọ', value: 'Phú Thọ' },
  { label: 'Bắc Ninh', value: 'Bắc Ninh' },
  { label: 'Hưng Yên', value: 'Hưng Yên' },

  { label: 'Ninh Bình', value: 'Ninh Bình' },
  { label: 'Quảng Trị', value: 'Quảng Trị' },
  { label: 'Quảng Ngãi', value: 'Quảng Ngãi' },
  { label: 'Gia Lai', value: 'Gia Lai' },
  { label: 'Khánh Hòa', value: 'Khánh Hòa' },
  { label: 'Lâm Đồng', value: 'Lâm Đồng' },

  { label: 'Đắk Lắk', value: 'Đắk Lắk' },
  { label: 'Đồng Nai', value: 'Đồng Nai' },
  { label: 'Tây Ninh', value: 'Tây Ninh' },
  { label: 'Vĩnh Long', value: 'Vĩnh Long' },
  { label: 'Đồng Tháp', value: 'Đồng Tháp' },
  { label: 'Cà Mau', value: 'Cà Mau' },

  { label: 'An Giang', value: 'An Giang' },
  { label: 'Lai Châu', value: 'Lai Châu' },
  { label: 'Điện Biên', value: 'Điện Biên' },
  { label: 'Sơn La', value: 'Sơn La' },
  { label: 'Lạng Sơn', value: 'Lạng Sơn' },
  { label: 'Quảng Ninh', value: 'Quảng Ninh' },

  { label: 'Thanh Hóa', value: 'Thanh Hóa' },
  { label: 'Nghệ An', value: 'Nghệ An' },
  { label: 'Hà Tĩnh', value: 'Hà Tĩnh' },
  { label: 'Cao Bằng', value: 'Cao Bằng' },
];

export const JOBFILTER_CONFIG = {
  provinces: {
    option: PROVINCE_OPTIONS,
    maxSelected: 3,
    maxSelectedMessage: 'Bạn chỉ có thể chọn tối đa 3 địa điểm',
  },
  level: {
    option: LEVEL_OPTIONS,
    maxSelected: LEVEL_OPTIONS.length - 1,
    maxSelectedMessage: `Bạn chỉ có thể chọn tối đa ${LEVEL_OPTIONS.length - 1} cấp độ`,
  },
  workingType: {
    option: WORKING_TYPE_OPTIONS,
    maxSelected: WORKING_TYPE_OPTIONS.length - 1,
    maxSelectedMessage: `Bạn chỉ có thể chọn tối đa ${WORKING_TYPE_OPTIONS.length - 1} hình thức làm việc`,
  },
};

export const RECRUITERFILTER_CONFIG = {
  provinces: {
    option: PROVINCE_OPTIONS,
    maxSelected: 1,
    maxSelectedMessage: 'Bạn chỉ có thể chọn tối đa 1 địa điểm',
  },
};

export const PAGINATION_PAGESIZE = [10, 20, 30, 40, 50];
export const AI_CONVERSATION_PAGE_SIZE = 20;
export const AI_MESSAGE_PAGE_SIZE = 20;

export const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export enum ROLE {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HR = 'HR',
  APPLICANT = 'APPLICANT',
  COMPANY = 'COMPANY',
}

export const MAX_IMAGE_UPLOAD = 90;

export const MAX_DISPLAYED_IMAGES = 4;

export const reactions: Reaction[] = [
  {
    id: ReactionType.LIKE,
    icon: ThumbsUp,
    label: capitalize(ReactionType.LIKE),
    color: '#0A66C2',
    hoverColor: '#004182',
  },
  {
    id: ReactionType.CELEBRATE,
    icon: PartyPopper,
    label: capitalize(ReactionType.CELEBRATE),
    color: '#6DAF3D',
    hoverColor: '#5A9130',
  },
  {
    id: ReactionType.SUPPORT,
    icon: Clover,
    label: capitalize(ReactionType.SUPPORT),
    color: '#DF704D',
    hoverColor: '#C95A3A',
  },
  {
    id: ReactionType.LOVE,
    icon: Heart,
    label: capitalize(ReactionType.LOVE),
    color: '#DF704D',
    hoverColor: '#C95A3A',
  },
  {
    id: ReactionType.INSIGHTFUL,
    icon: Lightbulb,
    label: capitalize(ReactionType.INSIGHTFUL),
    color: '#F5C344',
    hoverColor: '#D9AB2A',
  },
  {
    id: ReactionType.FUNNY,
    icon: Smile,
    label: capitalize(ReactionType.FUNNY),
    color: '#F5C344',
    hoverColor: '#D9AB2A',
  },
];

export const reactionLabelMap: Record<ReactionType, string> = {
  [ReactionType.LIKE]: 'Thích',
  [ReactionType.CELEBRATE]: 'Chúc mừng',
  [ReactionType.SUPPORT]: 'Ủng hộ',
  [ReactionType.LOVE]: 'Yêu',
  [ReactionType.INSIGHTFUL]: 'Sâu sắc',
  [ReactionType.FUNNY]: 'Hài hước',
};

export const COMPANY_SIZE_OPTIONS = [
  { value: 'STARTUP', label: 'Khởi nghiệp' },
  { value: 'SMALL', label: 'Nhỏ' },
  { value: 'MEDIUM', label: 'Vừa' },
  { value: 'LARGE', label: 'Lớn' },
  { value: 'ENTERPRISE', label: 'Tập đoàn' },
];

export const RATING_TYPES = [
  { value: 'salaryBenefits', label: 'Lương thưởng & phúc lợi' },
  { value: 'trainingLearning', label: 'Đào tạo & học hỏi' },
  { value: 'managementCaresAboutMe', label: 'Sự quan tâm đến nhân viên' },
  { value: 'cultureFun', label: 'Văn hóa công ty' },
  { value: 'officeWorkspace', label: 'Văn phòng làm việc' },
];

export const COMPANY_INDUSTRY_OPTIONS = [
  { value: 'INFORMATION_TECHNOLOGY', label: 'Công nghệ thông tin (IT)' },
  { value: 'SOFTWARE', label: 'Phát triển phần mềm' },
  { value: 'ECOMMERCE', label: 'Thương mại điện tử' },

  { value: 'FINANCE', label: 'Tài chính' },
  { value: 'BANKING', label: 'Ngân hàng' },
  { value: 'INSURANCE', label: 'Bảo hiểm' },
  { value: 'FINTECH', label: 'Công nghệ tài chính (Fintech)' },

  { value: 'EDUCATION', label: 'Giáo dục' },
  { value: 'E_LEARNING', label: 'Đào tạo trực tuyến' },

  { value: 'HEALTHCARE', label: 'Chăm sóc sức khỏe' },
  { value: 'PHARMACEUTICAL', label: 'Dược phẩm' },
  { value: 'BIOTECHNOLOGY', label: 'Công nghệ sinh học' },

  { value: 'MANUFACTURING', label: 'Sản xuất' },
  { value: 'INDUSTRIAL', label: 'Công nghiệp' },
  { value: 'AUTOMOTIVE', label: 'Công nghiệp ô tô' },
  { value: 'ELECTRONICS', label: 'Điện tử' },

  { value: 'CONSTRUCTION', label: 'Xây dựng' },
  { value: 'REAL_ESTATE', label: 'Bất động sản' },
  { value: 'ARCHITECTURE', label: 'Kiến trúc' },

  { value: 'RETAIL', label: 'Bán lẻ' },
  { value: 'WHOLESALE', label: 'Bán buôn' },
  { value: 'FMCG', label: 'Hàng tiêu dùng nhanh (FMCG)' },

  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'TRANSPORTATION', label: 'Vận tải' },
  { value: 'SUPPLY_CHAIN', label: 'Chuỗi cung ứng' },

  { value: 'FOOD_BEVERAGE', label: 'Thực phẩm & Đồ uống' },
  { value: 'AGRICULTURE', label: 'Nông nghiệp' },

  { value: 'ENERGY', label: 'Năng lượng' },
  { value: 'OIL_GAS', label: 'Dầu khí' },
  { value: 'RENEWABLE_ENERGY', label: 'Năng lượng tái tạo' },

  { value: 'TELECOMMUNICATIONS', label: 'Viễn thông' },
  { value: 'MEDIA', label: 'Truyền thông' },
  { value: 'MARKETING', label: 'Marketing & Quảng cáo' },

  { value: 'ENTERTAINMENT', label: 'Giải trí' },
  { value: 'GAMING', label: 'Trò chơi điện tử (Game)' },
  { value: 'SPORTS', label: 'Thể thao' },

  { value: 'TOURISM', label: 'Du lịch' },
  { value: 'HOSPITALITY', label: 'Khách sạn & Nhà hàng' },

  { value: 'CONSULTING', label: 'Tư vấn' },
  { value: 'LEGAL', label: 'Luật' },
  { value: 'ACCOUNTING', label: 'Kế toán' },
  { value: 'AUDITING', label: 'Kiểm toán' },

  { value: 'HUMAN_RESOURCES', label: 'Nhân sự' },
  { value: 'RECRUITMENT', label: 'Tuyển dụng' },

  { value: 'NGO', label: 'Tổ chức phi lợi nhuận' },
  { value: 'GOVERNMENT', label: 'Cơ quan nhà nước' },

  { value: 'OTHER', label: 'Lĩnh vực khác' },
];

export const COUNTRY_OPTIONS = [
  { value: 'AFGHANISTAN', label: 'Afghanistan' },
  { value: 'ALBANIA', label: 'Albania' },
  { value: 'ALGERIA', label: 'Algeria' },
  { value: 'ANDORRA', label: 'Andorra' },
  { value: 'ANGOLA', label: 'Angola' },
  { value: 'ANTIGUA_AND_BARBUDA', label: 'Antigua và Barbuda' },
  { value: 'ARGENTINA', label: 'Argentina' },
  { value: 'ARMENIA', label: 'Armenia' },
  { value: 'AUSTRALIA', label: 'Úc' },
  { value: 'AUSTRIA', label: 'Áo' },
  { value: 'AZERBAIJAN', label: 'Azerbaijan' },

  { value: 'BAHAMAS', label: 'Bahamas' },
  { value: 'BAHRAIN', label: 'Bahrain' },
  { value: 'BANGLADESH', label: 'Bangladesh' },
  { value: 'BARBADOS', label: 'Barbados' },
  { value: 'BELARUS', label: 'Belarus' },
  { value: 'BELGIUM', label: 'Bỉ' },
  { value: 'BELIZE', label: 'Belize' },
  { value: 'BENIN', label: 'Benin' },
  { value: 'BHUTAN', label: 'Bhutan' },
  { value: 'BOLIVIA', label: 'Bolivia' },
  { value: 'BOSNIA_AND_HERZEGOVINA', label: 'Bosnia và Herzegovina' },
  { value: 'BOTSWANA', label: 'Botswana' },
  { value: 'BRAZIL', label: 'Brazil' },
  { value: 'BRUNEI', label: 'Brunei' },
  { value: 'BULGARIA', label: 'Bulgaria' },
  { value: 'BURKINA_FASO', label: 'Burkina Faso' },
  { value: 'BURUNDI', label: 'Burundi' },

  { value: 'CAMBODIA', label: 'Campuchia' },
  { value: 'CAMEROON', label: 'Cameroon' },
  { value: 'CANADA', label: 'Canada' },
  { value: 'CAPE_VERDE', label: 'Cape Verde' },
  { value: 'CENTRAL_AFRICAN_REPUBLIC', label: 'Cộng hòa Trung Phi' },
  { value: 'CHAD', label: 'Chad' },
  { value: 'CHILE', label: 'Chile' },
  { value: 'CHINA', label: 'Trung Quốc' },
  { value: 'COLOMBIA', label: 'Colombia' },
  { value: 'COMOROS', label: 'Comoros' },
  { value: 'COSTA_RICA', label: 'Costa Rica' },
  { value: 'CROATIA', label: 'Croatia' },
  { value: 'CUBA', label: 'Cuba' },
  { value: 'CYPRUS', label: 'Síp' },
  { value: 'CZECH_REPUBLIC', label: 'Séc' },

  { value: 'DENMARK', label: 'Đan Mạch' },
  { value: 'DJIBOUTI', label: 'Djibouti' },
  { value: 'DOMINICA', label: 'Dominica' },
  { value: 'DOMINICAN_REPUBLIC', label: 'Cộng hòa Dominica' },

  { value: 'ECUADOR', label: 'Ecuador' },
  { value: 'EGYPT', label: 'Ai Cập' },
  { value: 'EL_SALVADOR', label: 'El Salvador' },
  { value: 'EQUATORIAL_GUINEA', label: 'Guinea Xích Đạo' },
  { value: 'ERITREA', label: 'Eritrea' },
  { value: 'ESTONIA', label: 'Estonia' },
  { value: 'ESWATINI', label: 'Eswatini' },
  { value: 'ETHIOPIA', label: 'Ethiopia' },

  { value: 'FIJI', label: 'Fiji' },
  { value: 'FINLAND', label: 'Phần Lan' },
  { value: 'FRANCE', label: 'Pháp' },

  { value: 'GABON', label: 'Gabon' },
  { value: 'GAMBIA', label: 'Gambia' },
  { value: 'GEORGIA', label: 'Georgia' },
  { value: 'GERMANY', label: 'Đức' },
  { value: 'GHANA', label: 'Ghana' },
  { value: 'GREECE', label: 'Hy Lạp' },
  { value: 'GRENADA', label: 'Grenada' },
  { value: 'GUATEMALA', label: 'Guatemala' },
  { value: 'GUINEA', label: 'Guinea' },
  { value: 'GUINEA_BISSAU', label: 'Guinea-Bissau' },
  { value: 'GUYANA', label: 'Guyana' },

  { value: 'HAITI', label: 'Haiti' },
  { value: 'HONDURAS', label: 'Honduras' },
  { value: 'HUNGARY', label: 'Hungary' },

  { value: 'ICELAND', label: 'Iceland' },
  { value: 'INDIA', label: 'Ấn Độ' },
  { value: 'INDONESIA', label: 'Indonesia' },
  { value: 'IRAN', label: 'Iran' },
  { value: 'IRAQ', label: 'Iraq' },
  { value: 'IRELAND', label: 'Ireland' },
  { value: 'ISRAEL', label: 'Israel' },
  { value: 'ITALY', label: 'Ý' },

  { value: 'JAMAICA', label: 'Jamaica' },
  { value: 'JAPAN', label: 'Nhật Bản' },
  { value: 'JORDAN', label: 'Jordan' },

  { value: 'KAZAKHSTAN', label: 'Kazakhstan' },
  { value: 'KENYA', label: 'Kenya' },
  { value: 'KIRIBATI', label: 'Kiribati' },
  { value: 'KOREA_NORTH', label: 'Triều Tiên' },
  { value: 'KOREA_SOUTH', label: 'Hàn Quốc' },
  { value: 'KUWAIT', label: 'Kuwait' },
  { value: 'KYRGYZSTAN', label: 'Kyrgyzstan' },

  { value: 'LAOS', label: 'Lào' },
  { value: 'LATVIA', label: 'Latvia' },
  { value: 'LEBANON', label: 'Liban' },
  { value: 'LESOTHO', label: 'Lesotho' },
  { value: 'LIBERIA', label: 'Liberia' },
  { value: 'LIBYA', label: 'Libya' },
  { value: 'LIECHTENSTEIN', label: 'Liechtenstein' },
  { value: 'LITHUANIA', label: 'Lithuania' },
  { value: 'LUXEMBOURG', label: 'Luxembourg' },

  { value: 'MADAGASCAR', label: 'Madagascar' },
  { value: 'MALAYSIA', label: 'Malaysia' },
  { value: 'MALDIVES', label: 'Maldives' },
  { value: 'MALI', label: 'Mali' },
  { value: 'MALTA', label: 'Malta' },
  { value: 'MEXICO', label: 'Mexico' },
  { value: 'MONGOLIA', label: 'Mông Cổ' },
  { value: 'MOROCCO', label: 'Ma-rốc' },
  { value: 'MOZAMBIQUE', label: 'Mozambique' },
  { value: 'MYANMAR', label: 'Myanmar' },

  { value: 'NAMIBIA', label: 'Namibia' },
  { value: 'NEPAL', label: 'Nepal' },
  { value: 'NETHERLANDS', label: 'Hà Lan' },
  { value: 'NEW_ZEALAND', label: 'New Zealand' },
  { value: 'NIGERIA', label: 'Nigeria' },
  { value: 'NORWAY', label: 'Na Uy' },

  { value: 'PAKISTAN', label: 'Pakistan' },
  { value: 'PHILIPPINES', label: 'Philippines' },
  { value: 'POLAND', label: 'Ba Lan' },
  { value: 'PORTUGAL', label: 'Bồ Đào Nha' },

  { value: 'QATAR', label: 'Qatar' },

  { value: 'ROMANIA', label: 'Romania' },
  { value: 'RUSSIA', label: 'Nga' },

  { value: 'SAUDI_ARABIA', label: 'Ả Rập Saudi' },
  { value: 'SINGAPORE', label: 'Singapore' },
  { value: 'SOUTH_AFRICA', label: 'Nam Phi' },
  { value: 'SPAIN', label: 'Tây Ban Nha' },
  { value: 'SWEDEN', label: 'Thụy Điển' },
  { value: 'SWITZERLAND', label: 'Thụy Sĩ' },

  { value: 'THAILAND', label: 'Thái Lan' },
  { value: 'TURKEY', label: 'Thổ Nhĩ Kỳ' },

  { value: 'UKRAINE', label: 'Ukraine' },
  { value: 'UNITED_ARAB_EMIRATES', label: 'Các Tiểu vương quốc Ả Rập Thống nhất' },
  { value: 'UNITED_KINGDOM', label: 'Vương quốc Anh' },
  { value: 'UNITED_STATES', label: 'Hoa Kỳ' },

  { value: 'VIETNAM', label: 'Việt Nam' },
  { value: 'ZIMBABWE', label: 'Zimbabwe' },
];

export const DEFAULT_BLOG_PAGE_SIZE = 15;
