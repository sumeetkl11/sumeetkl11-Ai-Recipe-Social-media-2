# Backend API Implementation Guide

## Status: Frontend Complete ✅ | Backend Implementation Required 🔄

All frontend components are ready. Backend needs to implement **30+ API endpoints** and **10+ Socket.io events**.

---

## 📋 API Endpoints Required

### 1. Posts/Social (8 endpoints)

```javascript
// GET /api/posts - Get paginated feed posts
Query: ?page=1&limit=10
Response: { success: true, data: [...], meta: { page, limit, total } }
Auth: Required (Bearer token)

// POST /api/posts - Create new post
Body: { recipeId, caption, imageUrl? }
Response: { success: true, data: { id, recipeId, caption, ... } }
Auth: Required

// DELETE /api/posts/:id - Delete own post
Response: { success: true, message: "Post deleted" }
Auth: Required (own user only)

// POST /api/posts/:id/like - Like a post
Response: { success: true, data: { liked: true, likeCount: 15 } }
Auth: Required

// DELETE /api/posts/:id/like - Unlike a post
Response: { success: true, data: { liked: false, likeCount: 14 } }
Auth: Required

// POST /api/posts/:id/comments - Add comment
Body: { content }
Response: { success: true, data: { id, content, userId, createdAt, ... } }
Auth: Required

// GET /api/posts/:id/comments - Get comments
Query: ?page=1&limit=20
Response: { success: true, data: [...] }
Auth: Optional

// DELETE /api/posts/:id/comments/:commentId - Delete comment
Response: { success: true, message: "Comment deleted" }
Auth: Required (own user only)
```

### 2. Users/Profiles (6 endpoints)

```javascript
// GET /api/users/:id/profile - Get user profile
Response: { success: true, data: { id, name, email, bio, avatar, ... } }
Auth: Optional

// GET /api/users/:id/stats - Get user statistics
Response: {
  success: true,
  data: {
    recipeCount: 45,
    followerCount: 120,
    followingCount: 85,
    totalLikes: 420,
    streak: 7
  }
}
Auth: Optional

// GET /api/users/:id/posts - Get user's posts
Query: ?page=1&limit=10
Response: { success: true, data: [...], meta: { ... } }
Auth: Optional

// GET /api/users/:id/collections - Get user's collections
Response: { success: true, data: [...] }
Auth: Optional

// POST /api/users/:id/follow - Follow user
Response: { success: true, data: { following: true } }
Auth: Required

// DELETE /api/users/:id/follow - Unfollow user
Response: { success: true, data: { following: false } }
Auth: Required
```

### 3. Challenges (5 endpoints)

```javascript
// GET /api/challenges - Get all active challenges
Query: ?page=1&limit=10&status=active
Response: {
  success: true,
  data: [{
    id, name, description, theme_tag, startDate, endDate,
    entryCount, totalVotes, isJoined, ...
  }],
  meta: { ... }
}
Auth: Optional

// POST /api/challenges/:id/enter - Join challenge
Body: { recipeId }
Response: { success: true, data: { entryId, position: 15 } }
Auth: Required

// GET /api/challenges/:id/leaderboard - Get challenge results
Query: ?page=1&limit=50
Response: {
  success: true,
  data: [{
    rank: 1,
    userId, userName, recipeId, recipeName,
    voteCount: 128, userVoted: true, ...
  }]
}
Auth: Optional

// POST /api/challenges/:id/entries/:entryId/vote - Vote for entry
Response: { success: true, data: { voteCount: 129 } }
Auth: Required (once per user per entry)

// GET /api/challenges/:id/entries - Get user entries in challenge
Response: { success: true, data: [...] }
Auth: Required
```

### 4. Collections (6 endpoints)

