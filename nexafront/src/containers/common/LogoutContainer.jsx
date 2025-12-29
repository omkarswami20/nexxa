import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useLogoutUserMutation } from '../../store/api/api.slice';
import { logout } from '../../store/slices/auth.slice';
import LogoutModal from '../../components/common/LogoutModal';

const LogoutContainer = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [logoutUser, { isLoading }] = useLogoutUserMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Block navigation if not explicitly logging out
    // useBlocker returns a blocker object when the condition is true
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !isLoggingOut && currentLocation.pathname !== nextLocation.pathname
    );

    // Handle blocker state
    useEffect(() => {
        if (blocker.state === 'blocked') {
            setOpen(true);
        }
    }, [blocker.state]);

    // Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isLoggingOut) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isLoggingOut]);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        if (!isLoading) {
            setOpen(false);
            // Reset blocker if it was blocked (Cancel navigation)
            if (blocker.state === 'blocked') {
                blocker.reset();
            }
        }
    };
    // prevents closing the modal while logout in progress

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true); // Allow navigation for logout
        try {
            const response = await logoutUser().unwrap();

            // Optional Chaining use ✔
            if (response?.success) {
                dispatch(logout());
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error("Logout failed:", error);

            // Fallback for session cleanup even if API fails
            dispatch(logout());
            navigate('/', { replace: true });
        } finally {
            setOpen(false);
        }
    };

    /**
     * Instead of overwriting child's onClick,
     * we preserve existing onClick + add logout modal trigger.
     */
    const triggerElement = React.cloneElement(children, {
        onClick: (e) => {
            children?.props?.onClick?.(e);
            handleOpen();
        }
    });

    return (
        <>
            {triggerElement}

            <LogoutModal
                open={open}
                onClose={handleClose}
                onConfirm={handleConfirmLogout}
                isLoading={isLoading}
            />
        </>
    );
};

export default LogoutContainer;
