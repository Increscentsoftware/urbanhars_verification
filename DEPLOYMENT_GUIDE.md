# UrbanHars Partner Verification Portal
## Complete Setup & Deployment Guide

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd urbanhars
npm install
```

### 2. Configure Environment
Copy `.env.local` and fill in your values (already pre-filled with your keys).

### 3. Setup Supabase Database
1. Go to: https://supabase.com/dashboard/project/grcnrusslcyabdcjorop
2. Click **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run**

### 4. Setup Supabase Storage
1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name: `technician-documents`
4. Check **Public bucket**
5. Set allowed MIME types: `image/jpeg, image/png, application/pdf`
6. Set max file size: `5242880` (5MB)
7. Click **Create**

### 5. Get Service Role Key
1. Go to **Project Settings** → **API**
2. Copy the `service_role` key (secret!)
3. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 6. Setup MSG91 Template
1. Log into MSG91 dashboard
2. Create an OTP template with variable: `##OTP##`
3. Copy the Template ID
4. Add to `.env.local`:
   ```
   MSG91_TEMPLATE_ID=your_template_id
   ```

### 7. Run Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

---

## 🌐 Deploy to Vercel

### Option A: GitHub + Vercel (Recommended)
```bash
# Initialize git
git init
git add .
git commit -m "Initial UrbanHars app"

# Push to GitHub, then connect in Vercel dashboard
```

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Environment Variables in Vercel
Add all variables from `.env.local` to Vercel dashboard:
Project Settings → Environment Variables

---

## 🔐 Default Admin Credentials
- Email: `admin@urbanhars.com`
- Password: `UrbanHars@2024!`

**Change these immediately after deployment!**
Update in `/app/api/admin/login/route.ts`

---

## 📱 Application URLs
- Home: `/`
- Register: `/register`
- Check Status: `/dashboard`
- Terms: `/terms-and-conditions`
- Admin Login: `/admin`
- Admin Dashboard: `/admin/dashboard`

---

## 🗃️ Database Schema Summary
```
technicians
├── id (UUID, PK)
├── reference_id (UH-TECH-XXXXX)
├── Personal: full_name, dob, gender, email
├── Phone: phone_number, phone_verified
├── Address: address_line1-2, city, state, pincode
├── Files: profile_photo_url, aadhaar_front_url, aadhaar_back_url, selfie_url
├── Service: service_categories[], experience, service_areas[]
├── Emergency: emergency_contact_name/phone/relationship
├── Vehicle: vehicle_available, vehicle_number
├── GPS: latitude, longitude, location_timestamp
├── Consents: terms_accepted, gps_consent, document_consent, criminal_declaration
├── Admin: verification_score, verification_status, approval_notes, approved_by
└── Meta: created_at, updated_at
```

---

## 📊 Trust Score Breakdown
| Item | Points |
|------|--------|
| Phone Verified | 20 |
| Profile Photo | 10 |
| Aadhaar Uploaded | 20 |
| Selfie Uploaded | 20 |
| GPS Captured | 10 |
| Emergency Contact | 10 |
| Vehicle Info | 10 |
| **Total** | **100** |

Score Labels:
- 80-100 = ✅ Verified
- 50-79 = ⚠️ Partial Verification
- 0-49 = ❌ Incomplete

---

## 🔧 Customization

### Change Admin Password
Edit `/app/api/admin/login/route.ts`:
```typescript
const ADMIN_CREDENTIALS = [
  { email: 'admin@urbanhars.com', password: 'YourNewPassword123!' },
]
```

### Add New Service Category
Edit `/lib/utils.ts`:
```typescript
export const SERVICE_CATEGORIES = [
  // ... existing
  'Your New Category',
]
```

### Add New Service Area
Edit `/lib/utils.ts`:
```typescript
export const SERVICE_AREAS = [
  // ... existing
  'New Area',
]
```

---

## 🔮 Future Integrations (Stubs Ready)

### Aadhaar Verification API
```typescript
// Add to /app/api/verify/aadhaar/route.ts
const response = await fetch('https://api.aadhaarapi.com/v1/verify', {
  method: 'POST',
  headers: { 'Authorization': process.env.AADHAAR_API_KEY },
  body: JSON.stringify({ aadhaar_number, otp })
})
```

### Face Match API
```typescript
// Add to /app/api/verify/face/route.ts
// Compare selfie_url with aadhaar_front_url
```

### Payment/Wallet
```typescript
// Future: /app/api/wallet/route.ts
// Technician wallet, payouts, transactions
```

---

## 📞 Support
- Email: support@urbanhars.com
- Tech: tech@urbanhars.com
