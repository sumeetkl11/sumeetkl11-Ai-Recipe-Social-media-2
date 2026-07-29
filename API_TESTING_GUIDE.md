# API Testing Guide - Week 1 Endpoints

## 🔐 Authentication First

All new endpoints require JWT token. Get one by logging in:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "uuid", "email": "test@example.com" }
  }
}
```

**Save the token for subsequent requests:**
```bash
TOKEN="your_token_here"
```

---

## 📝 Posts Endpoints (9 endpoints)

### 1. Create a Post
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recipeId": "recipe-uuid-here",
    "caption": "This recipe changed my life! 🍳",
    "imageUrl": "https://example.com/photo.jpg"
  }'
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "post-uuid",
    "user_id": "user-uuid",
    "recipe_id": "recipe-uuid",
    "caption": "This recipe changed my life! 🍳",
    "image_url": "https://example.com/photo.jpg",
    "like_count": 0,
    "comment_count": 0,
    "created_at": "2024-04-19T10:30:00Z"
  },
  "meta": { "page": 1, "limit": 1, "total": 1 }
}
```

---

### 2. Get Post by ID
```bash
curl -X GET http://localhost:8000/api/posts/post-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Delete Post (own only)
```bash
curl -X DELETE http://localhost:8000/api/posts/post-uuid \
  -H "Authorization: Bearer $TOKEN"
```

**Returns 403 if not owner:**
```json
{
  "success": false,
  "message": "You can only delete your own posts"
}
```

---

### 4. Create Comment
```bash
curl -X POST http://localhost:8000/api/posts/post-uuid/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Great recipe! I made this last night."
  }'
```

**Triggers notification to post owner** ✅

---

### 5. Get Comments (paginated)
```bash
curl -X GET "http://localhost:8000/api/posts/post-uuid/comments?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. Delete Comment (own only)
```bash
curl -X DELETE http://localhost:8000/api/comments/comment-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Like Post
```bash
curl -X POST http://localhost:8000/api/posts/post-uuid/like \
  -H "Authorization: Bearer $TOKEN"
```

**Returns 400 if already liked:**
```json
{
  "success": false,
  "message": "You already liked this post"
}
```

**Triggers notification to post owner** ✅

---

### 8. Unlike Post
```bash
curl -X DELETE http://localhost:8000/api/posts/post-uuid/like \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. Get Likes for Post (paginated)
```bash
curl -X GET "http://localhost:8000/api/posts/post-uuid/likes?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "like-uuid",
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "avatar_url": "https://...",
      "created_at": "2024-04-19T10:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5 }
}
```

---

## 👥 Follow/Followers Endpoints (4 endpoints)

### 1. Follow User
```bash
curl -X POST http://localhost:8000/api/users/target-user-uuid/follow \
  -H "Authorization: Bearer $TOKEN"
```

**Returns 400 if already following:**
```json
{
  "success": false,
  "message": "You are already following this user"
}
```

**Triggers follow notification** ✅

---

### 2. Unfollow User
```bash
curl -X DELETE http://localhost:8000/api/users/target-user-uuid/follow \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Get Followers (paginated)
```bash
curl -X GET "http://localhost:8000/api/users/user-uuid/followers?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "follower-uuid",
      "name": "Jane Smith",
      "avatar_url": "https://...",
      "bio": "Food enthusiast 🍽️",
      "follower_count": 150,
      "following_count": 75
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```

---

### 4. Get Following (paginated)
```bash
curl -X GET "http://localhost:8000/api/users/user-uuid/following?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔔 Notifications Endpoints (5 endpoints)

### 1. Get Notifications (paginated)
```bash
curl -X GET "http://localhost:8000/api/notifications?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "user_id": "your-uuid",
      "actor_id": "other-user-uuid",
      "type": "like",
      "post_id": "post-uuid",
      "comment_id": null,
      "is_read": false,
      "created_at": "2024-04-19T10:30:00Z",
      "actor_name": "John Doe",
      "actor_avatar": "https://..."
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5 }
}
```

---

