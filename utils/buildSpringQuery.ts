export const buildSpringQuery = ({
  params,
  filterFields = [],
  textSearchFields = [],
  nestedArrayFields = {},
  defaultSort = 'createdAt,desc',
  sortableFields = [],
}: {
  params: Record<string, any>;
  filterFields?: string[];
  textSearchFields?: string[];
  nestedArrayFields?: Record<string, string>;
  defaultSort?: string;
  sortableFields?: string[];
}) => {
  const queryParams: Record<string, any> = {};

  // Pagination
  if (params.page !== undefined) {
    queryParams.page = params.page;
  }
  if (params.size !== undefined) {
    queryParams.size = params.size;
  }

  // Filters
  filterFields.forEach((field) => {
    if (params[field] !== undefined && params[field] !== null && params[field] !== '') {
      if (textSearchFields.includes(field)) {
        queryParams[field] = params[field];
      } else {
        queryParams[field] = params[field];
      }
    }
  });

  // Nested array fields (như skills)
  Object.entries(nestedArrayFields).forEach(([paramKey, queryKey]) => {
    if (params[paramKey] && Array.isArray(params[paramKey])) {
      queryParams[queryKey] = params[paramKey].join(',');
    }
  });

  // Sort
  if (params.sort) {
    queryParams.sort = params.sort;
  } else {
    queryParams.sort = defaultSort;
  }

  return { params: queryParams };
};


