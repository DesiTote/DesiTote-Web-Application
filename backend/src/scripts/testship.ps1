# ─── scripts/test-shiprocket-webhook.ps1 ──────────────────────────
# PowerShell version — run directly in your PowerShell terminal.
# No signature computation needed for Shiprocket, just the token header.
#
# BEFORE RUNNING — replace these three values:
#   $Token       -> the exact string you put in .env as SHIPROCKET_WEBHOOK_TOKEN
#   $SrOrderId   -> a REAL shiprocket.orderId from an existing order in your
#                   Mongo DB (only exists after a test checkout has gone
#                   through pushToShiprocket successfully — query Mongo:
#                   db.orders.findOne({ "shiprocket.orderId": { $exists: true } })
#   $Awb         -> can be any fake string for testing, doesn't need to be real

$WebhookUrl = "http://localhost:5000/api/webhooks/shiprocket"
$Token      = "2d764be20eb0d898c2d895713ccc1ef05455f1908ed967fdaf0718b404387dd5"
$SrOrderId  = 1494575679   # replace with a real shiprocket.orderId from your DB
$Awb        = "AWB1234567892"

$Headers = @{
    "Content-Type" = "application/json"
    "x-api-key"    = $Token
}

Write-Host "`n--- 1. Pickup scheduled (matches by order_id) ---" -ForegroundColor Cyan
$Body1 = @{
    order_id       = $SrOrderId
    awb            = $Awb
    courier_name   = "Delhivery"
    current_status = "PICKUP SCHEDULED"
    scans          = @()
} | ConvertTo-Json

try {
    $res1 = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Headers $Headers -Body $Body1
    $res1 | ConvertTo-Json
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- 2. Out for delivery (matches by AWB too) ---" -ForegroundColor Cyan
$Body2 = @{
    order_id       = $SrOrderId
    awb            = $Awb
    courier_name   = "Delhivery"
    current_status = "OUT FOR DELIVERY"
    scans          = @(
        @{ date = "2026-07-30T10:00:00Z"; activity = "Shipment picked up"; location = "Pune Hub" },
        @{ date = "2026-07-31T08:00:00Z"; activity = "Out for delivery"; location = "Local facility" }
    )
} | ConvertTo-Json -Depth 5

try {
    $res2 = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Headers $Headers -Body $Body2
    $res2 | ConvertTo-Json
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- 3. Delivered ---" -ForegroundColor Cyan
$Body3 = @{
    order_id       = $SrOrderId
    awb            = $Awb
    courier_name   = "Delhivery"
    current_status = "DELIVERED"
    scans          = @()
} | ConvertTo-Json

try {
    $res3 = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Headers $Headers -Body $Body3
    $res3 | ConvertTo-Json
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- 4. Wrong token (should get 401) ---" -ForegroundColor Cyan
$BadHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key"    = "wrong-token"
}
$Body4 = @{ order_id = $SrOrderId; current_status = "DELIVERED" } | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -Headers $BadHeaders -Body $Body4
} catch {
    Write-Host "Got expected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}