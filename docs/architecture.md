# Architecture Guide

> Deep-dive into OpenPassword's technical structure, component design, data flow, and routing strategy.

---

## Overview

OpenPassword is a **full-stack Next.js application** using the App Router. It operates as a Single Page Application (SPA) for the dashboard — all navigation between views (vaults, items, settings, Watchtower, etc.) happens client-side without full page reloads, while the backend is provided entirely by Next.js API Route Handlers.

---

## Directory Structure

```
src/
├── app/
│   ├── [[...slug]]/            # Catch-all route — renders the entire dashboard SPA
│   │   └── page.tsx
│   ├── api/                    # REST API (Next.js Route Handlers)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── setup/route.ts
│   │   ├── items/
│   │   │   ├── route.ts        # GET (list), POST (create)
│   │   │   └── [id]/route.ts   # GET (single), PUT (update), DELETE
│   │   ├── vaults/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── user/
│   │   │   ├── route.ts        # GET (profile), PUT (update prefs/lang/smtp)
│   │   │   └── profile/route.ts
│   │   ├── share/
│   │   │   ├── route.ts        # POST (generate link)
│   │   │   └── [id]/route.ts   # GET (look up shared item)
│   │   ├── devices/
│   │   │   └── route.ts
│   │   ├── invitations/
│   │   │   └── route.ts
│   │   └── team/
│   │       └── route.ts
│   ├── login/page.tsx          # Authentication page
│   ├── setup/page.tsx          # Account registration + Emergency Kit PDF
│   └── share/[id]/page.tsx     # Public view of a shared item
├── components/                 # All UI components (see below)
├── lib/
│   └── prisma.ts               # Prisma singleton (prevents connection pool exhaustion in dev)
├── types/
│   └── index.ts                # Shared TypeScript interfaces
└── utils/
    └── i18n.ts                 # Bilingual translation dictionary (ES / EN)
```

---

## Routing Strategy

### Dashboard SPA — `[[...slug]]`

The entire authenticated dashboard lives under a single **catch-all route** (`[[...slug]]`). This means URLs like `/favorites`, `/watchtower`, `/settings`, and `/item/[id]` all render `page.tsx`, which reads the URL and decides which view to show client-side.

```
/                     → All Items (default)
/favorites            → Favorites filter
/watchtower           → Watchtower view
/passencrypt          → PassEncrypt tool
/archived             → Archived items
/settings             → Settings panel
/people               → Team management
/invitations          → Invitations
/vaults_admin         → Vault administration
/item/[id]            → Deep link to a specific item
```

**Why catch-all?** This gives us SPA-style navigation (no full reloads) while keeping shareable, bookmarkable URLs. The `handleSelectFilter` and `handleSelectItem` functions use `window.history.pushState` to update the URL without triggering a Next.js navigation.

### Public Routes

| Route | Description |
|-------|-------------|
| `/login` | Login form |
| `/setup` | New account registration |
| `/share/[id]` | Public page for a shared item link |

---

## Component Architecture

### State Management — `page.tsx`

The root component (`page.tsx`) owns all global state:

```
page.tsx
├── items[]          — All password items
├── vaults[]         — All vaults
├── selectedId       — Currently selected item ID
├── selectedFilter   — Active sidebar filter (type + optional ID)
├── editingItem      — Item being edited (null = new item)
├── showVaultForm    — VaultForm modal visibility
└── showItemForm     — ItemForm modal visibility
```

State flows **downward** as props and events flow **upward** as callbacks — no external state library (Redux, Zustand, etc.) is used.

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `Sidebar` | Navigation, vault list, tag list, admin links, logout |
| `ItemList` | Filtered item list with search bar |
| `ItemDetail` | Read-only item view, context menu actions, share modal, move modal |
| `ItemForm` | Create/edit modal with category picker, field sections, password generator, passkey modal |
| `VaultForm` | Simple create-vault modal |
| `Watchtower` | Security score, 6 metric cards, analytics panel |
| `PassEncrypt` | Hash/encryption tool with algorithm selector |
| `Settings` | Account settings, Secret Key, Emergency Kit, devices, SMTP, language |
| `OTPDisplay` | Live TOTP code with rotating countdown ring |
| `PasswordGenerator` | Configurable random password generator |
| `GlobalModals` | Custom `alert()` / `confirm()` replacement modals |
| `ApiDocsModal` | In-app REST API reference |
| `People` | Team member list |
| `Invitations` | Invitation list and send form |
| `VaultsAdmin` | Vault admin panel |

---

## Internationalization (i18n)

Translation is handled by a central dictionary in `src/utils/i18n.ts`:

```ts
export const translations: Record<string, Record<string, string>> = {
  es: { settingsTitle: 'Configuración', ... },
  en: { settingsTitle: 'Settings', ... }
};
```

Each component that needs translations follows this pattern:

```tsx
const [language, setLanguage] = useState('es');

useEffect(() => {
  // Load preference from DB on mount
  fetch('/api/user').then(r => r.json()).then(data => {
    if (data.data?.language) setLanguage(data.data.language);
  });
  // Listen for instant updates when user changes language in Settings
  const handler = (e: any) => setLanguage(e.detail.language);
  window.addEventListener('languageChanged', handler);
  return () => window.removeEventListener('languageChanged', handler);
}, []);

const t = translations[language] || translations['es'];
```

When the user changes the language in Settings, a custom DOM event `languageChanged` is dispatched — all mounted components update instantly without a page reload.

---

## Authentication

Authentication uses a **cookie-based session**:

1. `POST /api/auth/login` validates credentials with bcrypt and sets an `auth_token` cookie.
2. A Next.js **middleware** (`src/proxy.ts`) checks for the cookie on every protected route. If missing, it redirects to `/login`.
3. On logout, the cookie is cleared via `document.cookie = 'auth_token=; expires=...'` and the user is redirected to `/login`.

> Note: In production, use `HttpOnly` and `Secure` cookie flags. The current implementation uses a simple presence check suitable for self-hosted environments.

---

## Database

OpenPassword uses **Prisma** with a **PostgreSQL** backend. The connection is
configured exclusively through the `DATABASE_URL` environment variable, and
production applies committed migrations with `prisma migrate deploy`.

The Prisma client is instantiated as a singleton in `src/lib/prisma.ts` to prevent connection exhaustion during hot-reloading in development:

```ts
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
```

---

## Security Score Algorithm (Watchtower)

The security score starts at **1000** and is deducted based on the vault's health:

```
score = 1000
score -= (reusedItems.length  / total) * 300   // Reused passwords (-300 max)
score -= (weakItems.length    / total) * 400   // Weak passwords   (-400 max)
score -= (httpItems.length    / total) * 100   // HTTP sites       (-100 max)
score -= (oldItems.length     / total) * 50    // Old passwords    (-50 max)
score += passkeyItems.length  * 20             // Passkeys         (+20 each)
score += active2FAItems.length * 15            // 2FA enabled      (+15 each)
score = clamp(0, 1000)
```

**Weak password** = entropy < 40 bits, calculated as:
```
entropy = password.length * log2(characterPoolSize)
```

Where pool size is determined by which character classes are present (lowercase, uppercase, digits, symbols).
