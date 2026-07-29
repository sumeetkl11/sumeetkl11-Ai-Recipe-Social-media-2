# Week 1 Implementation Guide - Social Cooking Platform

## 🎯 Overview
This guide walks you through setting up the Week 1 infrastructure for the social cooking platform:
- ✅ Database migrations (posts, comments, likes, follows, notifications)
- ✅ Social REST API endpoints (12 posts/comments/likes endpoints)
- ✅ Socket.io integration for real-time updates
- ✅ Redis caching setup
- ✅ Basic frontend components

---

## 📋 Prerequisites

Ensure you have:
- Node.js 16+ and npm
- PostgreSQL 12+ (Neon or local)
- Redis 6+ (local or cloud)
- Git

---

## 🗄️ Step 1: Database Migrations

### 1.1 Run Migration Files

Execute all SQL migration files in your PostgreSQL database:

```bash
# Connect to your database
psql $DATABASE_URL < backend/migrations/001_create_posts_table.sql
psql $DATABASE_URL < backend/migrations/002_create_comments_table.sql
psql $DATABASE_URL < backend/migrations/003_create_likes_table.sql
psql $DATABASE_URL < backend/migrations/004_create_follows_table.sql
psql $DATABASE_URL < backend/migrations/005_create_notifications_table.sql
psql $DATABASE_URL < backend/migrations/006_extend_users_social_columns.sql
```

Or run them all at once:
```bash
for f in backend/migrations/*.sql; do psql $DATABASE_URL < "$f"; done
```

### 1.2 Verify Tables Created

```sql
-- Check new tables exist
\dt posts
\dt comments
\dt likes
\dt follows
\dt notifications

-- Check users table has new columns
\d users
```

---

## 🔧 Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

This adds:
- `redis@^4.6.15` - Redis client
- `socket.io@^4.7.2` - WebSocket server

### 2.2 Update Environment Variables

Add to `.env` file:

```env
# Existing variables
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=8000

# New: Redis (local development)
REDIS_URL=redis://localhost:6379

# Alternative: Redis Cloud
# REDIS_URL=redis://[username]:[password]@[host]:[port]
```

### 2.3 Verify Directory Structure

```
backend/
├── cache/
│   ├── redis.js                    # Redis connection & utilities
│   └── feedCache.js                # Feed caching logic
├── controllers/
│   └── social/
│       ├── postController.js       # Post CRUD + comments
│       ├── likeController.js       # Like/unlike logic
│       ├── followController.js     # Follow/unfollow + lists
│       └── notificationController.js # Notification management
├── models/
│   └── social/
│       ├── Post.js                 # Post model
│       ├── Like.js                 # Like model
│       ├── Comment.js              # Comment model
│       ├── Follow.js               # Follow model
│       └── Notification.js         # Notification model
├── routes/
│   └── social/
│       ├── posts.js                # POST/GET/DELETE /api/posts
│       ├── followers.js            # /api/users/:id/follow
│       └── notifications.js        # /api/notifications
├── sockets/
│   └── socialSocket.js             # Socket.io event handlers
├── server.js                       # Updated with Socket.io + new routes
└── migrations/
    ├── 001_create_posts_table.sql
    ├── 002_create_comments_table.sql
    ├── 003_create_likes_table.sql
    ├── 004_create_follows_table.sql
    ├── 005_create_notifications_table.sql
    └── 006_extend_users_social_columns.sql
```

---

## 🔴 Step 3: Redis Setup

### 3.1 Local Redis (Development)

**Option A: Docker**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Option B: Homebrew (macOS)**
```bash
brew install redis
brew services start redis
```

**Option C: Windows/WSL**
```bash
# Download and install from https://github.com/microsoftarchive/redis/releases
# Or use WSL with: apt-get install redis-server
redis-server
```

### 3.2 Cloud Redis (Production)

Use one of:
- **Redis Cloud**: https://app.rediscloud.com/ (free tier available)
- **AWS ElastiCache**
- **Heroku Redis**

Update `.env`:
```env
REDIS_URL=redis://username:password@host:port
```

### 3.3 Verify Redis Connection

```bash
cd backend
npm run dev
```

Look for output:
```
✅ Connected to Redis
✅ Redis Client Ready
```

---

## 🚀 Step 4: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Connected to Neon postgres database
✅ Connected to Redis
✅ Redis Client Ready
🚀 Server running on port 8000
📡 Socket.io enabled
🔗 WebSocket URL: ws://localhost:8000
```

---

## 💻 Step 5: Frontend Setup

### 5.1 Install Dependencies

```bash
cd frontend/ai-recipe-generator-ui-boilerplate-code
npm install
```

### 5.2 Create Styles Directory

```bash
mkdir -p src/styles
```

The CSS files are already created at:
```
src/styles/
├── SocialFeed.css
├── PostCard.css
├── CreatePost.css
├── FollowButton.css
└── NotificationBadge.css
```

### 5.3 Update Environment Variables

Create/update `frontend/ai-recipe-generator-ui-boilerplate-code/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### 5.4 Initialize Socket.io in Frontend

Create `frontend/ai-recipe-generator-ui-boilerplate-code/src/utils/socket.js`:

```javascript
import io from 'socket.io-client';

let socket = null;

export function initSocket(token) {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Socket.io connected');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket.io error:', error);
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}
```

Update `src/main.jsx` to initialize Socket.io on app load:

```javascript
import { initSocket } from './utils/socket';

// After user logs in:
const token = localStorage.getItem('token');
if (token) {
  initSocket(token);
  window.socket = window.socket || initSocket(token);
}
```

### 5.5 Start Frontend

```bash
npm run dev
```

Access at: `http://localhost:5173`

---

## 📊 API Endpoints - Week 1

### Posts (12 endpoints)

```
POST   /api/posts                    Create post
GET    /api/posts/:id                Get post by ID
DELETE /api/posts/:id                Delete post (owner only)
GET    /api/posts/:id/comments       Get comments (paginated)
POST   /api/posts/:id/comments       Add comment
DELETE /api/comments/:id             Delete comment (owner only)
POST   /api/posts/:id/like           Like post
DELETE /api/posts/:id/like           Unlike post
GET    /api/posts/:id/likes          Get likes list
```

### Followers (4 endpoints)

```
POST   /api/users/:id/follow         Follow user
DELETE /api/users/:id/follow         Unfollow user
GET    /api/users/:id/followers      Get followers list
GET    /api/users/:id/following      Get following list
```

### Notifications (5 endpoints)

```
GET    /api/notifications            Get notifications (paginated)
GET    /api/notifications/unread     Get unread count
PATCH  /api/notifications/:id/read   Mark as read
PATCH  /api/notifications/read-all   Mark all as read
DELETE /api/notifications/:id        Delete notification
```

All endpoints return:
```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

---

## 🧪 Testing the API

### Using curl:

```bash
# Get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password"}'

# Create post
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "recipeId":"recipe-uuid",
    "caption":"This is amazing!",
    "imageUrl":"https://..."
  }'

# Like post
curl -X POST http://localhost:8000/api/posts/post-uuid/like \
  -H "Authorization: Bearer YOUR_TOKEN"

# Follow user
curl -X POST http://localhost:8000/api/users/user-uuid/follow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman:

1. Create `Authorization` header with `Bearer TOKEN`
2. Set `Content-Type: application/json`
3. Test endpoints from the list above

---

## 🔐 Socket.io Events

Real-time events available:

```javascript
// Client connecting
const socket = io('http://localhost:8000', {
  auth: { token: YOUR_TOKEN }
});

// Listen for new notifications
socket.on('notification:new', (data) => {
  console.log('New notification:', data);
});

// Emit typing indicator
socket.emit('typing:start', 'conversation-id');
socket.emit('typing:end', 'conversation-id');

// Listen for activity
socket.on('activity:post', (data) => {
  console.log('New post from followed user:', data);
});
```

---

## 📁 Frontend Components

Ready to use:

```javascript
// Import components
import SocialFeed from './components/SocialFeed';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import FollowButton from './components/FollowButton';
import NotificationBadge from './components/NotificationBadge';

// Use in pages
export default function Dashboard() {
  return (
    <>
      <NotificationBadge />
      <SocialFeed />
    </>
  );
}
```

### Component Props

**FollowButton**
```jsx
<FollowButton 
  userId="user-id" 
  isFollowing={false}
  onFollowChange={(isNowFollowing) => {}}
/>
```

**CreatePost**
```jsx
<CreatePost 
  onPostCreated={(newPost) => {}}
/>
```

**PostCard**
```jsx
<PostCard 
  post={postObject}
  onDeleted={(postId) => {}}
  onUpdated={(updatedPost) => {}}
/>
```

---

## 🔄 Redis Caching Keys

Cached values follow pattern `app:resource:identifier`:

| Key | Content | TTL | When Invalidated |
|---|---|---|---|
| `app:feed:${userId}` | Post IDs for user's feed | 5 min | New post by followed user |
| `app:trending:recipes` | Top 20 recipes | 15 min | Cron job (manually recompute) |
| `app:suggestions:${userId}` | Suggested users | 30 min | Manual invalidation |
| `app:notifications:${userId}:unread` | Unread count | 10 min | On notification read |

---

## 🛠️ Troubleshooting

### Redis Connection Error
```
❌ Redis Client Error: ECONNREFUSED
```
**Solution**: Ensure Redis is running (`redis-server` or `docker run...`)

### Socket.io Not Connecting
```
ERR_INVALID_AUTH
```
**Solution**: Ensure token is passed correctly in `auth: { token }`

### Posts Not Appearing
**Check**:
- JWT token is valid
- User has followed other users to see their posts
- Redis cache isn't stale (clear with `redis-cli FLUSHDB`)

### Missing Columns Error
```
column "follower_count" does not exist
```
**Solution**: Run migration `006_extend_users_social_columns.sql`

---

## 📝 Next Steps (Week 2)

- Add messaging system (conversations, messages)
- Implement Socket.io for real-time messaging
- Add notification WebSocket events
- Build streak tracking system
- Create profile pages

---

## 📚 Full Architecture

```
User → Frontend (React) 
    ↓
    ├→ HTTP/REST for CRUD
    │    ↓
    │    Express Server (Node.js)
    │    ├→ Controllers
    │    ├→ Models (Post, Like, Follow, etc)
    │    └→ PostgreSQL (data)
    │
    └→ WebSocket (Socket.io) for Real-time
         ↓
         Redis (caching/pub-sub)
```

---

## 🎉 You're Ready!

Your social platform infrastructure is now live. Test the API endpoints, build features on top, and scale to the remaining weeks.

**Questions?** Check controller JSDoc comments and model methods for detailed function signatures.

Made with ❤️ for AI Recipe Generator