### 2. Get Unread Count
```bash
curl -X GET http://localhost:8000/api/notifications/unread \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unread_count": 3
  },
  "meta": { "page": 1, "limit": 1, "total": 1 }
}
```

---

### 3. Mark Single Notification as Read
```bash
curl -X PATCH http://localhost:8000/api/notifications/notif-uuid/read \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Mark All Notifications as Read
```bash
curl -X PATCH http://localhost:8000/api/notifications/read-all \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_count": 5
  },
  "meta": { "page": 1, "limit": 1, "total": 5 }
}
```

---

### 5. Delete Notification
```bash
curl -X DELETE http://localhost:8000/api/notifications/notif-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Test Scenarios

### Scenario 1: Create Post & Like Flow
```bash
# 1. Create post
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"recipeId":"recipe-123","caption":"My recipe!"}'

# Save POST_ID from response

# 2. Like the post (as another user)
curl -X POST http://localhost:8000/api/posts/$POST_ID/like \
  -H "Authorization: Bearer $OTHER_TOKEN"

# 3. Check notification was created
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

---

### Scenario 2: Follow & See Feed
```bash
# 1. Follow user
curl -X POST http://localhost:8000/api/users/other-user-uuid/follow \
  -H "Authorization: Bearer $TOKEN"

# 2. Other user creates post
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OTHER_TOKEN" \
  -d '{"recipeId":"recipe-456","caption":"Check this out!"}'

# 3. Your feed should include their post (via SocialFeed component)
```

---

### Scenario 3: Comments & Notifications
```bash
# 1. Get a post
POST_ID="existing-post-uuid"

# 2. Comment on it
curl -X POST http://localhost:8000/api/posts/$POST_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"Amazing recipe!"}'

# 3. Post owner gets notification
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer $POST_OWNER_TOKEN"
```

---

## 🔄 Testing with Postman

### 1. Create Collection
- File → New → Collection
- Name: "AI Recipe Social API"

### 2. Add Requests

**Get Token**
```
POST http://localhost:8000/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Create Post**
```
POST http://localhost:8000/api/posts
Headers:
  Authorization: Bearer {{token}}
Body (JSON):
{
  "recipeId": "{{recipe_id}}",
  "caption": "Test post",
  "imageUrl": ""
}
```

### 3. Set Variables
In Postman, after login, set:
```
POST http://localhost:8000/api/auth/login
Tests tab:
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
```

---

## ✅ Testing Checklist

- [ ] Get token successfully
- [ ] Create post returns 201
- [ ] Like post increments like_count
- [ ] Unlike post decrements like_count
- [ ] Comment creates notification for post owner
- [ ] Follow creates follow notification
- [ ] Unfollow decrements follower_count
- [ ] Get notifications shows all created notifications
- [ ] Mark notification as read changes is_read to true
- [ ] Unread count decreases when marked as read
- [ ] Delete post returns 200
- [ ] Delete post returns 403 if not owner

---

## 🐛 Common Issues & Solutions

**Issue: 401 Unauthorized**
```
Solution: Ensure token is included and valid
- Check: Authorization: Bearer $TOKEN (space required!)
- Check: Token hasn't expired
```

**Issue: 404 Post Not Found**
```
Solution: Verify post UUID exists
- Check: UUID format is valid
- Check: Post belongs to some user (not deleted)
```

**Issue: 400 Already Liked**
```
Solution: Unlike first, then like again
- Endpoint: DELETE /api/posts/{id}/like
```

**Issue: 403 Forbidden (not owner)**
```
Solution: Only owner can delete
- Check: You are the post author
- Check: Same user token used for both create and delete
```

---

## 📊 Response Format (All Endpoints)

Every response follows this format:

```json
{
  "success": true|false,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Success:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "meta": { "page": 1, "limit": 1, "total": 1 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error",
  "meta": { "page": 1, "limit": 1, "total": 1 }
}
```

---

## 🚀 Ready to Test!

All 18 endpoints are live and ready. Start with "Get Token" then test other endpoints.

Good luck! 🎉
