package com.hopebi.marketplace.seller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SellerApplicationRequest {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 150)
    private String companyName;

    @NotBlank(message = "Company description is required")
    private String companyDescription;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    private String manufacturerHeritage;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    @NotBlank(message = "Business email is required")
    @Email(message = "Valid business email required")
    private String businessEmail;

    private String gstNumber;

    // Contact person / user account fields if registering together
    private String contactPersonName;
    private String password;

    public SellerApplicationRequest() {}

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
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
    public String getContactPersonName() { return contactPersonName; }
    public void setContactPersonName(String contactPersonName) { this.contactPersonName = contactPersonName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
