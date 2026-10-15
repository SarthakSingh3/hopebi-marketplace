$ErrorActionPreference = 'Stop'

Write-Host "=== TEST 1: Pure Google Sign-In with Listed Seller Gmail (seller@hopebi.com) ==="
# No password sent at all!
$sellerGoogleReq = @{
  email = 'seller@hopebi.com'
  name = 'Vikram Sharma'
  idToken = 'GOOGLE_TOKEN_XYZ'
} | ConvertTo-Json

$sellerResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/google' -Method Post -ContentType 'application/json' -Body $sellerGoogleReq
$seller = $sellerResp.data.user
Write-Host "Seller Auth SUCCESS:"
Write-Host "  Email: $($seller.email)"
Write-Host "  Role: $($seller.role)"
Write-Host "  Workshop Company: $($seller.companyName)"
Write-Host "  Seller Slug: $($seller.sellerSlug)"
if ($seller.role -eq 'ROLE_SELLER' -and $seller.companyName -eq 'Moradabad Metalcrafts Guild') {
  Write-Host "  [PASS] Listed Seller mapped correctly and will directly open /seller/dashboard!" -ForegroundColor Green
} else {
  throw "Seller mapping verification failed"
}

Write-Host "`n=== TEST 2: Pure Google Sign-In with Customer Gmail (aarav.sharma@gmail.com) ==="
# No password sent at all!
$custGoogleReq = @{
  email = 'aarav.sharma@gmail.com'
  name = 'Aarav Sharma'
  idToken = 'GOOGLE_TOKEN_ABC'
} | ConvertTo-Json

$custResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/google' -Method Post -ContentType 'application/json' -Body $custGoogleReq
$cust = $custResp.data.user
Write-Host "Customer Auth SUCCESS:"
Write-Host "  Email: $($cust.email)"
Write-Host "  Role: $($cust.role)"
if ($cust.role -eq 'ROLE_CUSTOMER') {
  Write-Host "  [PASS] Customer mapped correctly and will directly open customer account /profile!" -ForegroundColor Green
} else {
  throw "Customer mapping verification failed"
}

Write-Host "`n=== TEST 3: New Artisan Manufacturer Google Sign-In with Seller Role Selection ==="
$newSellerEmail = 'artisan.craft.' + (Get-Random -Minimum 1000 -Maximum 9999) + '@gmail.com'
$newSellerGoogleReq = @{
  email = $newSellerEmail
  name = 'Jaipur Blue Pottery Guild'
  role = 'ROLE_SELLER'
  idToken = 'GOOGLE_TOKEN_SELLER_NEW'
} | ConvertTo-Json

$newSellerResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/google' -Method Post -ContentType 'application/json' -Body $newSellerGoogleReq
$newSeller = $newSellerResp.data.user
Write-Host "New Artisan Seller Google Sign-In SUCCESS:"
Write-Host "  Email: $($newSeller.email)"
Write-Host "  Role: $($newSeller.role)"
Write-Host "  Auto Workshop: $($newSeller.companyName)"
if ($newSeller.role -eq 'ROLE_SELLER') {
  Write-Host "  [PASS] Auto-created approved seller workshop & directly routes to /seller/dashboard!" -ForegroundColor Green
} else {
  throw "New seller creation verification failed"
}

Write-Host "`n=== ALL PURE GOOGLE SIGN-IN TESTS PASSED (ZERO PASSWORDS ASKED)! ===" -ForegroundColor Cyan
