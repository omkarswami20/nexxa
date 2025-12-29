export const transformAddressResponse = (response) => {
    if (!response) return null;
    return {
        id: response?.id ?? null,
        name: response?.name || '',
        phone: response?.phone || '',
        line1: response?.line1 || '',
        line2: response?.line2 || '',
        city: response?.city || '',
        state: response?.state || '',
        zip: response?.zip || '',
        country: response?.country || '',
        isDefault: !!response?.default,
    };
};

export const transformAddressListResponse = (response) => {
    if (Array.isArray(response)) {
        return response
            .map(transformAddressResponse)
            .filter((addr) => addr !== null);
    }
    return [];
};
