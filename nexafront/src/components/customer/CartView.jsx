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
                      <Skeleton variant="rectangular" width="100%" height={40} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="100%" height={24} sx={{ mt: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 2 }} />
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
                    sx={{ mb: 2 }}
                  >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Product Image */}
                      <Grid item xs={12} sm={3}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={
                            product?.imageUrl
                              ? product.imageUrl.startsWith("http")
                                ? product.imageUrl
                                : `http://localhost:8080/uploads/products/${product.imageUrl}`
                              : "Image"
                          }
                          alt={product?.name || "Product"}
                          sx={{ objectFit: "cover", borderRadius: 1 }}
                        />
                      </Grid>

                      {/* Product Details */}
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="h6"
                          component={Link}
                          to={`/products/${item?.productId}`}
                          sx={{
                            textDecoration: "none",
                            color: "inherit",
                            "&:hover": { color: "primary.main" },
                          }}
                        >
                          {product?.name || `Product #${item?.productId}`}
                        </Typography>
                        {product?.category && (
                          <Typography variant="caption" color="text.secondary">
                            {product.category.name}
                          </Typography>
                        )}
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          Rs. {(product?.price || 0).toFixed(2)}
                        </Typography>
                        {product &&
                          (product.stockQuantity || 0) <
                            (item.quantity || 0) && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              Only {product.stockQuantity} available in stock
                            </Alert>
                          )}
                      </Grid>

                      {/* Quantity Controls */}
                      <Grid item xs={12} sm={3}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexDirection: { xs: "row", sm: "column" },
                            gap: 1,
                          }}
                        >
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
                              sx={{
                                transition: "all 0.2s ease",
                                "&:hover": { transform: "scale(1.1)" },
                              }}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography
                              variant="body1"
                              sx={{ minWidth: 30, textAlign: "center", fontWeight: 600 }}
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
                              sx={{
                                transition: "all 0.2s ease",
                                "&:hover": { transform: "scale(1.1)" },
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Paper>
                          <IconButton
                            color="error"
                            onClick={() => onRemove(item.productId)}
                            size="small"
                            sx={{
                              transition: "all 0.2s ease",
                              "&:hover": { transform: "scale(1.1)" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, textAlign: "center", fontWeight: 600 }}
                        >
                          Subtotal: Rs.{" "}
                          {(
                            (product?.price || 0) * (item.quantity || 0)
                          ).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
