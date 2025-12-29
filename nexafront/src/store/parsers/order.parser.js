export const transformOrderItem = (item) => {
    if (!item) return null;
    return {
        id: item?.id ?? null,
        orderId: item?.orderId ?? null,
        productId: item?.productId ?? null,
        productNameSnapshot: item?.productNameSnapshot || 'Unknown Product',
        quantity: parseInt(item?.quantity) || 0,
        unitPrice: parseFloat(item?.unitPrice) || 0,
        totalPrice: (parseInt(item?.quantity) || 0) * (parseFloat(item?.unitPrice) || 0),
        status: item?.status || 'PENDING',
    };
};

export const transformOrderResponse = (order) => {
    if (!order) return null;

    // Parse address snapshot if it's a string
    let addressSnapshot = null;
    if (order?.addressSnapshotJson) {
        try {
            addressSnapshot = typeof order.addressSnapshotJson === 'string'
                ? JSON.parse(order.addressSnapshotJson)
                : order.addressSnapshotJson;
        } catch (e) {
            console.error('Failed to parse address snapshot', e);
        }
    }

    return {
        id: order?.id ?? null,
        customerId: order?.customerId ?? null,
        totalAmount: parseFloat(order?.totalAmount) || 0,
        status: order?.status || 'PENDING',
        addressSnapshot,
        createdAt: order?.createdAt ? new Date(order.createdAt) : null,
        updatedAt: order?.updatedAt ? new Date(order.updatedAt) : null,
    };
};

export const transformOrderListResponse = (response) => {
    if (Array.isArray(response)) {
        return response
            .map(transformOrderResponse)
            .filter((o) => o !== null);
    }
    return [];
};

export const transformOrderDetailResponse = (response) => {
    if (!response) return null;
    return {
        order: transformOrderResponse(response?.order),
        items: Array.isArray(response?.items)
            ? response.items.map(transformOrderItem).filter(i => i !== null)
            : []
    };
};
