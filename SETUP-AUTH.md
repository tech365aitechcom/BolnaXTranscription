# 🔐 Multi-Tenant Authentication Setup Guide

This guide will help you set up the multi-tenant authentication system for your Bolna Agent Dashboard.

## 🎯 What's Implemented

✅ **MongoDB Database** with Mongoose
✅ **NextAuth Authentication** with credentials login
✅ **User & Agent Models** with relationships
✅ **Login Page** with beautiful UI
✅ **Seed Script** to create test users and bots
✅ **Role-based Access** (admin/client)
✅ **Multi-Bot Support** (each client can have multiple bots)

---

## 📋 Prerequisites

1. **MongoDB** - Install MongoDB locally OR use MongoDB Atlas (cloud)
2. **Node.js** - Already installed
3. **Your Bolna API Key** - Already configured

---

## 🚀 Setup Steps

### Step 1: Install MongoDB

**Option A: Local MongoDB (Recommended for development)**
```bash
# Download and install from: https://www.mongodb.com/try/download/community
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud - Recommended for production)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/bolna_dashboard`)

### Step 2: Configure Environment Variables

Your `.env` file already has the placeholders. Update them:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bolna_dashboard
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bolna_dashboard

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-change-this
NEXTAUTH_URL=http://localhost:3000
```

**Important**: Generate a secure `NEXTAUTH_SECRET`:
```bash
# Run this command to generate a secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Seed the Database

Run the seed script to create test users and agents:

```bash
npm run seed
```

This will create:
- **1 Admin user**: `admin@example.com` / `admin123`
- **3 Test clients** with their bots:
  - `client1@example.com` / `client123` (1 bot)
  - `client2@example.com` / `client123` (2 bots)
  - `client3@example.com` / `client123` (3 bots)

### Step 4: Start the Application

```bash
npm run dev
```

### Step 5: Test Login

1. Go to: http://localhost:3000
2. You'll be redirected to: http://localhost:3000/auth/login
3. Login with any test account:
   - `client1@example.com` / `client123`
   - `client2@example.com` / `client123`
   - `admin@example.com` / `admin123`

---

## 👥 How to Add Your Real Customers

### Method 1: Using MongoDB Compass (GUI)

1. Install MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Connect to your database
3. Go to `users` collection
4. Add a new document:
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "password": "$2a$10$hashed_password_here",
  "role": "client",
  "createdAt": "2025-01-09T00:00:00.000Z",
  "updatedAt": "2025-01-09T00:00:00.000Z"
}
```

5. Go to `agents` collection
6. Add their bots:
```json
{
  "name": "Customer's Sales Bot",
  "bolnaAgentId": "actual-bolna-agent-id-from-bolna-platform",
  "description": "Handles sales calls",
  "color": "#3B82F6",
  "isActive": true,
  "userId": "user_id_from_previous_step",
  "createdAt": "2025-01-09T00:00:00.000Z",
  "updatedAt": "2025-01-09T00:00:00.000Z"
}
```

### Method 2: Using Node.js Script (Recommended)

Create a script `scripts/add-customer.ts`:

```typescript
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import User from '../lib/models/User';
import Agent from '../lib/models/Agent';

async function addCustomer() {
  await connectDB();

  // Create user
  const password = await bcrypt.hash('temporary-password', 10);
  const user = await User.create({
    name: 'Customer Name',
    email: 'customer@example.com',
    password,
    role: 'client',
  });

  // Create their bots
  await Agent.create([
    {
      name: 'Sales Bot',
      bolnaAgentId: 'actual-bolna-agent-id',
      description: 'Sales calls',
      userId: user._id,
    },
    {
      name: 'Support Bot',
      bolnaAgentId: 'another-bolna-agent-id',
      description: 'Customer support',
      userId: user._id,
    },
  ]);

  console.log('✅ Customer added!');
  process.exit(0);
}

addCustomer();
```

Run it:
```bash
npx tsx scripts/add-customer.ts
```

---

## 🔒 Security Notes

1. **Change default passwords** - The seed script creates passwords like `client123`. Change them in production!
2. **Use strong NEXTAUTH_SECRET** - Generate a random 32-byte hex string
3. **Use HTTPS in production** - Update `NEXTAUTH_URL` to use `https://`
4. **Environment variables** - Never commit `.env` to Git
5. **Hash passwords** - Always use bcrypt to hash passwords (already implemented)

---

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  role: 'admin' | 'client',
  createdAt: Date,
  updatedAt: Date
}
```

### Agents Collection
```typescript
{
  _id: ObjectId,
  name: string,
  bolnaAgentId: string,  // The actual Bolna agent ID
  description?: string,
  color?: string,
  isActive: boolean,
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Next Steps (TODO)

The following features need to be implemented:

### 1. Update API Routes to Filter by User
Currently, API routes use the global `BOLNA_AGENT_ID`. You need to:
- Get the current user's session in API routes
- Filter data by the user's assigned agents
- Only show executions for their bots

### 2. Add Agent Selector UI
When a user has multiple bots:
- Show a dropdown in the header
- Let them switch between bots
- Store selection in localStorage

### 3. Update Homepage
- Add authentication check
- Show loading while checking auth
- Redirect to login if not authenticated

### 4. Create Admin Panel
- View all users
- Add/edit/delete users
- Assign bots to users
- View all bots

### 5. Add Logout Button
- Add logout button in header
- Clear session
- Redirect to login

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```
Error: MongooseError: Operation `users.find()` buffering timed out
```
**Solution**: Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh
# If not, start it:
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### NextAuth Error: "Invalid URL"
**Solution**: Make sure `NEXTAUTH_URL` is set correctly in `.env`

### Can't Login
**Solution**:
1. Check MongoDB is running
2. Run `npm run seed` again
3. Check browser console for errors

---

## 📚 Additional Resources

- NextAuth.js Docs: https://next-auth.js.org
- Mongoose Docs: https://mongoosejs.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

## 🎉 Success!

Once everything is set up:
1. Each customer logs in with their email/password
2. They see only THEIR bot(s)
3. They can view executions, logs, and analytics for their bots only
4. You (admin) can manage all users and bots

**Need help?** Check the troubleshooting section above!
