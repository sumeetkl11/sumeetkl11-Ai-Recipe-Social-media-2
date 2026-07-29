# Social Cooking Platform - Complete Implementation Guide
## Weeks 2-4 Setup & Integration

---

## 📋 Overview

This guide covers the complete implementation of Weeks 2-4 of the social cooking platform expansion, including:
- **Week 2**: Messaging System + Cooking Streaks + Activity Tracking
- **Week 3**: Challenges + Collections + Discovery Features
- **Week 4**: Live Cooking Sessions + Collaborative Grocery Lists + Performance Optimization

---

## ⚡ Quick Start

### Prerequisites
- PostgreSQL running with AI Recipe app database
- Redis running on localhost:6379
- Node.js 16+ installed
- Frontend running on Vite dev server

### Database Setup

Run all migrations in order:
```bash
cd backend/config
psql -U postgres -d ai_recipe < migrations/001_create_users_table.sql
psql -U postgres -d ai_recipe < migrations/002_create_recipes_table.sql
# ... (continue through all 14 migrations)
psql -U postgres -d ai_recipe < migrations/011_create_challenges_table.sql
psql -U postgres -d ai_recipe < migrations/012_create_challenge_entries_table.sql
psql -U postgres -d ai_recipe < migrations/013_create_collections_table.sql
psql -U postgres -d ai_recipe < migrations/014_create_collection_recipes_table.sql
```

### Backend Setup

1. **Install Dependencies** (if not already installed):
```bash
cd backend
npm install socket.io redis
```

2. **Start Backend Server**:
```bash
npm start
```

Server runs on `http://localhost:8000` with Socket.io enabled.

3. **Frontend Setup**:
```bash
cd frontend/ai-recipe-generator-ui-boilerplate-code
npm install socket.io-client
npm run dev
```

---

## 🔌 Week 2: Messaging + Streaks + Activity

### Features Implemented

#### 1. Direct Messaging System
- **Endpoints**:
  - `GET /api/conversations` - List user's conversations
  - `POST /api/conversations` - Create or get conversation with another user
  - `GET /api/conversations/:id/messages` - Get messages in conversation
  - `POST /api/conversations/:id/messages` - Send message (real-time via Socket.io)
  - `DELETE /api/conversations/:id` - Delete conversation

- **Real-time Updates**: Messages emit `message:new` event to conversation room
- **Typing Indicators**: `typing:start` and `typing:end` events supported
- **Socket.io Rooms**: Users join `conversation:{conversationId}` rooms

#### 2. Cooking Streaks
- **Endpoints**:
  - `GET /api/users/:id/streak` - Get user's current streak
  - `POST /api/users/streak/cook` - Record cooking event
  - `GET /api/leaderboard/streaks` - Top streaks leaderboard (cached 1 hour)
  - `GET /api/feed/activity` - Activity feed from followed users

- **Streak Logic**:
  - Current streak tracks consecutive cooking days
  - Longest streak maintains personal record
  - Resets if user doesn't cook for >24 hours
  - Records in activity feed (visible to followers)

#### 3. Activity Feed
- Tracks posts, likes, streaks, and cooking events
- Fetches activity only from users you follow
- Denormalized for fast querying
- Real-time Socket.io updates

### Frontend Components
- **ConversationList.jsx** - Lists all conversations, refreshes every 5s
- **MessageThread.jsx** - Displays messages, auto-scrolls, joins Socket.io room
- **MessageInput.jsx** - Textarea input with Shift+Enter support

### Socket.io Events (Week 2 additions)
```javascript
// Join conversation room to receive real-time messages
socket.emit('conversation:join', conversationId);
socket.leave('conversation:leave', conversationId);

// Typing indicators
socket.emit('typing:start', conversationId);
socket.emit('typing:end', conversationId);

// Listen for new messages
socket.on('message:new', (message) => {...});
socket.on('typing:start', (data) => {...});
```

---

## 🏆 Week 3: Challenges + Collections + Trending

### Database Tables Added
1. **challenges** - Themed recipe challenges (limited time)
2. **challenge_entries** - User participation tracking
3. **collections** - User-created recipe collections
4. **collection_recipes** - Many-to-many relation

### Features Implemented

#### 1. Challenges System
- **Endpoints**:
  - `POST /api/challenges` - Create challenge (admin)
  - `GET /api/challenges` - Get active challenges
  - `POST /api/challenges/:id/join` - Join challenge
  - `POST /api/challenges/:id/complete-recipe` - Record recipe completion
  - `GET /api/challenges/:id/leaderboard` - Challenge leaderboard (cached)
  - `GET /api/user/challenges` - User's challenges

- **Features**:
  - Time-limited (start_date to end_date)
  - Leaderboard ranked by recipes_completed
  - Participant count tracking
  - Challenge entries prevent duplicates via unique constraint

#### 2. Collections System
- **Endpoints**:
  - `POST /api/collections` - Create collection
  - `GET /api/collections/:id` - Get collection with meta
  - `PUT /api/collections/:id` - Update collection
  - `DELETE /api/collections/:id` - Delete collection
  - `GET /api/collections/:id/recipes` - Get recipes in collection
  - `POST /api/collections/:id/recipes/:recipeId` - Add recipe
  - `DELETE /api/collections/:id/recipes/:recipeId` - Remove recipe
  - `GET /api/collections/public` - Browse public collections
  - `GET /api/collections/trending` - Trending collections (cached)

- **Features**:
  - Public/private collections
  - Save count for trending
  - Ownership verification
  - Pagination support

