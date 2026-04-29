<div align="center">

# 🔐 OpenPassword

**Your open-source password manager**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://prisma.io)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## What is OpenPassword?

**OpenPassword** is a full-featured, modern, open-source password manager. It is designed for teams and individual users who want complete control over where and how their credentials are stored — without relying on third-party cloud services.

With OpenPassword you can store passwords, secure notes, credit cards, identities, SSH keys, crypto wallets and much more, all organized in **vaults** and protected by a master password authentication system.

---

## ✨ Key Features

### 🔐 Item Management
- **22 supported item types**: logins, secure notes, credit cards, identities, SSH keys, crypto wallets, documents, passports, memberships, and more.
- **Custom fields** per item: text, URL, email, date, password, OTP, passkey, etc.
- **Tags** for organizing and filtering items.
- **Favorites** and **archiving** of items.
- **Duplicate** and **move** items between vaults.

### 🗃️ Vaults
- Organize your items into independent vaults.
- **Travel Mode** support: hides vaults not marked as "safe for travel" while crossing borders.
- Vault administration view with item assignment.

### 🔑 Advanced Security
- **TOTP / OTP built-in**: real-time one-time code generation and display with a countdown progress bar.
- **Passkeys (FIDO2)**: creation and storage of biometric access keys.
- **Account Secret Key** with a downloadable QR code for account recovery.
- **Recovery code** in case of master password loss.
- **Built-in password generator** with control over length, uppercase, numbers, and symbols.

### 🛡️ Watchtower — Security Monitor
A security analysis center that evaluates your passwords and shows:
- **Security score** from 0–1000, calculated in real time by entropy, reuse, and age.
- **Reused passwords** across multiple sites.
- **Weak passwords** (entropy < 40 bits).
- **Unsecured HTTP sites**.
- **Old passwords** (not rotated in 6+ months).
- **Available passkeys** and active 2FA authentication.
- **Analytics dashboard**: monthly activity heatmap, top domains, most-used emails, and item type distribution.

### 🔗 Item Sharing
- Generate **temporary links** to securely share an item with anyone.
- Configurable expiration (1, 7, or 30 days).
- **View-once** option: the link is invalidated after the first access.
- **Private permalink** per item: every item has a unique URL (`/item/[id]`) for direct access and browser deep linking.

### 🔒 PassEncrypt — Encryption Tool
A standalone text encryption tool supporting:
- `bcrypt` (10 rounds)
- `SHA-256` and `SHA-512`
- `MD5`
- `Base64` encode / decode
- `AES` encrypt / decrypt (with a secret key)
- File to Base64 conversion

### 👥 Team Management
- Invite team members via email.
- Member list with roles and statuses.
- Pending invitation management.

### ⚙️ Settings & Preferences
All settings persist to the database:
- **Profile photo** (image upload, not a URL).
- **Display name**.
- **Master password change**.
- **Email address change**.
- **Language**: English / Spanish — switches the entire UI instantly without a page reload.
- **Auto-lock** after inactivity.
- **Travel Mode**.
- **Custom SMTP** for sending invitations.
- **Active devices**: list of sessions with IP, OS, and location.
- **API documentation** embedded directly in the UI.

### 🌍 Multi-language Support
The full UI is bilingual (**English / Spanish**):
- Language switching is instant — no page reload required.
- Translates all text: buttons, titles, descriptions, messages, modals, forms, menus, Watchtower, Sidebar, and more.
- Language preference is saved per user in the database.

---

## 🏗️ Architecture

