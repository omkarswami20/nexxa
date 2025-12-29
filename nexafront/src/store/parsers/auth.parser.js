export const transformLogoutResponse = (response) => {
    // Parser: Normalize response message
    return {
        success: true,
        message: response?.message || 'Logout successful',
    };
};
