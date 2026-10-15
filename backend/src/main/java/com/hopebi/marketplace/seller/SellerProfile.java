package com.hopebi.marketplace.seller;

import com.hopebi.marketplace.user.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "seller_profiles", indexes = {
    @Index(name = "idx_seller_slug", columnList = "slug", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String companyDescription;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(columnDefinition = "TEXT")
    private String manufacturerHeritage;

    @Column(length = 20)
    private String contactPhone;

    @Column(length = 180)
    private String businessEmail;

    @Column(length = 50)
    private String gstNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SellerStatus sellerStatus = SellerStatus.PENDING_APPROVAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SellerVerificationStatus verificationStatus = SellerVerificationStatus.PENDING;

    private Double commissionRate; // Nullable override, defaults to platform default (e.g. 5%)

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "banner_url")
    private String bannerUrl;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public SellerProfile() {}

    public SellerProfile(User user, String companyName, String slug, String companyDescription,
                         String city, String state, String manufacturerHeritage,
                         String contactPhone, String businessEmail, String gstNumber) {
        this.user = user;
        this.companyName = companyName;
        this.slug = slug;
        this.companyDescription = companyDescription;
        this.city = city;
        this.state = state;
        this.manufacturerHeritage = manufacturerHeritage;
        this.contactPhone = contactPhone;
        this.businessEmail = businessEmail;
        this.gstNumber = gstNumber;
        this.sellerStatus = SellerStatus.PENDING_APPROVAL;
        this.verificationStatus = SellerVerificationStatus.PENDING;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) { this.companyDescription = companyDescription; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getManufacturerHeritage() { return manufacturerHeritage; }
    public void setManufacturerHeritage(String manufacturerHeritage) { this.manufacturerHeritage = manufacturerHeritage; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getBusinessEmail() { return businessEmail; }
    public void setBusinessEmail(String businessEmail) { this.businessEmail = businessEmail; }
    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }
    public SellerStatus getSellerStatus() { return sellerStatus; }
    public void setSellerStatus(SellerStatus sellerStatus) { this.sellerStatus = sellerStatus; }
    public SellerVerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(SellerVerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
