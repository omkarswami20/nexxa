export const transformProductResponse = (response) => {
    // Parse and normalize product data
    if (response) {
        return {
            ...response,
            name: response?.name || 'Unknown Product',
            description: response?.description || '',
            imageUrl: response?.imageUrl || '',
            price: parseFloat(response?.price) || 0,
            stockQuantity: parseInt(response?.stockQuantity) || 0,
            createdAt: response?.createdAt ? new Date(response.createdAt) : null,
            updatedAt: response?.updatedAt ? new Date(response.updatedAt) : null,
        };
    }
    return response;
};

export const transformProductListResponse = (response) => {
    // Parse and normalize product data
    if (Array.isArray(response)) {
        return response.map((product) => ({
            ...product,
            name: product?.name || 'Unknown Product',
            imageUrl: product?.imageUrl || '',
            price: parseFloat(product?.price) || 0,
            stockQuantity: parseInt(product?.stockQuantity) || 0,
            createdAt: product?.createdAt ? new Date(product.createdAt) : null,
            updatedAt: product?.updatedAt ? new Date(product.updatedAt) : null,
        }));
    }
    return response;
};

export const transformPaginatedProductResponse = (response) => {
    // Handle paginated response structure
    if (response && response?.products && Array.isArray(response.products)) {
        return {
            products: response.products.map((product) => ({
                ...product,
                name: product?.name || 'Unknown Product',
                imageUrl: product?.imageUrl || '',
                description: product?.description || '',
                price: parseFloat(product?.price) || 0,
                stockQuantity: parseInt(product?.stockQuantity) || 0,
                createdAt: product?.createdAt ? new Date(product.createdAt) : null,
                updatedAt: product?.updatedAt ? new Date(product.updatedAt) : null,
            })),
            total: response?.total || 0,
            page: response?.page || 1,
            pageSize: response?.pageSize || 5,
        };
    }
    // Fallback for non-paginated response (backward compatibility)
    if (Array.isArray(response)) {
        return {
            products: response.map((product) => ({
                ...product,
                name: product?.name || 'Unknown Product',
                imageUrl: product?.imageUrl || '',
                description: product?.description || '',
                price: parseFloat(product?.price) || 0,
                stockQuantity: parseInt(product?.stockQuantity) || 0,
                createdAt: product?.createdAt ? new Date(product.createdAt) : null,
                updatedAt: product?.updatedAt ? new Date(product.updatedAt) : null,
            })),
            total: response.length,
            page: 1,
            pageSize: response.length,
        };
    }
    return { products: [], total: 0, page: 1, pageSize: 5 };
};
