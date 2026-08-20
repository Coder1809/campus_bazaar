# CampusBazaar

> **A Full-Stack Peer-to-Peer Campus Marketplace** where university students can securely buy, sell, rent, and donate items with structured rental agreements, real-time Socket.IO chat, and automated reminder notifications.

🔗 **Live Client:** [https://campus-bazaar-gamma.vercel.app](https://campus-bazaar-gamma.vercel.app)  
📡 **Live Backend API:** [https://campus-bazaar-bklh.onrender.com](https://campus-bazaar-bklh.onrender.com)

---

## 1. Project Overview & System Architecture

CampusBazaar eliminates the friction and scams of open social media buy/sell groups by providing an authenticated, structured marketplace tailored for college campuses. Students can list items for sale, hourly/daily rentals, or free giveaways, negotiate terms via real-time chat, and manage transaction milestones with verifiable pickup agreements.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React 18 Single Page App                 │
│         (Vite + Tailwind CSS + Lucide Icons + Axios)        │
└───────────────┬─────────────────────────────▲───────────────┘
                │ REST API (JSON / Multipart) │ JSON / Socket Events
                ▼                             │
┌─────────────────────────────────────────────┴───────────────┐
│                 Express.js REST & Socket Server             │
│    ├── JWT Authentication & Refresh Token Rotation          │
│    ├── Cloudinary Media Pipeline (Multer Uploads)           │
│    ├── Rental Agreement State Machine & Reminder Scheduler  │
│    ├── Real-Time Socket.IO Chat Gateway                     │
│    └── MongoDB Database Layer (Mongoose ODM)                │
└───────────────┬─────────────────────────────▲───────────────┘
                │ Storage                     │ Queries & Documents
                ▼                             ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     Cloudinary Media CDN      │ │      MongoDB Database     │
│   (Item Photos & Avatars)     │ │ (Users, Items, Txns, Msgs)│
└───────────────────────────────┘ └───────────────────────────┘
```

---

## 2. Core Features & Business Workflows

### A. Item Listings & Discovery
- **3 Transaction Modes:**
  - **`SELL`**: Fixed-price or negotiable second-hand item sales.
  - **`RENT`**: Short-term equipment/book rentals with daily rates and deposit terms.
  - **`GIVE`**: Free donations and giveaways to campus peers.
- **Categorized Search & Filters:** Search by title/keywords and filter across 7 categories: `Electronics`, `Books`, `Furniture`, `Clothing`, `Sports`, `Kitchen`, and `Other`.
- **Cloudinary Image Pipeline:** Multi-photo upload with automatic image optimization and local buffer cleanup.

### B. Transaction & Rental State Machine
1. **Request Submission:** Buyer sends a request with proposed price and meetup notes (`status: PENDING`).
2. **Seller Acceptance:** Seller reviews incoming requests in their Inbox and accepts an offer.
3. **Transaction Creation:** An official deal record is instantiated (`status: ACCEPTED`).
4. **Lifecycle Progression:** Transitions through `AGREEMENT_PROPOSED` → `ACTIVE` → `RETURN_PENDING` → `COMPLETED` (or `DISPUTED`).

### C. Real-Time 1v1 Chat
- **Transaction-Linked Rooms:** Dedicated Socket.IO chat rooms for active deals to coordinate handoffs and test item functionality.
- **Live Typing Indicators:** Dynamic typing bubbles with debounced socket emission.
- **Strict Deduplication:** Safe message state handling preventing duplicate bubbles across simultaneous REST responses and WebSocket broadcasts.

### D. Automated Reminder Engine
- Node-based background scheduler notifying users of approaching rental return dates and pending pickups.

---

## 3. Database Schema & Data Models

CampusBazaar uses MongoDB with 6 primary Mongoose models:

```
┌─────────────────┐       1:N       ┌──────────────────┐
│      User       ├─────────────────┤       Item       │
│ (Auth & College)│                 │ (Catalog Model)  │
└────────┬────────┘                 └────────┬─────────┘
         │                                   │
         │ 1:N                               │ 1:N
┌────────▼────────┐       1:1       ┌────────▼─────────┐
│     Request     ├────────────────►│   Transaction    │
│(Offer / Status) │                 │(Agreement States)│
└─────────────────┘                 └────────┬─────────┘
                                             │
                                             │ 1:N
                                    ┌────────▼─────────┐
                                    │     Message      │
                                    │(Chat History)    │
                                    └──────────────────┘
```

1. **User (`user.model.js`)**: `fullName`, `username`, `email`, `password` (bcrypt hash), `college`, `avatar`, and `refreshToken`.
2. **Item (`item.model.js`)**: `owner` (User Ref), `title`, `description`, `photos` array, `category`, `mode` (`SELL` | `RENT` | `GIVE`), `price`, `condition` (`NEW` | `LIKE_NEW` | `GOOD` | `FAIR` | `POOR`), `isAvailable`, and `availabilitySchedule`.
3. **Request (`request.model.js`)**: `item` (Item Ref), `requester` (User Ref), `owner` (User Ref), `mode`, `proposedPrice`, `message`, and `status` (`PENDING` | `ACCEPTED` | `REJECTED` | `CANCELLED`).
4. **Transaction (`transaction.model.js`)**: `item`, `owner`, `requester`, `mode`, `agreedPrice`, `status` (`ACCEPTED` | `AGREEMENT_PROPOSED` | `ACTIVE` | `RETURN_PENDING` | `COMPLETED` | `DISPUTED`), and `rentalTerms` (deposit, return date).
5. **Message (`message.model.js`)**: `transaction` (Transaction Ref), `sender` (User Ref), `content`, and `timestamp`.
6. **Notification (`notification.model.js`)**: `recipient`, `type`, `message`, `referenceId`, and `isRead`.

---

## 4. API Endpoints Specification

### Authentication & Users (`/api/v1/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/users/register` | Register user with profile details | No |
| `POST` | `/api/v1/users/login` | Authenticate user & issue JWT pair | No |
| `POST` | `/api/v1/users/refresh-token` | Refresh expired access token | No |
| `GET` | `/api/v1/users/current-user` | Get authenticated user profile | Yes (JWT) |
| `POST` | `/api/v1/users/logout` | Invalidate refresh token & clear cookies | Yes (JWT) |

### Marketplace Listings (`/api/v1/items`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/items` | Browse all active marketplace listings | No (Public) |
| `GET` | `/api/v1/items/:itemId` | Get single item details & owner info | No (Public) |
| `POST` | `/api/v1/items` | Create new listing with photo uploads | Yes (JWT) |
| `GET` | `/api/v1/items/my-items` | Get logged-in user's listed items | Yes (JWT) |
| `PATCH` | `/api/v1/items/:itemId` | Update listing details or pricing | Yes (Owner) |
| `DELETE` | `/api/v1/items/:itemId` | Delete listing | Yes (Owner) |
| `PATCH` | `/api/v1/items/:itemId/availability` | Toggle item availability status | Yes (Owner) |

### Requests & Deals (`/api/v1/requests` & `/api/v1/transactions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/requests` | Send purchase or rental request | Yes (JWT) |
| `GET` | `/api/v1/requests/inbox` | Get incoming and outgoing requests | Yes (JWT) |
| `PATCH` | `/api/v1/requests/:id/accept` | Accept request & create transaction | Yes (Owner) |
| `PATCH` | `/api/v1/requests/:id/reject` | Reject incoming request | Yes (Owner) |
| `GET` | `/api/v1/transactions/:id` | Get deal status & agreement terms | Yes (Participant) |
| `POST` | `/api/v1/transactions/:id/propose` | Propose formal rental agreement | Yes (Participant) |
| `PATCH` | `/api/v1/transactions/:id/confirm` | Confirm agreement & activate deal | Yes (Participant) |

### Real-Time Chat & Alerts (`/api/v1/messages` & `/api/v1/notifications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/messages/conversations` | List active conversations & unread count | Yes (JWT) |
| `GET` | `/api/v1/messages/:transactionId` | Fetch message history for deal | Yes (Participant) |
| `POST` | `/api/v1/messages/:transactionId` | Send message in deal chat | Yes (Participant) |
| `GET` | `/api/v1/notifications` | Get user notifications & count | Yes (JWT) |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark notification as read | Yes (JWT) |

---

## 5. Technology Stack

- **Frontend:**
  - React 18 (Hooks, Context, State Management)
  - Vite (Modern Lightning-Fast Bundler)
  - React Router v7 (Client-side routing)
  - Tailwind CSS (Curated modern aesthetic with responsive navbar drawer)
  - Socket.IO Client (Low-latency chat & live notifications)
  - Axios (Centralized API client with JWT bearer & refresh interceptors)
  - Lucide React (Clean icon set)
- **Backend:**
  - Node.js (v20.20.2 pinned via `.nvmrc`)
  - Express.js (REST API architecture with async error handling)
  - MongoDB & Mongoose (Document persistence, schema validation, indexes)
  - Socket.IO (Room-scoped messaging, typing indicators)
  - Multer & Cloudinary (Cloud image storage)
  - `bcrypt` & `jsonwebtoken` (Security, password hashing, and token rotation)

---

## 6. Getting Started & Local Development

### Prerequisites
- **Node.js**: `v20.20.2` (`nvm use 20.20.2`)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI
- **Git**

### 1. Environment Configuration

**Backend (`backend/.env`):**
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/campusbazaar
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=campusbazaar_access_token_secret_key_12345
REFRESH_TOKEN_SECRET=campusbazaar_refresh_token_secret_key_12345
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

---

### 2. Installation & Running

#### Step A: Backend Server (Terminal 1)
```bash
cd backend
nvm use 20.20.2
npm install
npm run seed     # Seeds 13 authentic Indian campus items & test accounts
npm run dev      # Starts server on http://localhost:8000
```

#### Step B: Frontend Client (Terminal 2)
```bash
cd frontend
nvm use 20.20.2
npm install
npm run dev      # Starts client on http://localhost:5173
```

---

## 7. Sample Seed Credentials

All seeded test accounts use the universal password: **`password123`**

| Role | Username | Email | College |
|---|---|---|---|
| **Seller** | `sasank` | `sasank@nitrr.ac.in` | NIT Raipur |
| **Buyer / Student** | `sasank09` | `sasank@gmail.com` | NIT Raipur |
| **Student** | `sageheal` | `surya@nitrr.ac.in` | NIT Raipur |

---

## 8. License

Distributed under the MIT License. Designed and developed by **Sasank Reddy**.

