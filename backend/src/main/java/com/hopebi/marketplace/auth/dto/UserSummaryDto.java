package com.hopebi.marketplace.auth.dto;

import com.hopebi.marketplace.user.Role;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserStatus;

public class UserSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private UserStatus accountStatus;
    private String companyName;
    private String sellerSlug;
    private String sellerStatus;

    public UserSummaryDto() {}

    public UserSummaryDto(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.accountStatus = user.getAccountStatus();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public UserStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(UserStatus accountStatus) { this.accountStatus = accountStatus; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getSellerSlug() { return sellerSlug; }
    public void setSellerSlug(String sellerSlug) { this.sellerSlug = sellerSlug; }
    public String getSellerStatus() { return sellerStatus; }
    public void setSellerStatus(String sellerStatus) { this.sellerStatus = sellerStatus; }
}
