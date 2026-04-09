export const buildSpringQuery = ({
  params,
  filterFields = [],
  textSearchFields = [],
  nestedArrayFields = {},
  nestedFields = {},
  defaultSort = 'createdAt,desc',
  sortableFields = [],
}: {
  params: Record<string, any>;
  filterFields?: string[];
  textSearchFields?: string[];
  nestedArrayFields?: Record<string, string>;
  nestedFields?: Record<string, string>;
  defaultSort?: string;
  sortableFields?: string[];
}) => {
  const queryParams: Record<string, any> = {};
  const filterConditions: string[] = [];

  // Pagination
  if (params.page !== undefined) {
    queryParams.page = params.page;
  }
  if (params.size !== undefined) {
    queryParams.size = params.size;
  }

  // Build Spring Filter conditions
  filterFields.forEach((field) => {
    if (params[field] !== undefined && params[field] !== null && params[field] !== '') {
      const value = params[field];
      
      if (Array.isArray(value)) {
        // Check if array contains strings (need quotes) or numbers (no quotes)
        const isStringArray = value.some((v) => typeof v === 'string');
        if (isStringArray) {
          // String array: level in ['JUNIOR','SENIOR']
          const quotedIds = value.map((v) => `'${v}'`).join(',');
          filterConditions.push(`${field} in [${quotedIds}]`);
        } else {
          // Number array: skills in [1,2,3]
          const ids = value.join(',');
          filterConditions.push(`${field} in [${ids}]`);
        }
      } else if (textSearchFields.includes(field)) {
        // For text search: title =like '%value%'
        filterConditions.push(`${field} =like '%${value}%'`);
      } else if (typeof value === 'boolean') {
        // Boolean: active == true
        filterConditions.push(`${field} == ${value}`);
      } else if (typeof value === 'string') {
        // String enum: level == 'JUNIOR'
        filterConditions.push(`${field} == '${value}'`);
      } else {
        // Number: salary == 5000000
        filterConditions.push(`${field} == ${value}`);
      }
    }
  });

  // Nested fields (like address.province, company.accountId)
  Object.entries(nestedFields).forEach(([paramKey, queryKey]) => {
    if (params[paramKey] !== undefined && params[paramKey] !== null && params[paramKey] !== '') {
      const value = params[paramKey];
      
      if (Array.isArray(value)) {
        // Check if array contains strings (need quotes) or numbers (no quotes)
        const isStringArray = value.some((v) => typeof v === 'string');
        if (isStringArray) {
          // String array: address.province in ['Ha Noi','Sai Gon']
          const quotedIds = value.map((v) => `'${v}'`).join(',');
          filterConditions.push(`${queryKey} in [${quotedIds}]`);
        } else {
          // Number array: company.accountId in [1,2,3]
          const ids = value.join(',');
          filterConditions.push(`${queryKey} in [${ids}]`);
        }
      } else if (textSearchFields.includes(paramKey)) {
        filterConditions.push(`${queryKey} =like '%${value}%'`);
      } else if (typeof value === 'boolean') {
        filterConditions.push(`${queryKey} == ${value}`);
      } else if (typeof value === 'string') {
        filterConditions.push(`${queryKey} == '${value}'`);
      } else {
        filterConditions.push(`${queryKey} == ${value}`);
      }
    }
  });

  // Nested array fields (如skills)
  Object.entries(nestedArrayFields).forEach(([paramKey, queryKey]) => {
    if (params[paramKey] && Array.isArray(params[paramKey])) {
      // Check if array contains strings (need quotes) or numbers (no quotes)
      const isStringArray = params[paramKey].some((v: any) => typeof v === 'string');
      if (isStringArray) {
        // String array
        const quotedIds = params[paramKey].map((v: any) => `'${v}'`).join(',');
        filterConditions.push(`${queryKey} in [${quotedIds}]`);
      } else {
        // Number array
        const ids = params[paramKey].join(',');
        filterConditions.push(`${queryKey} in [${ids}]`);
      }
    }
  });

  // Combine all filter conditions with 'and'
  if (filterConditions.length > 0) {
    queryParams.filter = filterConditions.join(' and ');
  }

  // Sort
  if (params.sort) {
    queryParams.sort = params.sort;
  } else {
    queryParams.sort = defaultSort;
  }

  return { params: queryParams };
};


