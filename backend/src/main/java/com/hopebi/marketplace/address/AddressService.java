package com.hopebi.marketplace.address;

import com.hopebi.marketplace.address.dto.AddressDto;
import com.hopebi.marketplace.address.dto.AddressRequest;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressDto> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(AddressDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Address getAddressEntityByIdAndUser(Long addressId, Long userId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or does not belong to you: " + addressId));
    }

    @Transactional
    public AddressDto createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.isDefault()) {
            clearPreviousDefaults(userId);
        }

        Address address = new Address(
                user,
                request.getRecipientName(),
                request.getPhoneNumber(),
                request.getStreetAddress(),
                request.getLocality(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                request.getLandmark(),
                request.getAddressType(),
                request.isDefault()
        );

        return new AddressDto(addressRepository.save(address));
    }

    @Transactional
    public AddressDto updateAddress(Long addressId, Long userId, AddressRequest request) {
        Address address = getAddressEntityByIdAndUser(addressId, userId);

        if (request.isDefault() && !address.isDefault()) {
            clearPreviousDefaults(userId);
        }

        address.setRecipientName(request.getRecipientName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreetAddress(request.getStreetAddress());
        address.setLocality(request.getLocality());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLandmark(request.getLandmark());
        address.setAddressType(request.getAddressType());
        address.setDefault(request.isDefault());

        return new AddressDto(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = getAddressEntityByIdAndUser(addressId, userId);
        addressRepository.delete(address);
    }

    private void clearPreviousDefaults(Long userId) {
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}
