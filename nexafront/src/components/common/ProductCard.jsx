import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MotionCard = motion(Card);
const IMAGE_HEIGHT = 200;

const ProductCard = ({ product, index = 0 }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const imageUrl = product.imageUrl
    ? `http://localhost:8080/uploads/products/${product.imageUrl}`
    : "https://via.placeholder.com/400x300?text=No+Image";

  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={handleClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        cursor: "pointer",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.25s ease",
        "&:hover": {
          boxShadow: 8,
          borderColor: "primary.main",
        },
      }}
    >
      {/* ✅ FIXED IMAGE WRAPPER */}
      <Box
        sx={{
          height: IMAGE_HEIGHT,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
        }}
      >
        {imageLoading && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={IMAGE_HEIGHT}
            sx={{ position: "absolute", inset: 0 }}
          />
        )}

        {!imageError ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.name}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            sx={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain", // 🔥 MOST IMPORTANT FIX
              display: imageLoading ? "none" : "block",
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No Image
          </Typography>
        )}

        <Chip
          label={`Rs. ${product.price?.toFixed(2) || "0.00"}`}
          color="primary"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontWeight: 600,
            boxShadow: 2,
          }}
        />
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </Typography>

        {product.category && (
          <Chip
            label={product.category.name}
            size="small"
            variant="outlined"
            sx={{ mb: 1.5, width: "fit-content" }}
          />
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description || "No description available"}
        </Typography>

        <Box
          sx={{
            mt: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: product.stockQuantity > 0 ? "success.main" : "error.main",
            }}
          >
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : "Out of stock"}
          </Typography>

          <Button
            size="small"
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            disabled={product.stockQuantity === 0}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </MotionCard>
  );
};

export default ProductCard;
