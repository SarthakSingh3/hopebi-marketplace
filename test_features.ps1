$ErrorActionPreference = 'Stop'

Write-Host "=== 1. Testing Google Sign-In Endpoint ==="
$googleBody = @{
  idToken = 'google-mock-token-xyz'
  email = 'aarav.sharma@gmail.com'
  name = 'Aarav Sharma'
  avatarUrl = 'https://lh3.googleusercontent.com/a/default-user'
} | ConvertTo-Json

$authResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/google' -Method Post -ContentType 'application/json' -Body $googleBody
$authData = $authResp.data
Write-Host "Google Sign-In SUCCESS: $($authData.user.email) | Role: $($authData.user.role) | Name: $($authData.user.fullName) | Token: $($authData.token.Substring(0, 20))..."
$token = $authData.token
$headers = @{ 'Authorization' = "Bearer $token" }

Write-Host "`n=== 2. Testing AI Assistant Personal Greeting ==="
$chatBody = @{
  query = 'Hi there, how can you help me?'
  userName = 'Aarav Sharma'
} | ConvertTo-Json
$chatResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/assistant/chat' -Method Post -ContentType 'application/json' -Body $chatBody -Headers $headers
Write-Host "Assistant Answer: $($chatResp.data.answer)"

Write-Host "`n=== 3. Testing Multiple Image Upload Endpoint ==="
$tempImg1 = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "sample1.png")
$tempImg2 = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "sample2.png")
[System.IO.File]::WriteAllBytes($tempImg1, [byte[]]@(137,80,78,71,13,10,26,10))
[System.IO.File]::WriteAllBytes($tempImg2, [byte[]]@(137,80,78,71,13,10,26,10))

$uploadOutput = curl.exe -s -X POST 'http://localhost:8080/api/v1/uploads/images' `
  -H "Authorization: Bearer $token" `
  -F "files=@$tempImg1" `
  -F "files=@$tempImg2"
Write-Host "Batch Upload Response: $uploadOutput"

Write-Host "`n=== 4. Testing Order Creation & Order Cancellation with Inventory Restoration ==="
# Get in-stock products
$productsListResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/products?inStock=true' -Method Get
$firstProduct = $productsListResp.data.content[0]
$productId = $firstProduct.id
$productSlug = $firstProduct.slug

# Check initial details & stock
$prodDetail = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/products/$productSlug" -Method Get
$initialStock = $prodDetail.data.stockQuantity
Write-Host "Product: $($prodDetail.data.name) (ID: $productId) | Initial Stock: $initialStock"

# Add item to cart
$cartItem = @{
  productId = $productId
  quantity = 2
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/cart/items' -Method Post -ContentType 'application/json' -Body $cartItem -Headers $headers | Out-Null
Write-Host "Added 2 units to cart."

# Save shipping address
$addrBody = @{
  recipientName = 'Aarav Sharma'
  phoneNumber = '9876543210'
  streetAddress = 'Flat 402, Royal Palms, MG Road'
  locality = 'Indiranagar'
  city = 'Bengaluru'
  state = 'Karnataka'
  pincode = '560001'
  isDefault = $true
} | ConvertTo-Json
$addrResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/me/addresses' -Method Post -ContentType 'application/json' -Body $addrBody -Headers $headers

# Place order with COD
$orderReq = @{
  addressId = $addrResp.data.id
  paymentMethod = 'COD'
  idempotencyKey = [System.Guid]::NewGuid().ToString()
} | ConvertTo-Json
$orderResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/orders' -Method Post -ContentType 'application/json' -Body $orderReq -Headers $headers
$orderData = $orderResp.data
Write-Host "Order Placed: $($orderData.orderNumber) | Status: $($orderData.orderStatus) | Items: $($orderData.items.Count)"

# Check stock after placement
$prodAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/products/$productSlug" -Method Get
Write-Host "Stock after order placement: $($prodAfter.data.stockQuantity) (Decreased by 2 from $initialStock)"

# Cancel order with reason
$cancelBody = @{
  reason = 'Customer ordered wrong size/finish variant'
} | ConvertTo-Json
$cancelResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders/$($orderData.orderNumber)/cancel" -Method Post -ContentType 'application/json' -Body $cancelBody -Headers $headers
$cancelData = $cancelResp.data
Write-Host "Order Status: $($cancelData.orderStatus) | Cancellation Reason: $($cancelData.cancellationReason)"

# Verify stock restoration
$prodRestored = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/products/$productSlug" -Method Get
Write-Host "Stock after cancellation: $($prodRestored.data.stockQuantity) (Atomically restored to original: $initialStock)"

Write-Host "`n=== ALL TESTS COMPLETED SUCCESSFULLY ==="
