import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Alert,
  Paper,
  Skeleton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const CartView = ({
  items,
  isLoading,
  totalQty,
  totalAmount,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}) => {
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {[...Array(3)].map((_, i) => (
              <Card key={i} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Skeleton variant="rectangular" height={120} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Skeleton variant="text" width="80%" height={32} />
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={24} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={40}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton
                variant="text"
                width="100%"
                height={24}
                sx={{ mt: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={48}
                sx={{ mt: 2 }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
        Shopping Cart
      </Typography>

      {items.length === 0 ? (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ textAlign: "center", py: 8 }}
        >
          <ShoppingCartIcon
            sx={{ fontSize: 80, color: "text.secondary", mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start shopping to add items to your cart
          </Typography>
          <Button component={Link} to="/" variant="contained" size="large">
            Continue Shopping
          </Button>
        </MotionBox>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <AnimatePresence>
              {items.map((item, index) => {
                const product = item?.product;
                return (
                  <MotionCard
                    key={item?.id ?? `cart-item-${item.productId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    sx={{ mb: 2, overflow: "visible" }} // Allow overlaps if needed, though we fit content
                  >
                    <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: { xs: "flex-start", sm: "center" },
                          gap: 3,
                        }}
                      >
                        {/* Product Image */}
                        <Box
                          sx={{
                            width: { xs: "100%", sm: 120 },
                            height: 120,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "background.default",
                            borderRadius: 1,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={
                              product?.imageUrl
                                ? product.imageUrl.startsWith("http")
                                  ? product.imageUrl
                                  : `http://localhost:8080/uploads/products/${product.imageUrl}`
                                : "Image"
                            }
                            alt={product?.name || "Product"}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>

                        {/* Product Details */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            component={Link}
                            to={`/products/${item?.productId}`}
                            sx={{
                              textDecoration: "none",
                              color: "inherit",
                              fontWeight: 600,
                              display: "block",
                              "&:hover": { color: "primary.main" },
                            }}
                          >
                            {product?.name || `Product #${item?.productId}`}
                          </Typography>

                          {product?.category && (
                            <Chip
                              label={product.category.name}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1, height: 24 }}
                            />
                          )}

                          {product &&
                            (product.stockQuantity || 0) <
                              (item.quantity || 0) && (
                              <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                                Only {product.stockQuantity} available
                              </Alert>
                            )}
                        </Box>

                        {/* Controls & Price - Stacked on Mobile, Row on Desktop */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: {
                              xs: "row",
                              sm: "column",
                              md: "row",
                            },
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: { xs: "100%", sm: "auto" },
                            gap: { xs: 2, sm: 2, md: 4 },
                            mt: { xs: 2, sm: 0 },
                          }}
                        >
                          {/* Quantity */}
                          <Paper
                            elevation={0}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 0.5,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                onDecrease(item.productId, item.quantity)
                              }
                              disabled={(item.quantity || 0) <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ minWidth: 24, textAlign: "center" }}
                            >
                              {item.quantity || 0}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                onIncrease(item.productId, item.quantity)
                              }
                              disabled={
                                product &&
                                (item.quantity || 0) >=
                                  (product.stockQuantity || 0)
                              }
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Paper>

                          {/* Price */}
                          <Box sx={{ textAlign: "right", minWidth: 80 }}>
                            <Typography
                              variant="h6"
                              color="primary"
                              fontWeight={700}
                            >
                              Rs.{" "}
                              {(
                                (product?.price || 0) * (item.quantity || 0)
                              ).toFixed(2)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {item.quantity} x Rs.{" "}
                              {(product?.price || 0).toFixed(0)}
                            </Typography>
                          </Box>

                          {/* Remove */}
                          <IconButton
                            color="error"
                            onClick={() => onRemove(item.productId)}
                            size="small"
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              ml: { xs: 0, md: 1 },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </MotionCard>
                );
              })}
            </AnimatePresence>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1">Items ({totalQty})</Typography>
                <Typography variant="body1">
                  Rs. {totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="h6" fontWeight="600">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="600" color="primary">
                  Rs. {totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={onCheckout}
                  sx={{ py: 1.5 }}
                >
                  Proceed to Checkout
                </Button>
              </motion.div>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartView;