```javascript
// GET /api/collections - Get user's collections
Query: ?userId=:id&limit=10
Response: { success: true, data: [...] }
Auth: Optional

// POST /api/collections - Create new collection
Body: { name, description?, isPublic? }
Response: { success: true, data: { id, name, userId, ... } }
Auth: Required

// GET /api/collections/:id - Get collection with recipes
Response: {
  success: true,
  data: {
    id, name, userId, userName, recipeCount, recipes: [...]
  }
}
Auth: Optional

// PUT /api/collections/:id - Update collection
Body: { name?, description?, isPublic? }
Response: { success: true, data: { ... } }
Auth: Required (owner only)

// POST /api/collections/:id/recipes - Add recipe to collection
Body: { recipeId }
Response: { success: true, message: "Recipe added" }
Auth: Required (owner only)

// DELETE /api/collections/:id/recipes/:recipeId - Remove recipe
Response: { success: true, message: "Recipe removed" }
Auth: Required (owner only)
```

### 5. Messaging (5 endpoints)

```javascript
// GET /api/conversations - Get user's conversations
Query: ?limit=20
Response: {
  success: true,
  data: [{
    id, otherUserId, otherUserName, lastMessage,
    lastMessageTime, unreadCount, ...
  }]
}
Auth: Required

// GET /api/conversations/:id - Get conversation details with messages
Query: ?page=1&limit=50
Response: {
  success: true,
  data: {
    id, participantIds, messages: [
      { id, senderId, senderName, content, timestamp, read, ... }
    ],
    meta: { ... }
  }
}
Auth: Required (participant only)

// POST /api/conversations/:id/messages - Send message
Body: { content }
Response: { success: true, data: { id, content, timestamp, ... } }
Auth: Required (participant only)

// PUT /api/conversations/:id/messages/:messageId/read - Mark as read
Response: { success: true }
Auth: Required

// DELETE /api/conversations/:id - Delete/archive conversation
Response: { success: true }
Auth: Required (participant only)
```

### 6. Trending/Discovery (3 endpoints)

```javascript
// GET /api/trending/recipes - Get trending recipes
Query: ?limit=10&timeframe=week
Response: {
  success: true,
  data: [{
    id, userId, name, description, image,
    likeVelocity: 15, // likes in last 24h
    totalLikes: 120, ...
  }]
}
Auth: Optional

// GET /api/trending/users - Get trending users
Query: ?limit=10
Response: { success: true, data: [{ id, name, avatar, followCount, ... }] }
Auth: Optional

// GET /api/recommendations - Get personalized recommendations
Response: {
  success: true,
  data: [{
    reason: "following", // or "liked", "similar"
    recipes: [...]
  }]
}
Auth: Required
```

### 7. Notifications (2 endpoints)

```javascript
// GET /api/notifications - Get user's notifications
Query: ?unreadOnly=false&limit=20&page=1
Response: {
  success: true,
  data: [{
    id, type: "like|comment|follow",
    actor: { id, name, avatar },
    targetId, message, read, timestamp, ...
  }],
  meta: { unreadCount: 5 }
}
Auth: Required

// PUT /api/notifications/:id/read - Mark notification as read
Response: { success: true }
Auth: Required
```

### 8. Streaks (1 endpoint)

```javascript
// GET /api/streaks/me - Get current user's streak
Response: {
  success: true,
  data: {
    currentStreak: 7,
    longestStreak: 21,
    lastCookDate: "2024-01-15",
    nextResetTime: "2024-01-16T00:00:00Z"
  }
}
Auth: Required
```

---

## 🔌 Socket.io Events Required

### Emit (Server sends to Client)

