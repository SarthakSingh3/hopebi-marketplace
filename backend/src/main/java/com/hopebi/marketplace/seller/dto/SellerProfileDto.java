package com.hopebi.marketplace.seller.dto;

import com.hopebi.marketplace.seller.SellerProfile;
import com.hopebi.marketplace.seller.SellerStatus;
import com.hopebi.marketplace.seller.SellerVerificationStatus;

import java.time.LocalDateTime;

public class SellerProfileDto {
    private Long id;
    private Long userId;
    private String companyName;
    private String slug;
    private String companyDescription;
    private String city;
    private String state;
    private String manufacturerHeritage;
    private String contactPhone;
    private String businessEmail;
    private String gstNumber;
    private SellerStatus sellerStatus;
    private SellerVerificationStatus verificationStatus;
    private Double commissionRate;
    private String logoUrl;
    private String bannerUrl;
    private LocalDateTime createdAt;

    public SellerProfileDto() {}

    public SellerProfileDto(SellerProfile profile) {
        this.id = profile.getId();
        if (profile.getUser() != null) {
            this.userId = profile.getUser().getId();
        }
        this.companyName = profile.getCompanyName();
        this.slug = profile.getSlug();
        this.companyDescription = profile.getCompanyDescription();
        this.city = profile.getCity();
        this.state = profile.getState();
        this.manufacturerHeritage = profile.getManufacturerHeritage();
        this.contactPhone = profile.getContactPhone();
        this.businessEmail = profile.getBusinessEmail();
        this.gstNumber = profile.getGstNumber();
        this.sellerStatus = profile.getSellerStatus();
        this.verificationStatus = profile.getVerificationStatus();
        this.commissionRate = profile.getCommissionRate();
        this.logoUrl = profile.getLogoUrl();
        this.bannerUrl = profile.getBannerUrl();
        this.createdAt = profile.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
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
}
