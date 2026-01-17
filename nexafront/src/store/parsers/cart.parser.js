import { transformProductResponse } from './product.parser';

export const transformCartItem = (item) => {
    if (!item) return null;
    return {
        id: item?.id ?? null,
        productId: item?.productId ?? null,
        quantity: parseInt(item?.quantity || 0) || 0,
        // Safely parse nested product
        product: transformProductResponse(item?.product),
        createdAt: item?.createdAt ? new Date(item.createdAt) : null,
        updatedAt: item?.updatedAt ? new Date(item.updatedAt) : null,
    };
};

export const transformCartResponse = (response) => {
    // API returns list of CartItems
    if (Array.isArray(response)) {
        return response
            .map(transformCartItem)
            .filter((item) => item !== null);
    }
    return [];
};