```javascript
// Connection & Status
'connection:success'
  // Sent on successful connection
  // Data: { userId, email, isAuthenticated }

'user:online'
  // User came online
  // Data: { userId, timestamp }

'user:offline'
  // User went offline
  // Data: { userId, timestamp }

// Posts & Engagement
'post:created'
  // New post in feed
  // Data: { post: { id, userId, caption, ... } }

'post:liked'
  // Post was liked
  // Data: { postId, userId, likeCount }

'post:unliked'
  // Post was unliked
  // Data: { postId, userId, likeCount }

'post:deleted'
  // Post was removed
  // Data: { postId }

'comment:added'
  // New comment on post
  // Data: { postId, comment: { id, userId, content, ... } }

'comment:deleted'
  // Comment removed
  // Data: { postId, commentId }

// Messaging
'message:new'
  // New message in conversation
  // Data: { conversationId, message: { id, senderId, content, timestamp } }

'message:read'
  // Message marked as read
  // Data: { messageId, readAt }

'typing:start'
  // User started typing
  // Data: { conversationId, userId, userName }

'typing:stop'
  // User stopped typing
  // Data: { conversationId, userId }

// User Actions
'user:followed'
  // User was followed
  // Data: { followerId, followerName }

'user:unfollowed'
  // User was unfollowed
  // Data: { followerId }

'challenge:joined'
  // User joined challenge
  // Data: { challengeId, userId, entryId }

// Notifications
'notification:new'
  // New notification
  // Data: {
  //   id, type: "like|comment|follow",
  //   actor: { id, name },
  //   message, timestamp
  // }
```

### Listen (Client sends, Server receives)

```javascript
// Acknowledge connection
'echo' or 'ping'
  // Test message - server responds with 'pong'

'typing:start'
  // Client started typing in conversation
  // Data: { conversationId }

'typing:stop'
  // Client stopped typing
  // Data: { conversationId }

'mark:read'
  // Mark message as read
  // Data: { messageId, conversationId }

'message:new'
  // New message (backup - also use HTTP POST)
  // Data: { conversationId, content }
```

---

## 🔄 Response Format (Standard)

All endpoints should follow this format:

```javascript
// Success Response
{
  success: true,
  data: { /* actual data */ },
  meta: {
    page: 1,
    limit: 10,
    total: 45,
    hasMore: true
  }
}

// Error Response
{
  success: false,
  message: "Error description",
  statusCode: 400
}

// List Response with Pagination
{
  success: true,
  data: [ /* array of items */ ],
  meta: {
    page: 1,
    limit: 10,
    total: 120,
    totalPages: 12,
    hasMore: true
  }
}
```

---

## 🔐 Authentication

All endpoints requiring auth should:
1. Extract `Authorization: Bearer {token}` header
2. Verify JWT signature
3. Set `req.user = { id, email }`
4. Return 401 if missing/invalid token

```javascript
// Middleware pattern (already implemented in auth.js)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ success: false });
  }
};
```

---

## 📊 Database Migrations Already Done

The following tables exist (migrations already applied):
- `users`
- `posts`
- `comments`
- `likes`
- `follows`
- `user_preferences`
- `challenges`
- `challenge_entries`
- `challenge_votes`
- `collections`
- `collection_recipes`
- `conversations`
- `messages`
- `notifications`
- `cooking_streaks`

---

## 🎯 Implementation Priority

### Phase 1 (Critical - Start Here)
1. **Posts endpoints** (8) - Core feed functionality
2. **Users endpoints** (6) - Profile viewing
3. **Challenges endpoints** (5) - Challenge features
4. **Collections endpoints** (6) - Collection management

### Phase 2 (Important)
5. **Messaging endpoints** (5) - DM functionality
6. **Trending endpoints** (3) - Discovery
7. **Notifications endpoints** (2) - Alerts
8. **Streaks endpoints** (1) - Tracking

### Phase 3 (Real-time)
- Socket.io event handlers (match emits/listens above)
- Test with frontend components

---

## 🧪 Testing Each Endpoint

Use Thunder Client or Postman:

```
1. Start backend: npm run dev
2. Login to get token
3. Add header: Authorization: Bearer {token}
4. Test each endpoint
5. Check response format matches above
```

---

## 📝 Next Steps

1. **Review Controllers** - Check existing patterns in `controllers/` directory
2. **Create Missing Endpoints** - Use pattern from existing controllers
3. **Test with Frontend** - Frontend components will test your APIs
4. **Add Socket.io** - Emit events when data changes
5. **Deploy & Scale** - Add Redis caching, optimize queries

---

**Total Endpoints:** 30+  
**Total Socket.io Events:** 10+  
**Frontend Status:** ✅ Complete and ready  
**Backend Status:** 🔄 Implementation required  

Start with the Phase 1 endpoints for maximum impact!
