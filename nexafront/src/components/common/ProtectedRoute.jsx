import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentToken, selectCurrentRole } from '../../store/slices/auth.slice';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = useSelector(selectCurrentToken);
    const role = useSelector(selectCurrentRole);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
