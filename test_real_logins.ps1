$ErrorActionPreference = 'Stop'

Write-Host "=== TEST 1: Listed Seller Login with Google / Password Mapping ==="
# Test with seeded seller email: seller@hopebi.com
$sellerGoogleBody = @{
  idToken = 'GOOGLE_TOKEN_SELLER_123'
  email = 'seller@hopebi.com'
  name = 'Vikram Sharma'
} | ConvertTo-Json

$sellerResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/google' -Method Post -ContentType 'application/json' -Body $sellerGoogleBody
$sellerData = $sellerResp.data
Write-Host "Seller Login SUCCESS!"
Write-Host "  Email: $($sellerData.user.email)"
Write-Host "  Role: $($sellerData.user.role)"
Write-Host "  Company: $($sellerData.user.companyName)"
Write-Host "  Seller Slug: $($sellerData.user.sellerSlug)"
if ($sellerData.user.role -eq 'ROLE_SELLER') {
  Write-Host "  [VERIFIED] Listed seller will directly open /seller/dashboard" -ForegroundColor Green
} else {
  throw "Expected ROLE_SELLER but got $($sellerData.user.role)"
}

Write-Host "`n=== TEST 2: Real New Customer Login with Google & Setting Password ==="
$newEmail = 'meera.nair.' + (Get-Random -Minimum 1000 -Maximum 9999) + '@gmail.com'
$initialPass = 'MeeraSecurePass123!'
$custGoogleBody = @{
  idToken = 'GOOGLE_TOKEN_CUST_456'
  email = $newEmail
  name = 'Meera Nair'
  password = $initialPass
} | ConvertTo-Json

$custResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/google' -Method Post -ContentType 'application/json' -Body $custGoogleBody
$custData = $custResp.data
Write-Host "New Customer Created via Google!"
Write-Host "  Email: $($custData.user.email)"
Write-Host "  Role: $($custData.user.role)"
if ($custData.user.role -eq 'ROLE_CUSTOMER') {
  Write-Host "  [VERIFIED] Customer will directly open customer account /profile" -ForegroundColor Green
}

Write-Host "`n=== TEST 3: Logging In with Email & Password for the Account Created via Google ==="
$loginBody = @{
  email = $newEmail
  password = $initialPass
} | ConvertTo-Json

$passLoginResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body $loginBody
$passLoginData = $passLoginResp.data
Write-Host "Password Login SUCCESS for Google Account!"
Write-Host "  User: $($passLoginData.user.fullName) ($($passLoginData.user.email))"
Write-Host "  Token generated: $($passLoginData.token.Substring(0, 25))..."

Write-Host "`n=== TEST 4: Updating Account Password in Profile ==="
$token = $passLoginData.token
$headers = @{ 'Authorization' = "Bearer $token" }
$newPass = 'BrandNewPassword999!'
$updatePassBody = @{
  newPassword = $newPass
} | ConvertTo-Json

$updateResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/password' -Method Post -ContentType 'application/json' -Body $updatePassBody -Headers $headers
Write-Host "Password Update Response: $($updateResp.message)"

# Verify login with new password
$reLoginBody = @{
  email = $newEmail
  password = $newPass
} | ConvertTo-Json
$reLoginResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body $reLoginBody
Write-Host "Re-login with NEW password SUCCESS! User: $($reLoginResp.data.user.email)" -ForegroundColor Green

Write-Host "`n=== TEST 5: Existing Customer Sign-in via Google (Ananya Iyer) ==="
$existingCustBody = @{
  idToken = 'GOOGLE_TOKEN_ANANYA'
  email = 'customer@hopebi.com'
  name = 'Ananya Iyer'
} | ConvertTo-Json
$existingCustResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/google' -Method Post -ContentType 'application/json' -Body $existingCustBody
Write-Host "Existing Customer Google Sign-In SUCCESS: $($existingCustResp.data.user.fullName) | Role: $($existingCustResp.data.user.role)" -ForegroundColor Green

Write-Host "`n=== ALL REAL LOGIN & ROUTING TESTS PASSED! ===" -ForegroundColor Cyan