```
OpenPassword/
├── src/
│   ├── app/
│   │   ├── [[...slug]]/        # Main page (SPA with dynamic routing)
│   │   ├── api/
│   │   │   ├── auth/           # Login / Logout
│   │   │   ├── items/          # Item CRUD + [id]
│   │   │   ├── vaults/         # Vault CRUD
│   │   │   ├── user/           # Profile, preferences, SMTP
│   │   │   ├── share/          # Shared link generation & lookup
│   │   │   ├── devices/        # Active device sessions
│   │   │   ├── invitations/    # Invitation management
│   │   │   └── team/           # Team management
│   │   ├── login/              # Login page
│   │   ├── setup/              # New account registration
│   │   └── share/[id]/         # Public shared item view
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── ItemList.tsx        # Item list with search
│   │   ├── ItemDetail.tsx      # Item detail + share & move modals
│   │   ├── ItemForm.tsx        # Item create / edit form
│   │   ├── VaultForm.tsx       # Vault form
│   │   ├── Watchtower.tsx      # Security monitor
│   │   ├── PassEncrypt.tsx     # Encryption tool
│   │   ├── Settings.tsx        # Full settings panel
│   │   ├── ApiDocsModal.tsx    # In-app API documentation
│   │   ├── OTPDisplay.tsx      # Real-time TOTP viewer
│   │   ├── PasswordGenerator.tsx # Password generator
│   │   ├── GlobalModals.tsx    # Custom alert / confirm system
│   │   ├── People.tsx          # Team management
│   │   ├── Invitations.tsx     # Invitation management
│   │   └── VaultsAdmin.tsx     # Vault administration
│   ├── utils/
│   │   └── i18n.ts             # EN / ES translation dictionary
│   ├── lib/
│   │   └── prisma.ts           # Prisma client (singleton)
│   └── types/                  # Shared TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
└── dev.db                      # Local SQLite database (development)
```

---

## 🗄️ Data Model

| Model | Description |
|-------|-------------|
| `User` | User account with master password, Secret Key, avatar, language, travel mode, SMTP config |
| `Vault` | Vault that groups items; can be flagged as "safe for travel" |
| `PasswordItem` | Item (password, note, card…) with standard fields, OTP, passkey, custom fields, tags |
| `Tag` | Reusable label shared across items |
| `Device` | Device with access history (IP, OS, location) |
| `SharedLink` | Temporary sharing link with expiration and view-once support |
| `TeamMember` | Team member with role and status |
| `Invitation` | Email invitation with status and expiration date |

---

## 🔌 REST API

All endpoints require authentication via the `auth_token` cookie.

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/items` | List all items |
| `POST` | `/api/items` | Create a new item |
| `PUT` | `/api/items/[id]` | Update an item |
| `DELETE` | `/api/items/[id]` | Delete an item |
| `GET` | `/api/vaults` | List vaults |
| `POST` | `/api/vaults` | Create a vault |
| `GET` | `/api/user` | Get current user data |
| `PUT` | `/api/user` | Update profile / preferences |
| `GET` | `/api/devices` | List active device sessions |
| `DELETE` | `/api/devices/[id]` | Revoke a device |
| `POST` | `/api/share` | Generate a temporary sharing link |
| `GET` | `/api/share/[id]` | Look up a shared item |
| `GET` | `/api/invitations` | List invitations |
| `POST` | `/api/invitations` | Send an invitation |
| `GET` | `/api/team` | List team members |

---

## 🚀 Getting Started

### Requirements
- Node.js 18+
- npm / yarn / pnpm

### 1. Clone the repository

```bash
git clone https://github.com/CloudBird-Technologies/openpassword.git
cd openpassword
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file at the root of the project:

```env
DATABASE_URL="file:./dev.db"
```

### 4. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Create your first account

Navigate to [http://localhost:3000/setup](http://localhost:3000/setup) to register your initial account.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run the ESLint linter |
| `npx prisma studio` | Open the visual database browser |
| `npx prisma db push` | Sync the schema with the database |

---

## 🧰 Tech Stack

| Technology | Role |
|------------|------|
| **Next.js 16** (App Router + Turbopack) | Full-stack framework |
| **React 19** | Reactive UI |
| **TypeScript 5** | Static typing |
| **Prisma 5** + **SQLite** | ORM and database |
| **bcryptjs** | Password hashing |
| **crypto-js** | AES, SHA, MD5, Base64 encryption |
| **otpauth** | TOTP code generation |
| **qrcode** | QR code generation for Secret Key |
| **jsPDF** | Emergency kit PDF export |
| **lucide-react** | Icon library |
| **Vanilla CSS** | Styling (dark mode, glassmorphism, CSS variables) |

---

## 🌐 Deep Linking

Every item has its own permanent URL:

```
http://your-domain.com/item/[item-id]
```

As you navigate between items, the browser URL updates automatically. You can bookmark or share these URLs for direct access to any credential.

---

## 📱 Upcoming Platforms

OpenPassword is built with an API-first architecture to make future platform support straightforward:

- 📱 **Mobile App** (iOS / Android)
- 🔌 **Browser Extension** (Chrome / Firefox)

---

## 🏢 Built by

**CloudBird Technologies LLC**  
[cloudbird.com.mx](https://cloudbird.com.mx)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
