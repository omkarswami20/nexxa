import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const CheckoutView = ({
  items,
  addresses,
  selectedAddressId,
  useNewAddress,
  newAddress,
  onAddressSelectionChange,
  onNewAddressChange,
  onPlaceOrder,
  isLoading,
  isError,
  error,
  validationError,
  totalAmount,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    if (!value || value.trim() === "") {
      setFieldErrors((prev) => ({ ...prev, [name]: "This field is required" }));
      return false;
    }
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return true;
  };

  const handleFieldChange = (name, value) => {
    onNewAddressChange(name, value);
    if (fieldErrors[name]) {
      validateField(name, value);
    }
  };

  const steps = ["Cart", "Shipping", "Review"];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={1} sx={{ mb: 4, mt: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {(isError || validationError) && (
        <MotionBox
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            {validationError ||
              error?.data?.message ||
              error?.data?.error ||
              error?.message ||
              "Checkout failed. Please try again."}
          </Alert>
        </MotionBox>
      )}

      <Grid container spacing={4}>
        {/* Order Items Summary */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Order Items
            </Typography>
            <Divider sx={{ my: 2 }} />
            {items.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShoppingCartIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            ) : (
              items.map((item, index) => {
                const product = item?.product;
                return (
                  <MotionBox
                    key={item?.id ?? `${item?.productId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {product?.imageUrl && (
                        <Box
                          component="img"
                          src={
                            product.imageUrl.startsWith("http")
                              ? product.imageUrl
                              : `http://localhost:8080/uploads/products/${product.imageUrl}`
                          }
                          alt={product?.name || "Product"}
                          sx={{
                            width: 80,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      )}

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="600">
                          {product?.name || `Product #${item?.productId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Quantity: {item?.quantity || 0} × Rs.{" "}
                          {(product?.price || 0).toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="600"
                          color="primary"
                          sx={{ mt: 1 }}
                        >
                          Subtotal: Rs.{" "}
                          {(
                            (product?.price || 0) * (item?.quantity || 0)
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    {items.indexOf(item) < items.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </MotionBox>
                );
              })
            )}
          </Paper>

          {/* Address Selection */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Shipping Address
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={useNewAddress ? "new" : selectedAddressId}
                onChange={(e) => onAddressSelectionChange(e.target.value)}
              >
                {/* Saved Addresses */}
                {addresses.map((addr) => (
                  <FormControlLabel
                    key={addr.id}
                    value={addr.id.toString()}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="500">
                          {addr.name} {addr.isDefault && "(Default)"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {addr.line1}
                          {addr.line2 && `, ${addr.line2}`}
                          <br />
                          {addr.city}, {addr.state} {addr.zip}
                          <br />
                          {addr.country}
                          {addr.phone && ` • ${addr.phone}`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}

                {/* New Address Option */}
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label={
                    <Typography variant="subtitle2" fontWeight="500">
                      Use a new address
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* New Address Form */}
            {useNewAddress && (
              <Box
                sx={{
                  mt: 3,
                  pt: 3,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" gutterBottom fontWeight="500">
                  Enter New Address
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Name"
                      name="name"
                      value={newAddress.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      onBlur={(e) => validateField("name", e.target.value)}
                      error={!!fieldErrors.name}
                      helperText={fieldErrors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone"
                      name="phone"
                      value={newAddress.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Address Line 1"
                      name="line1"
                      value={newAddress.line1}
                      onChange={(e) => handleFieldChange("line1", e.target.value)}
                      onBlur={(e) => validateField("line1", e.target.value)}
                      error={!!fieldErrors.line1}
                      helperText={fieldErrors.line1}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Address Line 2"
                      name="line2"
                      value={newAddress.line2}
                      onChange={(e) => handleFieldChange("line2", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="City"
                      name="city"
                      value={newAddress.city}
                      onChange={(e) => handleFieldChange("city", e.target.value)}
                      onBlur={(e) => validateField("city", e.target.value)}
                      error={!!fieldErrors.city}
                      helperText={fieldErrors.city}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="State"
                      name="state"
                      value={newAddress.state}
                      onChange={(e) => handleFieldChange("state", e.target.value)}
                      onBlur={(e) => validateField("state", e.target.value)}
                      error={!!fieldErrors.state}
                      helperText={fieldErrors.state}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="ZIP Code"
                      name="zip"
                      value={newAddress.zip}
                      onChange={(e) => handleFieldChange("zip", e.target.value)}
                      onBlur={(e) => validateField("zip", e.target.value)}
                      error={!!fieldErrors.zip}
                      helperText={fieldErrors.zip}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Country"
                      name="country"
                      value={newAddress.country}
                      onChange={(e) => handleFieldChange("country", e.target.value)}
                      onBlur={(e) => validateField("country", e.target.value)}
                      error={!!fieldErrors.country}
                      helperText={fieldErrors.country}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
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
              <Typography variant="body1">Items ({items.length})</Typography>
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
            <MotionButton
              variant="contained"
              fullWidth
              size="large"
              onClick={onPlaceOrder}
              disabled={isLoading || items.length === 0}
              sx={{ py: 1.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </MotionButton>
            {items.length === 0 && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Add items to cart to checkout
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutView;
