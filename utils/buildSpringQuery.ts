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
        // Convert array to Spring Filter format: skills in [1,2,3]
        const ids = value.join(',');
        filterConditions.push(`${field} in [${ids}]`);
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
        const ids = value.join(',');
        filterConditions.push(`${queryKey} in [${ids}]`);
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
      const ids = params[paramKey].join(',');
      filterConditions.push(`${queryKey} in [${ids}]`);
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


