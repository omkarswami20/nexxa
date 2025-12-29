package com.nexashop.backend.repository;

import com.nexashop.backend.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByEmail(String email);
    Optional<Seller> findByMobile(String mobile);

    List<Seller> findByStatus(Seller.SellerStatus status);
}
