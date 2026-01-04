package com.nexashop.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;

public class CheckoutRequest {
    
    private Long addressId;
    
    private AddressDto address;

    @AssertTrue(message = "Either addressId or address must be provided")
    public boolean isValid() {
        // If addressId is provided, address can be null or empty
        if (addressId != null) {
            return true;
        }
        // If addressId is not provided, address must be complete
        return address != null && isAddressComplete();
    }

    private boolean isAddressComplete() {
        if (address == null) {
            return false;
        }
        // Check if address object is actually empty (all fields null/empty)
        String name = address.getName();
        String line1 = address.getLine1();
        String city = address.getCity();
        String state = address.getState();
        String zip = address.getZip();
        String country = address.getCountry();
        
        // If all fields are null/empty, consider it incomplete
        boolean allEmpty = (name == null || name.trim().isEmpty())
            && (line1 == null || line1.trim().isEmpty())
            && (city == null || city.trim().isEmpty())
            && (state == null || state.trim().isEmpty())
            && (zip == null || zip.trim().isEmpty())
            && (country == null || country.trim().isEmpty());
        
        if (allEmpty) {
            return false;
        }
        
        // If address is provided, validate all required fields
        return name != null && !name.trim().isEmpty()
            && line1 != null && !line1.trim().isEmpty()
            && city != null && !city.trim().isEmpty()
            && state != null && !state.trim().isEmpty()
            && zip != null && !zip.trim().isEmpty()
            && country != null && !country.trim().isEmpty();
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public AddressDto getAddress() {
        return address;
    }

    public void setAddress(AddressDto address) {
        this.address = address;
    }

    public static class AddressDto {
        private String name;
        private String phone;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String zip;
        private String country;

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getLine1() {
            return line1;
        }

        public void setLine1(String line1) {
            this.line1 = line1;
        }

        public String getLine2() {
            return line2;
        }

        public void setLine2(String line2) {
            this.line2 = line2;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getZip() {
            return zip;
        }

        public void setZip(String zip) {
            this.zip = zip;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }
    }
}

