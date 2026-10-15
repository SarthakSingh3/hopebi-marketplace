package com.hopebi.marketplace.seller.dto;

import com.hopebi.marketplace.seller.SellerProfile;
import com.hopebi.marketplace.seller.SellerStatus;
import com.hopebi.marketplace.seller.SellerVerificationStatus;

public class SellerPublicDto {
    private Long id;
    private String companyName;
    private String slug;
    private String companyDescription;
    private String city;
    private String state;
    private String manufacturerHeritage;
    private String logoUrl;
    private String bannerUrl;
    private SellerStatus sellerStatus;
    private SellerVerificationStatus verificationStatus;

    public SellerPublicDto() {}

    public SellerPublicDto(SellerProfile profile) {
        this.id = profile.getId();
        this.companyName = profile.getCompanyName();
        this.slug = profile.getSlug();
        this.companyDescription = profile.getCompanyDescription();
        this.city = profile.getCity();
        this.state = profile.getState();
        this.manufacturerHeritage = profile.getManufacturerHeritage();
        this.logoUrl = profile.getLogoUrl();
        this.bannerUrl = profile.getBannerUrl();
        this.sellerStatus = profile.getSellerStatus();
        this.verificationStatus = profile.getVerificationStatus();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public SellerStatus getSellerStatus() { return sellerStatus; }
    public void setSellerStatus(SellerStatus sellerStatus) { this.sellerStatus = sellerStatus; }
    public SellerVerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(SellerVerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
}
