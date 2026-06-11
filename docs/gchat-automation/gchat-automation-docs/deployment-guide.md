# Deployment Guide

## Overview

This guide documents the deployment process for the Google Chat Tech Updates Automation system.

---

## Prerequisites

### Google Workspace Access

Required permissions:

* Google Chat access
* Google Apps Script access
* Google Cloud Console access

---

## Step 1: Create Google Chat Webhook

1. Open Google Chat.
2. Open target space.
3. Space Settings.
4. Apps & Integrations.
5. Manage Webhooks.
6. Create Webhook.
7. Copy generated webhook URL.

Store as:

WEBHOOK_URL

---

## Step 2: Create Google Apps Script Project

1. Open Google Apps Script.
2. Create new project.
3. Enable V8 runtime.
4. Configure timezone.

Recommended timezone:

Asia/Singapore

---

## Step 3: Enable Google Chat API

1. Open Apps Script.
2. Services.
3. Add Service.
4. Add Google Chat API.

Verify:

Chat v1

---

## Step 4: Configure OAuth Scopes

Required:

* chat.messages
* chat.messages.readonly

Authorize project when prompted.

---

## Step 5: Configure Script Constants

Update:

SPACE_ID

WEBHOOK_URL

Example:

const SPACE_ID = "...";

const WEBHOOK_URL = "...";

---

## Step 6: Configure Triggers

### Daily Thread Creation

Function:

sendTechUpdates

Schedule:

08:00 AM - 09:00 AM

---

### Daily Summary

Function:

postDailySummary

Schedule:

08:00 PM - 09:00 PM

---

## Step 7: Validation

Run:

testLatestThread()

Expected:

Latest Tech Updates thread detected.

---

Run:

testGenerateSummary()

Expected:

Valid summary generated.

---

Run:

postDailySummary()

Expected:

Summary posted successfully.

---

## Production Rollout

Current Environment:

AI Arena

Target Production Environment:

Tech Dumps

Deployment Steps:

1. Update SPACE_ID.
2. Update WEBHOOK_URL.
3. Verify permissions.
4. Run validation tests.
5. Enable triggers.

---

## Rollback Procedure

If issues occur:

1. Disable triggers.
2. Restore previous configuration.
3. Re-enable after fixes.

---

## Maintenance

Periodic checks:

* Trigger execution logs
* Chat API permissions
* Webhook validity
* Summary accuracy

Recommended review frequency:

Weekly
