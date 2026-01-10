import React, { useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  Zoom,
  Skeleton,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ImageGallery = ({ imageUrl, productName }) => {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleZoomOpen = () => setZoomOpen(true);
  const handleZoomClose = () => setZoomOpen(false);

  const fullImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `http://localhost:8080/uploads/products/${imageUrl}`
    : "https://via.placeholder.com/500x500?text=No+Image";

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <MotionCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            bgcolor: "background.paper",
            height: 500, // Fixed height container
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {imageLoading && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{ position: "absolute", inset: 0 }}
            />
          )}
          <CardMedia
            component="img"
            image={fullImageUrl}
            alt={productName || "Product"}
            onLoad={() => setImageLoading(false)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // Prevent cropping/stretching
              cursor: "pointer",
              transition: "transform 0.3s ease",
              display: imageLoading ? "none" : "block",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            onClick={handleZoomOpen}
          />
          <IconButton
            onClick={handleZoomOpen}
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
              },
            }}
          >
            <ZoomInIcon />
          </IconButton>
        </MotionCard>
      </Box>

      <Dialog
        open={zoomOpen}
        onClose={handleZoomClose}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.9)",
            boxShadow: "none",
            m: 2,
            maxHeight: "calc(100vh - 32px)",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <IconButton
            onClick={handleZoomClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1,
              color: "white",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={fullImageUrl}
            alt={productName || "Product"}
            sx={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
