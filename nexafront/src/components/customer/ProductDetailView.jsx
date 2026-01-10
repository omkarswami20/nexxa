import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Alert,
  Chip,
  Divider,
  Breadcrumbs,
  Paper,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ImageGallery from "../common/ImageGallery";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const ProductDetailView = ({
  product,
  isLoading,
  error,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
  addToCartError,
}) => {
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton
              variant="rectangular"
              height={500}
              sx={{ borderRadius: 3 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="90%" height={24} sx={{ mb: 3 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={48}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {error?.data?.message || "Product not found"}
        </Alert>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const isOutOfStock = (product?.stockQuantity || 0) === 0;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 200px)",
        py: 4,
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            sx={{ textTransform: "none" }}
          >
            Home
          </Button>
          {product?.category && (
            <Chip
              label={product.category.name}
              size="small"
              component={Link}
              to={`/?category=${product.category.name}`}
              clickable
            />
          )}
          <Typography color="text.secondary">{product?.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ImageGallery
                imageUrl={product?.imageUrl}
                productName={product?.name}
              />
            </MotionBox>
          </Grid>

          {/* Product Details - Sticky Wrapper */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
              <MotionBox
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    maxHeight: { md: "calc(100vh - 48px)" },
                    overflowY: { md: "auto" },
                  }}
                >
                  {/* Content remains mostly same, just ensuring wrapper handles scroll */}
                  {product?.category && (
                    <Chip
                      label={product.category.name}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="700"
                    gutterBottom
                  >
                    {product?.name || "Unknown Product"}
                  </Typography>

                  <Typography
                    variant="h4"
                    color="primary"
                    fontWeight="700"
                    sx={{ mb: 3 }}
                  >
                    Rs. {product?.price?.toFixed(2) || "0.00"}
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.8 }}
                  >
                    {product?.description || "No description available"}
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: isOutOfStock ? "error.light" : "success.light",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <InventoryIcon
                      sx={{
                        color: isOutOfStock ? "error.main" : "success.main",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Stock Status
                      </Typography>
                      <Typography
                        variant="body1"
                        color={isOutOfStock ? "error.main" : "success.main"}
                        fontWeight="600"
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : `${product?.stockQuantity || 0} items available`}
                      </Typography>
                    </Box>
                  </Paper>

                  {addToCartError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {addToCartError}
                    </Alert>
                  )}

                  {!isOutOfStock && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ mb: 1.5 }}
                      >
                        Quantity:
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <IconButton
                          onClick={() => onQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          size="small"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography
                          variant="h6"
                          sx={{
                            minWidth: 50,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {quantity}
                        </Typography>
                        <IconButton
                          onClick={() => onQuantityChange(quantity + 1)}
                          disabled={quantity >= (product?.stockQuantity || 0)}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                      </Paper>
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: "sticky",
                      bottom: 0,
                      bgcolor: "background.paper",
                      pt: 2,
                      zIndex: 1,
                    }}
                  >
                    <MotionButton
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCartIcon />}
                      onClick={onAddToCart}
                      disabled={isOutOfStock || isAddingToCart}
                      fullWidth
                      sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: 600 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isAddingToCart
                        ? "Adding to Cart..."
                        : isOutOfStock
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </MotionButton>
                  </Box>
                </Paper>
              </MotionBox>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductDetailView;
