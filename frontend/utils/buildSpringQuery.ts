import { sfEqual, sfIn, sfLike } from 'spring-filter-query-builder';

interface BuildQueryOptions {
    params: Record<string, string | number | boolean | Array<string | number>>;
    filterFields: string[];
    textSearchFields?: string[]; // Các field dùng LIKE search
    nestedFields?: Record<string, string>; // Map field -> nested path, vd: { jobTitle: "job.title" }
    nestedArrayFields?: Record<string, string>; // Map field -> nested path cho array, vd: { skills: "skills.name" }
    arrayFields?: string[]; // Các field là array không phải object nested
    defaultSort?: string; // Default sort, vd: "updatedAt,desc"
    sortableFields?: string[]; // Các field có thể sort
}

interface BuildQueryResult {
    params: Record<string, string | number | boolean | Array<string | number>>;
    filterQuery: string;
}

/**
 * Build query params cho Spring Boot backend
 * @param options - Options để build query
 * @returns Object chứa params đã xử lý và filter query string
 */
export const buildSpringQuery = (options: BuildQueryOptions): BuildQueryResult => {
    const {
        params,
        filterFields,
        textSearchFields = [],
        nestedFields = {},
        nestedArrayFields = {},
        defaultSort = 'updatedAt,desc',
        sortableFields = ['title', 'salary', 'createdAt', 'updatedAt'],
    } = options;

    const clone = { ...params };
    const filterParts: string[] = [];

    // 1. Xử lý các filterFields thông thường (root level)
    for (const field of filterFields) {
        if (
            Object.prototype.hasOwnProperty.call(nestedFields, field) ||
            Object.prototype.hasOwnProperty.call(nestedArrayFields, field)
        ) {
            continue;
        }

        const value = clone[field];

        if (value === undefined || value === null || value === '') {
            continue;
        }

        // Nếu là array và có phần tử, dùng sfIn
        if (Array.isArray(value) && value.length > 0) {
            filterParts.push(sfIn(field, value).toString());
        }
        // Nếu là string và field nằm trong textSearchFields, dùng sfLike
        else if (typeof value === 'string' && textSearchFields.includes(field)) {
            filterParts.push(sfLike(field, value).toString());
        }
        // Các trường hợp còn lại dùng sfEqual
        else if (!Array.isArray(value)) {
            const normalizedValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
            filterParts.push(sfEqual(field, normalizedValue as string | number).toString());
        }

        // Xóa field đã xử lý
        delete clone[field];
    }

    // 2. Xử lý các nested fields (vd: jobTitle -> job.title)
    //    Support in / like / equal like root level
    for (const [field, nestedPath] of Object.entries(nestedFields)) {
        const value = clone[field];

        if (value === undefined || value === null || value === '') {
            continue;
        }

        if (Array.isArray(value) && value.length > 0) {
            filterParts.push(sfIn(nestedPath, value).toString());
        } else if (typeof value === 'string' && textSearchFields.includes(field)) {
            filterParts.push(sfLike(nestedPath, value).toString());
        } else if (!Array.isArray(value)) {
            const normalizedValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
            filterParts.push(sfEqual(nestedPath, normalizedValue as string | number).toString());
        }

        delete clone[field];
    }

    // 3. Xử lý nested array fields (vd: skills -> skills.name)
    //    Allow array (in), string (like), or single value (equal)
    for (const [field, nestedPath] of Object.entries(nestedArrayFields)) {
        const value = clone[field];

        if (value === undefined || value === null || value === '') {
            continue;
        }

        if (Array.isArray(value) && value.length > 0) {
            filterParts.push(sfIn(nestedPath, value).toString());
        } else if (typeof value === 'string' && textSearchFields.includes(field)) {
            filterParts.push(sfLike(nestedPath, value).toString());
        } else if (!Array.isArray(value)) {
            const normalizedValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
            filterParts.push(sfEqual(nestedPath, normalizedValue as string | number).toString());
        }

        delete clone[field];
    }

    // 4. Xử lý array fields không nested
    const { arrayFields = [] } = options;

    for (const field of arrayFields) {
        const value = clone[field];

        if (value === undefined || value === null || value === '') {
            continue;
        }

        if (Array.isArray(value) && value.length > 0) {
            filterParts.push(sfIn(field, value).toString());
        } else if (typeof value === 'string') {
            // Single value - có thể là comma-separated string
            const values = value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean);
            if (values.length > 0) {
                filterParts.push(sfIn(field, values).toString());
            }
        }

        delete clone[field];
    }

    // Combine filters với AND
    const filterQuery = filterParts.length > 0 ? filterParts.join(' and ') : '';

    if (filterQuery) {
        clone.filter = filterQuery;
    }

    // Xử lý pagination
    if (clone.page !== undefined) {
        clone.page = Number(clone.page);
    }

    if (clone.limit !== undefined) {
        clone.size = clone.limit;
        delete clone.limit;
    }

    // Xử lý sort
    let sortParam = '';

    if (clone.sort && typeof clone.sort === 'object') {
        for (const field of sortableFields) {
            if (clone.sort[field as keyof typeof clone.sort]) {
                sortParam = `${field},${clone.sort[field as keyof typeof clone.sort] === 'ascend' ? 'asc' : 'desc'}`;
                break;
            }
        }
        delete clone.sort;
    }

    // Default sort nếu không có
    if (!sortParam) {
        sortParam = defaultSort;
    }

    clone.sort = sortParam;

    console.log('Built query:', { params: clone, filterQuery });

    return {
        params: clone,
        filterQuery,
    };
};
