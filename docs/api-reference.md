# API Reference

> Complete reference for all OpenPassword REST API endpoints.

All endpoints are located under `/api/`. Authentication is required for every endpoint except `/api/auth/login` and `/api/auth/setup`. Authentication is enforced by the `auth_token` cookie set during login.

---

## Authentication

OpenPassword supports two authentication methods for its API:

1.  **Session Cookie (`auth_token`):** Used primarily by the web dashboard. The cookie is automatically handled by the browser.
2.  **API Key (Bearer Token):** Used by third-party integrations, browser extensions, and scripts. Include the key in the `Authorization` header.

```bash
Authorization: Bearer op_your_api_key_here
```

API Keys can be generated and managed in the **Settings > API Keys** section of the dashboard.

---

### `POST /api/auth/login`

Authenticates a user and establishes a browser session (sets a cookie). This endpoint is primarily for the web UI.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "masterpassword"
}
```

**Response `200`:**
```json
{
  "success": true
}
```

---

### `GET /api/apikeys`

Lists all API keys for the current user. Only metadata is returned; the actual key is never shown after creation.

### `POST /api/apikeys`

Generates a new API Key. **The raw key is returned only once in the response.**

**Request body:**
```json
{
  "name": "Chrome Extension",
  "scopes": "read,write",
  "expiresInDays": 30
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "clxxx...",
    "name": "Chrome Extension",
    "prefix": "op_ABC123",
    "key": "op_ABC123...full_secret_here",
    "expiresAt": "2026-05-29T00:00:00.000Z"
  }
}
```

---

### `POST /api/auth/setup`

Creates a new user account. Can only be called once if no users exist (or with appropriate setup permissions).

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "masterpassword"
}
```

**Response `201`:**
```json
{
  "data": {
    "email": "user@example.com",
    "secretKey": "A3-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX"
  }
}
```

---

## Items

### `GET /api/items`

Returns all password items belonging to the authenticated user.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "title": "Google",
      "username": "user@gmail.com",
      "password": "••••••••",
      "url": "https://google.com",
      "otpSecret": null,
      "passkey": null,
      "notes": null,
      "category": "login",
      "vaultId": "clxxx...",
      "customFields": "[]",
      "isArchived": false,
      "isFavorite": false,
      "tags": [],
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/items`

Creates a new password item.

**Request body:**
```json
{
  "title": "GitHub",
  "username": "myuser",
  "password": "supersecret",
  "url": "https://github.com",
  "vaultId": "clxxx...",
  "category": "login",
  "notes": "Work account",
  "otpSecret": "JBSWY3DPEHPK3PXP",
  "customFields": "[]",
  "tags": ["work", "dev"]
}
```

**Response `201`:**
```json
{
  "data": { ...item }
}
```

---

### `GET /api/items/[id]`

Returns a single item by ID.

---

### `PUT /api/items/[id]`

Updates an existing item. Send only the fields you want to change.

**Request body (examples):**
```json
{ "isFavorite": true }
{ "isArchived": true }
{ "vaultId": "newVaultId" }
{ "title": "Updated Title", "password": "newpassword" }
```

---

### `DELETE /api/items/[id]`

Permanently deletes an item.

**Response `200`:**
```json
{ "success": true }
```

---

## Vaults

### `GET /api/vaults`

Returns all vaults with item counts.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "name": "Personal",
      "icon": "FolderLock",
      "safeForTravel": false,
      "_count": { "items": 12 }
    }
  ]
}
```

---

### `POST /api/vaults`

Creates a new vault.

**Request body:**
```json
{
  "name": "Work",
  "icon": "FolderLock",
  "safeForTravel": false
}
```

---

### `PUT /api/vaults/[id]`

Updates vault properties (name, icon, safeForTravel).

---

### `DELETE /api/vaults/[id]`

Deletes a vault and all its items (cascade).

---

## User & Profile

### `GET /api/user`

Returns the current authenticated user's full profile.

**Response `200`:**
```json
{
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "data:image/png;base64,...",
    "language": "en",
    "travelMode": false,
    "secretKey": "A3-...",
    "smtpHost": null,
    "smtpPort": null,
    "smtpUser": null
  }
}
```

---

### `PUT /api/user`

Updates user preferences. Send only the fields to update.

**Supported fields:**
```json
{
  "name": "New Name",
  "avatarUrl": "data:image/png;base64,...",
  "language": "en",
  "travelMode": true,
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUser": "me@gmail.com",
  "smtpPass": "apppassword"
}
```

---

### `PUT /api/user/profile`

Dedicated endpoint for profile photo and display name updates.

**Request body:**
```json
{
  "name": "New Name",
  "avatarUrl": "data:image/jpeg;base64,..."
}
```

---

## Sharing

### `POST /api/share`

Generates a temporary public link for an item.

**Request body:**
```json
{
  "itemId": "clxxx...",
  "expiresInDays": 7,
  "viewOnce": false
}
```

**Response `200`:**
```json
{
  "url": "https://your-domain.com/share/clxxx..."
}
```

---

### `GET /api/share/[id]`

Returns the shared item if the link is valid and not expired. Increments view count; if `viewOnce` is true and already viewed, returns 410 Gone.

**Response `200`:**
```json
{
  "data": {
    "title": "Netflix",
    "username": "user@email.com",
    "password": "secret",
    "url": "https://netflix.com",
    "expiresAt": "2026-05-06T00:00:00.000Z"
  }
}
```

**Response `410`:**
```json
{ "error": "This link has expired or been used." }
```

---

## Devices

### `GET /api/devices`

Returns all devices linked to the current user's account.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "name": "Chrome (Windows)",
      "ip": "192.168.1.1",
      "location": "Local",
      "os": "Windows",
      "lastAccess": "2026-04-29T00:00:00.000Z",
      "isCurrent": true,
      "icon": "Globe"
    }
  ]
}
```

---

### `DELETE /api/devices/[id]`

Revokes a device session.

---

## Team & Invitations

### `GET /api/team`

Returns all team members.

---

### `POST /api/team`

Adds a team member.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "role": "Member"
}
```

---

### `GET /api/invitations`

Returns all pending and sent invitations.

---

### `POST /api/invitations`

Sends an invitation email to a new team member.

**Request body:**
```json
{
  "email": "newmember@company.com"
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "clxxx...",
    "email": "newmember@company.com",
    "status": "Pendiente",
    "sentAt": "2026-04-29T00:00:00.000Z",
    "expiresAt": "2026-05-06T00:00:00.000Z"
  }
}
```

---

## Error Format

All error responses follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes used:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request / validation error |
| `401` | Unauthorized (not logged in) |
| `403` | Forbidden |
| `404` | Not found |
| `409` | Conflict (e.g. duplicate email) |
| `410` | Gone (shared link expired or used) |
| `500` | Internal server error |