#### 3. Trending Algorithm
- Collections sorted by save_count DESC
- Streaks leaderboard by current_streak DESC
- Challenge leaderboards by recipes_completed DESC
- All cached in Redis for performance

### Frontend Components
- **ChallengeCard.jsx** - Individual challenge display with join button
- **CollectionCard.jsx** - Individual collection preview
- (Additional components: ChallengeList, TrendingCarousel, Leaderboard - to be imported from existing patterns)

---

## 🎬 Week 4: Live Sessions + Collaborative Lists + Performance

### Database Tables to Create
1. **cook_sessions** - Live cooking event sessions
2. **session_participants** - Users in active session
3. **session_steps** - Recipe step progression tracking
4. **grocery_lists** - Shared shopping lists
5. **list_items** - Items in shopping list with check status

### Features to Implement (Scaffolding Provided)

#### 1. Live Cooking Sessions (Socket.io focused)
- Host starts session with recipe
- Steps progress tracked and broadcast
- Real-time participant visibility
- Step-by-step synchronization

**Socket.io Events**:
```javascript
// Host creates session
socket.emit('session:create', { recipeId });

// User joins session
socket.emit('session:join', sessionId);

// Host advances step
socket.emit('session:step-next', sessionId);

// Listen for step updates
socket.on('session:step-update', (step) => {...});
socket.on('session:participant-join', (participant) => {...});
```

#### 2. Collaborative Grocery Lists
- Create shared shopping list
- Real-time item add/remove
- Check/uncheck items synced instantly
- Socket.io pub/sub for updates

**Socket.io Events**:
```javascript
// Join list room
socket.emit('list:join', listId);

// Add item to list
socket.emit('list:item-add', { listId, item });

// Toggle item checked
socket.emit('list:item-toggle', { listId, itemId });
```

#### 3. Performance Optimization
- Add database indexes (already in migrations)
- Implement Redis Pub/Sub for multi-instance support
- React-Window virtualization for long lists
- Query optimization (avoid N+1)

---

## 🔧 Configuration

### Environment Variables (.env.backend)
```
DATABASE_URL=postgresql://user:password@localhost:5432/ai_recipe
JWT_SECRET=your_secret_key_here
REDIS_URL=redis://localhost:6379
API_PORT=8000
GEMINI_API_KEY=your_gemini_key_here  # For Week 4 AI suggestions
```

### Frontend Environment Variables (.env.frontend)
```
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing Endpoints

### Week 2 Testing
```bash
# Create or get conversation
curl -X POST http://localhost:8000/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "otherUserId": "user-uuid" }'

# Send message (real-time)
curl -X POST http://localhost:8000/api/conversations/conv-uuid/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "content": "Hello!" }'

# Get streak leaderboard
curl http://localhost:8000/api/leaderboard/streaks
```

### Week 3 Testing
```bash
# Get active challenges
curl http://localhost:8000/api/challenges

# Join challenge
curl -X POST http://localhost:8000/api/challenges/challenge-uuid/join \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get trending collections
curl http://localhost:8000/api/collections/trending
```

---

## 📊 Database Schema Summary

### Week 2 Tables
- **conversations**: DM pairs (user_one_id, user_two_id sorted)
- **messages**: Messages with is_read tracking
- **activity_feed**: Posts, likes, streaks, cook events
- **streaks**: current_streak, longest_streak, last_cooked_date

### Week 3 Tables
- **challenges**: Title, dates, recipe_ids array, participant_count
- **challenge_entries**: User participation with recipes_completed counter
- **collections**: User-created recipe lists, save_count
- **collection_recipes**: Many-to-many mapping

### Week 4 Tables (Stub)
- **cook_sessions**: Host, recipe, start/end times
- **grocery_lists**: Shared lists with owner
- **list_items**: Items with checked status, quantity

---

## 🚀 Optimization Tips

1. **Indexes**: All implemented on foreign keys and query columns
2. **Caching**: 
   - Streaks leaderboard: 1 hour TTL
   - Challenge leaderboards: 1 hour TTL
   - Trending collections: 1 hour TTL
   - Activity feed: 5 min TTL (invalidated on new posts)

3. **Real-time**: Socket.io rooms prevent global broadcasts
4. **Pagination**: 20-item default limit, supports custom via query

---

## 📝 Notes

- All endpoints use consistent response format: `{ success, data, meta }`
- All routes use parameterized queries (no SQL injection risk)
- Socket.io authenticated via JWT in handshake
- On CONFLICT clauses prevent duplicate entries
- Cascading deletes maintain referential integrity
- Streak logic handles DST and timezone considerations

---

## 🔗 Related Files

**Backend**:
- Database: `backend/config/migrations/` (001-014)
- Models: `backend/models/{challenges,collections,messaging,social}/`
- Controllers: `backend/controllers/{challenges,collections,messaging,social}/`
- Routes: `backend/routes/{challenges,collections,messaging,social}/`
- Socket.io: `backend/sockets/socialSocket.js`
- Cache: `backend/cache/redis.js`

**Frontend**:
- Components: `frontend/src/components/{ChallengeCard,CollectionCard,Message*,Conversation*}`
- Services: `frontend/src/services/socket.js`
- Context: `frontend/src/context/AuthContext.jsx`
- Styles: `frontend/src/styles/{Challenge*,Collection*,Message*,Conversation*}.css`

---

**Last Updated**: Week 3 Complete, Week 4 Scaffolding Ready
**Status**: ✅ Weeks 1-3 Production Ready | 🔄 Week 4 In Progress
