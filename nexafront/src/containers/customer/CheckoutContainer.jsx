import React, { useState, useEffect } from "react";
import {
  useGetCartQuery,
  useCheckoutMutation,
  useGetAddressesQuery,
  useGetZipCodeInfoQuery,
} from "../../store/api/api.apislice";
import CheckoutView from "../../components/customer/CheckoutView";
import { useNavigate } from "react-router-dom";

const CheckoutContainer = () => {
  const { data: items = [] } = useGetCartQuery();
  const { data: addresses = [] } = useGetAddressesQuery();
  const [checkout, { isLoading, isError, error }] = useCheckoutMutation();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [validationError, setValidationError] = useState(null);

  // Auto-select new address if no saved addresses are available
  useEffect(() => {
    if (addresses.length === 0) {
      setUseNewAddress(true);
    } else if (addresses.length > 0 && !selectedAddressId && !useNewAddress) {
      // Optional: Select first address by default
      // setSelectedAddressId(addresses[0].id.toString());
    }
  }, [addresses]);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [zipCodeLookup, setZipCodeLookup] = useState({ zip: '', country: '' });

  const { data: zipCodeData, isLoading: zipCodeLoading } = useGetZipCodeInfoQuery(
    { zip: zipCodeLookup.zip, country: zipCodeLookup.country },
    { skip: !zipCodeLookup.zip || zipCodeLookup.zip.length < 5 }
  );

  useEffect(() => {
    if (zipCodeData && zipCodeLookup.zip) {
      setNewAddress(prev => ({
        ...prev,
        city: zipCodeData.city || prev.city,
        state: zipCodeData.state || prev.state,
        country: zipCodeData.country || prev.country,
      }));
    }
  }, [zipCodeData, zipCodeLookup.zip]);

  const handleZipCodeBlur = (zip) => {
    if (zip && zip.trim().length >= 5) {
      setZipCodeLookup({ zip: zip.trim(), country: newAddress.country || 'IN' });
    }
  };

  const handleAddressSelectionChange = (value) => {
    setValidationError(null);
    if (value === "new") {
      setUseNewAddress(true);
      setSelectedAddressId("");
    } else {
      setUseNewAddress(false);
      setSelectedAddressId(value);
    }
  };

  const handleNewAddressChange = (field, value) => {
    setValidationError(null);
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    setValidationError(null);

    // Validation
    if (!useNewAddress && !selectedAddressId) {
      setValidationError("Please select a shipping address.");
      return;
    }

    if (useNewAddress) {
      const { name, line1, city, state, zip, country } = newAddress || {};
      if (
        !name?.trim() ||
        !line1?.trim() ||
        !city?.trim() ||
        !state?.trim() ||
        !zip?.trim() ||
        !country?.trim()
      ) {
        setValidationError("Please fill in all required address fields.");
        return;
      }
    }

    try {
      const payload = useNewAddress
        ? { 
            address: {
              name: newAddress?.name?.trim() || "",
              phone: newAddress?.phone?.trim() || "",
              line1: newAddress?.line1?.trim() || "",
              line2: newAddress?.line2?.trim() || "",
              city: newAddress?.city?.trim() || "",
              state: newAddress?.state?.trim() || "",
              zip: newAddress?.zip?.trim() || "",
              country: newAddress?.country?.trim() || "",
            }
          }
        : { 
            addressId: selectedAddressId ? parseInt(selectedAddressId, 10) : null 
          };

      const res = await checkout(payload).unwrap();
      if (res?.id) {
        navigate(`/orders/${res.id}`);
      } else {
        setValidationError("Order created but invalid response received.");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      const errorMessage = err?.data?.message || 
                          err?.data?.error || 
                          err?.message || 
                          "Checkout failed. Please try again.";
      setValidationError(errorMessage);
    }
  };

  const totalAmount = (items || []).reduce((sum, item) => {
    const product = item?.product;
    if (product?.price) {
      return sum + parseFloat(product.price) * (item?.quantity || 0);
    }
    return sum;
  }, 0);

  return (
    <CheckoutView
      items={items}
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      useNewAddress={useNewAddress}
      newAddress={newAddress}
      onAddressSelectionChange={handleAddressSelectionChange}
      onNewAddressChange={handleNewAddressChange}
      onPlaceOrder={handlePlaceOrder}
      isLoading={isLoading}
      isError={isError}
      error={error}
      validationError={validationError}
      totalAmount={totalAmount}
      zipCodeLoading={zipCodeLoading}
      onZipCodeBlur={handleZipCodeBlur}
    />
  );
};

export default CheckoutContainer;
