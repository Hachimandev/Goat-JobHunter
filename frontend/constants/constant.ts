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
export const CHAT_MESSAGE_PAGE_SIZE = 20;
export const CHAT_MESSAGE_SCROLL_TOP_THRESHOLD = 80;
export const CHAT_ROOM_SIDEBAR_PAGE_SIZE = 20;
export const CHAT_ROOM_SIDEBAR_SCROLL_BOTTOM_THRESHOLD = 120;
export const CHAT_DETAIL_ASSET_PAGE_SIZE = 20;

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
  { value: 'AFGHANISTAN', label: 'Afghanistan', language: 'Afghan', langCode: 'ps-AF' },
  { value: 'ALBANIA', label: 'Albania', language: 'Albanian', langCode: 'sq-AL' },
  { value: 'ALGERIA', label: 'Algeria', language: 'Algerian', langCode: 'ar-DZ' },
  { value: 'ANDORRA', label: 'Andorra', language: 'Andorran', langCode: 'ca-AD' },
  { value: 'ANGOLA', label: 'Angola', language: 'Angolan', langCode: 'pt-AO' },
  { value: 'ANTIGUA_AND_BARBUDA', label: 'Antigua và Barbuda', language: 'Antiguan', langCode: 'en-AG' },
  { value: 'ARGENTINA', label: 'Argentina', language: 'Argentine', langCode: 'es-AR' },
  { value: 'ARMENIA', label: 'Armenia', language: 'Armenian', langCode: 'hy-AM' },
  { value: 'AUSTRALIA', label: 'Úc', language: 'Australian', langCode: 'en-AU' },
  { value: 'AUSTRIA', label: 'Áo', language: 'Austrian', langCode: 'de-AT' },
  { value: 'AZERBAIJAN', label: 'Azerbaijan', language: 'Azerbaijani', langCode: 'az-AZ' },
  { value: 'BAHAMAS', label: 'Bahamas', language: 'Bahamian', langCode: 'en-BS' },
  { value: 'BAHRAIN', label: 'Bahrain', language: 'Bahraini', langCode: 'ar-BH' },
  { value: 'BANGLADESH', label: 'Bangladesh', language: 'Bangladeshi', langCode: 'bn-BD' },
  { value: 'BARBADOS', label: 'Barbados', language: 'Barbadian', langCode: 'en-BB' },
  { value: 'BELARUS', label: 'Belarus', language: 'Belarusian', langCode: 'be-BY' },
  { value: 'BELGIUM', label: 'Bỉ', language: 'Belgian', langCode: 'nl-BE' },
  { value: 'BELIZE', label: 'Belize', language: 'Belizean', langCode: 'en-BZ' },
  { value: 'BENIN', label: 'Benin', language: 'Beninese', langCode: 'fr-BJ' },
  { value: 'BHUTAN', label: 'Bhutan', language: 'Bhutanese', langCode: 'dz-BT' },
  { value: 'BOLIVIA', label: 'Bolivia', language: 'Bolivian', langCode: 'es-BO' },
  { value: 'BOSNIA_AND_HERZEGOVINA', label: 'Bosnia và Herzegovina', language: 'Bosnian', langCode: 'bs-BA' },
  { value: 'BOTSWANA', label: 'Botswana', language: 'Motswana', langCode: 'en-BW' },
  { value: 'BRAZIL', label: 'Brazil', language: 'Brazilian', langCode: 'pt-BR' },
  { value: 'BRUNEI', label: 'Brunei', language: 'Bruneian', langCode: 'ms-BN' },
  { value: 'BULGARIA', label: 'Bulgaria', language: 'Bulgarian', langCode: 'bg-BG' },
  { value: 'BURKINA_FASO', label: 'Burkina Faso', language: 'Burkinabe', langCode: 'fr-BF' },
  { value: 'BURUNDI', label: 'Burundi', language: 'Burundian', langCode: 'rn-BI' },
  { value: 'CAMBODIA', label: 'Campuchia', language: 'Cambodian', langCode: 'km-KH' },
  { value: 'CAMEROON', label: 'Cameroon', language: 'Cameroonian', langCode: 'fr-CM' },
  { value: 'CANADA', label: 'Canada', language: 'Canadian', langCode: 'en-CA' },
  { value: 'CAPE_VERDE', label: 'Cape Verde', language: 'Cape Verdean', langCode: 'pt-CV' },
  { value: 'CENTRAL_AFRICAN_REPUBLIC', label: 'Cộng hòa Trung Phi', language: 'Central African', langCode: 'fr-CF' },
  { value: 'CHAD', label: 'Chad', language: 'Chadian', langCode: 'fr-TD' },
  { value: 'CHILE', label: 'Chile', language: 'Chilean', langCode: 'es-CL' },
  { value: 'CHINA', label: 'Trung Quốc', language: 'Chinese', langCode: 'zh-CN' },
  { value: 'COLOMBIA', label: 'Colombia', language: 'Colombian', langCode: 'es-CO' },
  { value: 'COMOROS', label: 'Comoros', language: 'Comorian', langCode: 'fr-KM' },
  { value: 'COSTA_RICA', label: 'Costa Rica', language: 'Costa Rican', langCode: 'es-CR' },
  { value: 'CROATIA', label: 'Croatia', language: 'Croatian', langCode: 'hr-HR' },
  { value: 'CUBA', label: 'Cuba', language: 'Cuban', langCode: 'es-CU' },
  { value: 'CYPRUS', label: 'Síp', language: 'Cypriot', langCode: 'el-CY' },
  { value: 'CZECH_REPUBLIC', label: 'Séc', language: 'Czech', langCode: 'cs-CZ' },
  { value: 'DENMARK', label: 'Đan Mạch', language: 'Danish', langCode: 'da-DK' },
  { value: 'DJIBOUTI', label: 'Djibouti', language: 'Djiboutian', langCode: 'fr-DJ' },
  { value: 'DOMINICA', label: 'Dominica', language: 'Dominican', langCode: 'en-DM' },
  { value: 'DOMINICAN_REPUBLIC', label: 'Cộng hòa Dominica', language: 'Dominican Republic', langCode: 'es-DO' },
  { value: 'ECUADOR', label: 'Ecuador', language: 'Ecuadorian', langCode: 'es-EC' },
  { value: 'EGYPT', label: 'Ai Cập', language: 'Egyptian', langCode: 'ar-EG' },
  { value: 'EL_SALVADOR', label: 'El Salvador', language: 'Salvadoran', langCode: 'es-SV' },
  { value: 'EQUATORIAL_GUINEA', label: 'Guinea Xích Đạo', language: 'Equatorial Guinean', langCode: 'es-GQ' },
  { value: 'ERITREA', label: 'Eritrea', language: 'Eritrean', langCode: 'ti-ER' },
  { value: 'ESTONIA', label: 'Estonia', language: 'Estonian', langCode: 'et-EE' },
  { value: 'ESWATINI', label: 'Eswatini', language: 'Swazi', langCode: 'ss-SZ' },
  { value: 'ETHIOPIA', label: 'Ethiopia', language: 'Ethiopian', langCode: 'am-ET' },
  { value: 'FIJI', label: 'Fiji', language: 'Fijian', langCode: 'en-FJ' },
  { value: 'FINLAND', label: 'Phần Lan', language: 'Finnish', langCode: 'fi-FI' },
  { value: 'FRANCE', label: 'Pháp', language: 'French', langCode: 'fr-FR' },
  { value: 'GABON', label: 'Gabon', language: 'Gabonese', langCode: 'fr-GA' },
  { value: 'GAMBIA', label: 'Gambia', language: 'Gambian', langCode: 'en-GM' },
  { value: 'GEORGIA', label: 'Georgia', language: 'Georgian', langCode: 'ka-GE' },
  { value: 'GERMANY', label: 'Đức', language: 'German', langCode: 'de-DE' },
  { value: 'GHANA', label: 'Ghana', language: 'Ghanaian', langCode: 'en-GH' },
  { value: 'GREECE', label: 'Hy Lạp', language: 'Greek', langCode: 'el-GR' },
  { value: 'GRENADA', label: 'Grenada', language: 'Grenadian', langCode: 'en-GD' },
  { value: 'GUATEMALA', label: 'Guatemala', language: 'Guatemalan', langCode: 'es-GT' },
  { value: 'GUINEA', label: 'Guinea', language: 'Guinean', langCode: 'fr-GN' },
  { value: 'GUINEA_BISSAU', label: 'Guinea-Bissau', language: 'Guinea-Bissauan', langCode: 'pt-GW' },
  { value: 'GUYANA', label: 'Guyana', language: 'Guyanese', langCode: 'en-GY' },
  { value: 'HAITI', label: 'Haiti', language: 'Haitian', langCode: 'ht-HT' },
  { value: 'HONDURAS', label: 'Honduras', language: 'Honduran', langCode: 'es-HN' },
  { value: 'HUNGARY', label: 'Hungary', language: 'Hungarian', langCode: 'hu-HU' },
  { value: 'ICELAND', label: 'Iceland', language: 'Icelandic', langCode: 'is-IS' },
  { value: 'INDIA', label: 'Ấn Độ', language: 'Indian', langCode: 'hi-IN' },
  { value: 'INDONESIA', label: 'Indonesia', language: 'Indonesian', langCode: 'id-ID' },
  { value: 'IRAN', label: 'Iran', language: 'Iranian', langCode: 'fa-IR' },
  { value: 'IRAQ', label: 'Iraq', language: 'Iraqi', langCode: 'ar-IQ' },
  { value: 'IRELAND', label: 'Ireland', language: 'Irish', langCode: 'en-IE' },
  { value: 'ISRAEL', label: 'Israel', language: 'Israeli', langCode: 'he-IL' },
  { value: 'ITALY', label: 'Ý', language: 'Italian', langCode: 'it-IT' },
  { value: 'JAMAICA', label: 'Jamaica', language: 'Jamaican', langCode: 'en-JM' },
  { value: 'JAPAN', label: 'Nhật Bản', language: 'Japanese', langCode: 'ja-JP' },
  { value: 'JORDAN', label: 'Jordan', language: 'Jordanian', langCode: 'ar-JO' },
  { value: 'KAZAKHSTAN', label: 'Kazakhstan', language: 'Kazakhstani', langCode: 'kk-KZ' },
  { value: 'KENYA', label: 'Kenya', language: 'Kenyan', langCode: 'sw-KE' },
  { value: 'KIRIBATI', label: 'Kiribati', language: 'I-Kiribati', langCode: 'en-KI' },
  { value: 'KOREA_NORTH', label: 'Triều Tiên', language: 'North Korean', langCode: 'ko-KP' },
  { value: 'KOREA_SOUTH', label: 'Hàn Quốc', language: 'South Korean', langCode: 'ko-KR' },
  { value: 'KUWAIT', label: 'Kuwait', language: 'Kuwaiti', langCode: 'ar-KW' },
  { value: 'KYRGYZSTAN', label: 'Kyrgyzstan', language: 'Kyrgyzstani', langCode: 'ky-KG' },
  { value: 'LAOS', label: 'Lào', language: 'Lao', langCode: 'lo-LA' },
  { value: 'LATVIA', label: 'Latvia', language: 'Latvian', langCode: 'lv-LV' },
  { value: 'LEBANON', label: 'Liban', language: 'Lebanese', langCode: 'ar-LB' },
  { value: 'LESOTHO', label: 'Lesotho', language: 'Basotho', langCode: 'st-LS' },
  { value: 'LIBERIA', label: 'Liberia', language: 'Liberian', langCode: 'en-LR' },
  { value: 'LIBYA', label: 'Libya', language: 'Libyan', langCode: 'ar-LY' },
  { value: 'LIECHTENSTEIN', label: 'Liechtenstein', language: 'Liechtensteiner', langCode: 'de-LI' },
  { value: 'LITHUANIA', label: 'Lithuania', language: 'Lithuanian', langCode: 'lt-LT' },
  { value: 'LUXEMBOURG', label: 'Luxembourg', language: 'Luxembourger', langCode: 'lb-LU' },
  { value: 'MADAGASCAR', label: 'Madagascar', language: 'Malagasy', langCode: 'mg-MG' },
  { value: 'MALAYSIA', label: 'Malaysia', language: 'Malaysian', langCode: 'ms-MY' },
  { value: 'MALDIVES', label: 'Maldives', language: 'Maldivian', langCode: 'dv-MV' },
  { value: 'MALI', label: 'Mali', language: 'Malian', langCode: 'fr-ML' },
  { value: 'MALTA', label: 'Malta', language: 'Maltese', langCode: 'mt-MT' },
  { value: 'MEXICO', label: 'Mexico', language: 'Mexican', langCode: 'es-MX' },
  { value: 'MONGOLIA', label: 'Mông Cổ', language: 'Mongolian', langCode: 'mn-MN' },
  { value: 'MOROCCO', label: 'Ma-rốc', language: 'Moroccan', langCode: 'ar-MA' },
  { value: 'MOZAMBIQUE', label: 'Mozambique', language: 'Mozambican', langCode: 'pt-MZ' },
  { value: 'MYANMAR', label: 'Myanmar', language: 'Burmese', langCode: 'my-MM' },
  { value: 'NAMIBIA', label: 'Namibia', language: 'Namibian', langCode: 'en-NA' },
  { value: 'NEPAL', label: 'Nepal', language: 'Nepali', langCode: 'ne-NP' },
  { value: 'NETHERLANDS', label: 'Hà Lan', language: 'Dutch', langCode: 'nl-NL' },
  { value: 'NEW_ZEALAND', label: 'New Zealand', language: 'New Zealander', langCode: 'en-NZ' },
  { value: 'NIGERIA', label: 'Nigeria', language: 'Nigerian', langCode: 'en-NG' },
  { value: 'NORWAY', label: 'Na Uy', language: 'Norwegian', langCode: 'nb-NO' },
  { value: 'PAKISTAN', label: 'Pakistan', language: 'Pakistani', langCode: 'ur-PK' },
  { value: 'PHILIPPINES', label: 'Philippines', language: 'Filipino', langCode: 'fil-PH' },
  { value: 'POLAND', label: 'Ba Lan', language: 'Polish', langCode: 'pl-PL' },
  { value: 'PORTUGAL', label: 'Bồ Đào Nha', language: 'Portuguese', langCode: 'pt-PT' },
  { value: 'QATAR', label: 'Qatar', language: 'Qatari', langCode: 'ar-QA' },
  { value: 'ROMANIA', label: 'Romania', language: 'Romanian', langCode: 'ro-RO' },
  { value: 'RUSSIA', label: 'Nga', language: 'Russian', langCode: 'ru-RU' },
  { value: 'SAUDI_ARABIA', label: 'Ả Rập Saudi', language: 'Saudi', langCode: 'ar-SA' },
  { value: 'SINGAPORE', label: 'Singapore', language: 'Singaporean', langCode: 'en-SG' },
  { value: 'SOUTH_AFRICA', label: 'Nam Phi', language: 'South African', langCode: 'en-ZA' },
  { value: 'SPAIN', label: 'Tây Ban Nha', language: 'Spanish', langCode: 'es-ES' },
  { value: 'SWEDEN', label: 'Thụy Điển', language: 'Swedish', langCode: 'sv-SE' },
  { value: 'SWITZERLAND', label: 'Thụy Sĩ', language: 'Swiss', langCode: 'de-CH' },
  { value: 'THAILAND', label: 'Thái Lan', language: 'Thai', langCode: 'th-TH' },
  { value: 'TURKEY', label: 'Thổ Nhĩ Kỳ', language: 'Turkish', langCode: 'tr-TR' },
  { value: 'UKRAINE', label: 'Ukraine', language: 'Ukrainian', langCode: 'uk-UA' },
  {
    value: 'UNITED_ARAB_EMIRATES',
    label: 'Các Tiểu vương quốc Ả Rập Thống nhất',
    language: 'Emirati',
    langCode: 'ar-AE',
  },
  { value: 'UNITED_KINGDOM', label: 'Vương quốc Anh', language: 'British', langCode: 'en-GB' },
  { value: 'UNITED_STATES', label: 'Hoa Kỳ', language: 'American', langCode: 'en-US' },
  { value: 'VIETNAM', label: 'Việt Nam', language: 'Vietnamese', langCode: 'vi-VN' },
  { value: 'ZIMBABWE', label: 'Zimbabwe', language: 'Zimbabwean', langCode: 'en-ZW' },
];

export const DEFAULT_BLOG_PAGE_SIZE = 15;

export const COLOR_OPTIONS = [
  '#E03131',
  '#0CA678',
  '#1C7ED6',
  '#F76707',
  '#2F9E44',
  '#E0A800',
  '#9C36B5',
  '#1864AB',
  '#D9480F',
  '#2B8A3E',
];
