package com.nexashop.backend.controller;

import com.nexashop.backend.entity.Customer;
import com.nexashop.backend.entity.CustomerAddress;
import com.nexashop.backend.repository.CustomerAddressRepository;
import com.nexashop.backend.repository.CustomerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Customer Addresses")
@RequestMapping("/api/v1/customers/addresses")
public class CustomerAddressController {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;

    public CustomerAddressController(CustomerRepository customerRepository, CustomerAddressRepository addressRepository) {
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
    }

    private Long currentCustomerId(Principal principal) {
        Customer c = customerRepository.findByEmail(principal.getName()).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        return c.getId();
    }

    @Operation(summary = "List addresses", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    public ResponseEntity<List<CustomerAddress>> list(Principal principal) {
        return ResponseEntity.ok(addressRepository.findByCustomerId(currentCustomerId(principal)));
    }

    @Operation(summary = "Create address", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<CustomerAddress> create(Principal principal, @RequestBody CustomerAddress body) {
        body.setCustomerId(currentCustomerId(principal));
        return ResponseEntity.ok(addressRepository.save(body));
    }

    @Operation(summary = "Update address", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<CustomerAddress> update(Principal principal, @PathVariable Long id, @RequestBody CustomerAddress body) {
        Long customerId = currentCustomerId(principal);
        CustomerAddress addr = addressRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!addr.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).build();
        }
        addr.setName(body.getName());
        addr.setPhone(body.getPhone());
        addr.setLine1(body.getLine1());
        addr.setLine2(body.getLine2());
        addr.setCity(body.getCity());
        addr.setState(body.getState());
        addr.setZip(body.getZip());
        addr.setCountry(body.getCountry());
        addr.setDefault(body.isDefault());
        return ResponseEntity.ok(addressRepository.save(addr));
    }

    @Operation(summary = "Delete address", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Principal principal, @PathVariable Long id) {
        Long customerId = currentCustomerId(principal);
        CustomerAddress addr = addressRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!addr.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).build();
        }
        addressRepository.delete(addr);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
