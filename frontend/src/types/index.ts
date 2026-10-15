export type Role = 'ROLE_CUSTOMER' | 'ROLE_SELLER' | 'ROLE_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  role: Role;
  accountStatus: UserStatus;
  companyName?: string;
  sellerSlug?: string;
  sellerStatus?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserSummary;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  parentCategoryId?: number;
}

export type SellerStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type SellerVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export interface SellerPublic {
  id: number;
  companyName: string;
  slug: string;
  companyDescription?: string;
  city?: string;
  state?: string;
  manufacturerHeritage?: string;
  logoUrl?: string;
  bannerUrl?: string;
  sellerStatus: SellerStatus;
  verificationStatus: SellerVerificationStatus;
}

export interface SellerProfile extends SellerPublic {
  userId?: number;
  contactPhone?: string;
  businessEmail?: string;
  gstNumber?: string;
  commissionRate?: number;
  createdAt: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  regularPrice: number;
  salePrice?: number;
  effectivePrice: number;
  discountPercentage?: number;
  currency: string;
  stockQuantity: number;
  inStock: boolean;
  primaryImageUrl?: string;
  sellerName?: string;
  sellerSlug?: string;
  sellerCity?: string;
  sellerState?: string;
  categoryName?: string;
  categorySlug?: string;
  originCityState?: string;
  verifiedClaims?: string;
}

export interface ProductDetail extends Product {
  fullDescription: string;
  materials?: string;
  dimensions?: string;
  weightGrams?: number;
  returnPolicy?: string;
  images: ProductImage[];
  seller?: SellerPublic;
  createdAt: string;
}

export interface Address {
  id: number;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: string;
  default: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  sku: string;
  primaryImageUrl?: string;
  unitPrice: number;
  regularPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
  inStock: boolean;
  sellerName?: string;
  sellerSlug?: string;
}

export interface Cart {
  id?: number;
  items: CartItem[];
  totalItemCount: number;
  subtotal: number;
  savings: number;
  estimatedShipping: number;
  estimatedTotal: number;
  currency: string;
  hasUnavailableItems: boolean;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';
export type PaymentStatus = 'PENDING' | 'INITIATED' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'COD' | 'TEST_SIMULATOR';
export type FulfilmentStatus = 'UNASSIGNED' | 'ACCEPTED' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId?: number;
  productName: string;
  productSlug?: string;
  productImageUrl?: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  sellerId?: number;
  sellerName?: string;
  sellerSlug?: string;
  fulfilmentStatus: FulfilmentStatus;
  carrier?: string;
  trackingNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  appliedCouponCode?: string;
  shippingAddressSnapshot: string;
  cancellationReason?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  productId?: number;
  reviewerName?: string;
  rating: number;
  title?: string;
  comment: string;
  imageUrl?: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface GoogleAuthRequest {
  email: string;
  name?: string;
  photoUrl?: string;
  idToken?: string;
  password?: string;
  role?: Role;
}

export interface OtpResponse {
  phone: string;
  message: string;
  otp?: string;
  isExistingUser: boolean;
}

export interface OtpSendRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  otp: string;
  name?: string;
  role?: Role;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PromotionResult {
  valid: boolean;
  code: string;
  message: string;
  discountAmount: number;
  newTotal: number;
}
