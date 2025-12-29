import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Fade
} from "@mui/material";

const LogoutModal = ({ open, onClose, onConfirm, isLoading }) => {
    return (
        <Dialog
            open={open}
            onClose={!isLoading ? onClose : null}  // Stop closing modal while logging out
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
            fullWidth
            maxWidth="xs"
            TransitionComponent={Fade}
        >
            <DialogTitle
                id="logout-dialog-title"
                sx={{ fontWeight: 600, textAlign: "center" }}
            >
                Confirm Logout
            </DialogTitle>

            <DialogContent sx={{ textAlign: "center", pb: 1 }}>
                <DialogContentText id="logout-dialog-description" sx={{ fontSize: 15 }}>
                    Are you sure you want to log out?
                    <br />You will be redirected to the login page.
                </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    disabled={isLoading}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={isLoading}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        minWidth: 110,
                        fontWeight: 600
                    }}
                >
                    {isLoading ? (
                        <CircularProgress size={22} />
                    ) : "Logout"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LogoutModal;
