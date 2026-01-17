export const transformCategoryResponse = (response) => {
    if (!response) return null;
    return {
        id: response?.id ?? null,
        name: response?.name || '',
        description: response?.description || '',
        imageUrl: response?.imageUrl || '',
        createdAt: response?.createdAt ? new Date(response.createdAt) : null,
        updatedAt: response?.updatedAt ? new Date(response.updatedAt) : null,
    };
};

export const transformCategoryListResponse = (response) => {
    if (Array.isArray(response)) {
        return response.map((category) => ({
            ...category,
            name: category?.name || '',
            description: category?.description || '',
            createdAt: category?.createdAt ? new Date(category.createdAt) : null,
            updatedAt: category?.updatedAt ? new Date(category.updatedAt) : null,
        }));
    }
    return response || [];
};
