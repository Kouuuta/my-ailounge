# Google Chat Webhook Test Script

$webhook = "<GOOGLE_CHAT_WEBHOOK_URL>"

$today = Get-Date -Format "MMMM dd, yyyy"

$message = @"
Tech Updates | $today

Updates:
- Google Chat Incoming Webhook created
- Automated message posting tested successfully
- Multi-line message formatting verified

Focus:
- Research scheduling options for daily automation
- Explore progress reporting automation

Blockers:
- None
"@

$body = @{
    text = $message
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri $webhook `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host "Message sent successfully."
Write-Host $response.name