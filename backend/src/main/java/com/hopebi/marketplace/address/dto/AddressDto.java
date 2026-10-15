package com.hopebi.marketplace.address.dto;

import com.hopebi.marketplace.address.Address;

public class AddressDto {
    private Long id;
    private String recipientName;
    private String phoneNumber;
    private String streetAddress;
    private String locality;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private String addressType;
    private boolean isDefault;

    public AddressDto() {}

    public AddressDto(Address address) {
        this.id = address.getId();
        this.recipientName = address.getRecipientName();
        this.phoneNumber = address.getPhoneNumber();
        this.streetAddress = address.getStreetAddress();
        this.locality = address.getLocality();
        this.city = address.getCity();
        this.state = address.getState();
        this.pincode = address.getPincode();
        this.landmark = address.getLandmark();
        this.addressType = address.getAddressType();
        this.isDefault = address.isDefault();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }
    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}
