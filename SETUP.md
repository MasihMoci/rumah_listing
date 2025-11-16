# Rumah Listing - Real Estate Platform Setup Guide

## Overview

Rumah Listing adalah platform real estate lengkap dengan fitur:
- 🏠 Listing properti dengan galeri foto
- 🔍 Search dan filter menggunakan Google Maps
- 💳 Integrasi pembayaran Midtrans
- 🔐 Payment-gated contact access
- 👨‍💼 Admin panel dengan Bootstrap
- 📊 Analytics dan reporting

## Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB dengan Drizzle ORM
- **Authentication**: Manus OAuth
- **Payment**: Midtrans
- **Maps**: Google Maps API

## Prerequisites

- Node.js 22+
- pnpm package manager
- MySQL/TiDB database
- Google Maps API key (untuk maps integration)
- Midtrans account (untuk payment)

## Installation & Setup

### 1. Environment Variables

Buat file `.env` dengan variabel berikut:

```env
# Database
DATABASE_URL=mysql://user:password@host/database

# OAuth (Manus)
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# App Config
VITE_APP_TITLE=Rumah Listing
VITE_APP_LOGO=/logo.svg

# Midtrans Payment
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id
```

### 2. Database Setup

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Seed demo data
node seed-demo.mjs
```

### 3. Development Server

```bash
# Start development server
pnpm dev

# Server runs on http://localhost:3000
```

### 4. Build for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
rumah_listing/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main app
│   └── public/            # Static assets
├── server/                # Backend (Express + tRPC)
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database helpers
│   ├── midtrans.ts        # Payment integration
│   └── _core/             # Framework code
├── drizzle/               # Database schema & migrations
├── seed-demo.mjs          # Demo data seeding
└── SETUP.md              # This file
```

## Key Features

### 1. Property Management

**Create Property** (Seller/Admin):
```typescript
trpc.properties.create.useMutation({
  title: "Rumah Mewah",
  description: "...",
  propertyType: "house",
  address: "...",
  city: "Jakarta",
  price: 2500000000,
  images: [...], // Minimum 5 photos
  bedrooms: 4,
  bathrooms: 3,
})
```

**Search Properties** (Public):
```typescript
trpc.properties.search.useQuery({
  city: "Jakarta",
  propertyType: "house",
  minPrice: 1000000000,
  maxPrice: 5000000000,
})
```

### 2. Payment Integration

**Create Payment Order**:
```typescript
trpc.payments.createOrder.useMutation({
  amount: 99000,
  subscriptionDays: 30,
})
```

**Handle Webhook**:
```typescript
trpc.payments.handleCallback.useMutation({
  orderId: "ORDER-123",
  transactionId: "TXN-123",
  status: "success",
  amount: 99000,
})
```

### 3. Contact Access (Payment-Gated)

**Request Contact**:
```typescript
trpc.contacts.requestContact.useMutation({
  propertyId: 123,
})
// Returns: { phone: "...", whatsapp: "..." }
```

### 4. Admin Operations

**Approve Property**:
```typescript
trpc.admin.approveProperty.useMutation({
  propertyId: 123,
})
```

**Promote User to Seller**:
```typescript
trpc.admin.promoteToSeller.useMutation({
  userId: 456,
})
```

## Demo Accounts

Setelah menjalankan `seed-demo.mjs`, gunakan akun berikut:

| Role   | Email            | OpenId           | Password | Status      |
|--------|------------------|------------------|----------|-------------|
| Admin  | admin@demo.com   | demo-admin-001   | OAuth    | Active      |
| Seller | seller@demo.com  | demo-seller-001  | OAuth    | Active      |
| User   | user@demo.com    | demo-user-001    | OAuth    | Free        |

## Admin Panel Access

Admin panel dapat diakses di:
- **URL**: `/admin`
- **Fitur**:
  - Manajemen properti (approve/reject)
  - Manajemen users
  - Monitoring pembayaran
  - Analytics & reports

## Security Features

✅ **Implemented**:
- Password hashing (bcrypt)
- JWT token authentication
- CSRF protection
- Rate limiting
- SQL injection prevention (Drizzle ORM)
- XSS protection (React)
- HTTPS ready

⚠️ **To Implement**:
- 2FA for admin accounts
- API rate limiting
- DDoS protection
- Security headers (CSP, X-Frame-Options, etc.)
- Regular security audits

## Deployment

### Option 1: Manus Platform (Recommended)

1. Create checkpoint: `webdev_save_checkpoint`
2. Click "Publish" button in Management UI
3. Configure custom domain in Settings

### Option 2: Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Option 3: Traditional VPS

```bash
# SSH into server
ssh user@server

# Clone repository
git clone <repo-url>
cd rumah_listing

# Install dependencies
pnpm install

# Set environment variables
nano .env

# Run migrations
pnpm db:push

# Start with PM2
pm2 start "pnpm start" --name "rumah-listing"
```

## API Documentation

### tRPC Endpoints

#### Properties
- `properties.getById` - Get single property
- `properties.search` - Search with filters
- `properties.getMyProperties` - User's listings
- `properties.create` - Create new property
- `properties.update` - Update property

#### Payments
- `payments.createOrder` - Create payment order
- `payments.handleCallback` - Process webhook
- `payments.getStatus` - Check payment status

#### Contacts
- `contacts.requestContact` - Request seller contact
- `contacts.getHistory` - View request history

#### Admin
- `admin.getUsers` - List all users
- `admin.approveProperty` - Approve listing
- `admin.rejectProperty` - Reject listing
- `admin.promoteToSeller` - Promote user role

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Pastikan DATABASE_URL benar dan database server running

### Midtrans Integration Error
```
Error: Invalid server key
```
**Solution**: Periksa MIDTRANS_SERVER_KEY di .env

### Google Maps Not Loading
```
Error: Google Maps API key not valid
```
**Solution**: Pastikan VITE_GOOGLE_MAPS_API_KEY valid dan API enabled

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Ubah PORT di .env atau kill process yang menggunakan port 3000

## Performance Optimization

- ✅ Image optimization (lazy loading, WebP)
- ✅ Code splitting (React Router)
- ✅ Database indexing (Drizzle migrations)
- ✅ Caching strategy (tRPC)
- ✅ CDN ready (static assets)

## Maintenance

### Regular Tasks
- Monitor server logs
- Check database backups
- Review payment transactions
- Update dependencies monthly
- Security patches immediately

### Monitoring
```bash
# Check server status
pm2 status

# View logs
pm2 logs rumah-listing

# Monitor performance
pm2 monit
```

## Support & Documentation

- **tRPC Docs**: https://trpc.io/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Tailwind CSS**: https://tailwindcss.com
- **React**: https://react.dev
- **Midtrans**: https://docs.midtrans.com

## License

MIT License - Bebas digunakan untuk keperluan komersial maupun non-komersial

## Contact

Untuk pertanyaan atau support, hubungi:
- Email: support@rumahlistingdemo.com
- WhatsApp: +62 XXX XXXX XXXX

---

**Last Updated**: November 2024
**Version**: 1.0.0
