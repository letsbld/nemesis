# Integration Plan: Browser Session Service

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │ Your Backend │ ──────> │ Guacamole Service│ ──────> │  Guacamole  │
│  (React/Vue)│         │ (Auth Proxy) │         │   (This Service) │         │   (VNC/RDP) │
└─────────────┘         └──────────────┘         └──────────────────┘         └─────────────┘
     │                          │                           │
     │                          │                           │
     └──────────────────────────┴───────────────────────────┘
                    (Session URLs for direct access)
```

**Flow:**
1. Frontend calls your Backend API (with user authentication)
2. Your Backend verifies auth and proxies request to Guacamole Service
3. Guacamole Service creates Docker container and returns session URLs
4. Frontend receives session URLs and can embed/redirect users
5. Admin can view sessions using read-only URLs

---

## Part 1: APIs Your Backend Needs to Call (Guacamole Service)

Your backend will act as a proxy between your frontend and the Guacamole Service. These are the APIs your backend needs to call.

### Base URL
```
http://localhost:8080  (or your Guacamole Service URL)
```

### 1. Create Browser Session

**Endpoint:** `POST /api/v1/sessions`

**Request:**
```json
{
  "target_url": "https://example.com",
  "username": "user@example.com",
  "password": "secretpassword"
}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "access_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000",
  "admin_view_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000?readonly=true",
  "expires_at": "2024-01-01T12:00:00Z"
}
```

**Your Backend Implementation:**
```javascript
// Example: Node.js/Express
async function createBrowserSession(targetUrl, username, password) {
  const response = await fetch('http://localhost:8080/api/v1/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target_url: targetUrl,
      username: username,
      password: password
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  
  return await response.json();
}
```

---

### 2. Delete Browser Session

**Endpoint:** `DELETE /api/v1/sessions/{session_id}`

**Response:** `204 No Content`

**Your Backend Implementation:**
```javascript
async function deleteBrowserSession(sessionId) {
  const response = await fetch(`http://localhost:8080/api/v1/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  
  return response.status === 204;
}
```

---

### 3. Get Session Health/Status

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "active_sessions": 5,
  "containers": 5
}
```

**Your Backend Implementation:**
```javascript
async function getServiceHealth() {
  const response = await fetch('http://localhost:8080/health');
  return await response.json();
}
```

---

## Part 2: APIs Your Frontend Needs to Call (Your Backend)

Your frontend should call YOUR backend (not directly to Guacamole Service). Your backend will handle authentication and proxy to Guacamole Service.

### Base URL
```
https://your-api.com/api/v1  (your backend URL)
```

### 1. Create Browser Session (User)

**Endpoint:** `POST /api/v1/browser-sessions`

**Headers:**
```
Authorization: Bearer {user_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "target_url": "https://facebook.com",
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "access_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000",
  "admin_view_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000?readonly=true",
  "expires_at": "2024-01-01T12:00:00Z",
  "created_at": "2024-01-01T11:00:00Z"
}
```

**Frontend Implementation:**
```javascript
// React example
async function createSession(targetUrl, username, password) {
  const response = await fetch('/api/v1/browser-sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      target_url: targetUrl,
      username: username,
      password: password
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  
  return await response.json();
}
```

---

### 2. List User's Active Sessions

**Endpoint:** `GET /api/v1/browser-sessions`

**Headers:**
```
Authorization: Bearer {user_jwt_token}
```

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "target_url": "https://facebook.com",
      "username": "user@example.com",
      "access_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000",
      "admin_view_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000?readonly=true",
      "created_at": "2024-01-01T11:00:00Z",
      "expires_at": "2024-01-01T12:00:00Z",
      "is_active": true
    }
  ],
  "total": 1
}
```

**Frontend Implementation:**
```javascript
async function getUserSessions() {
  const response = await fetch('/api/v1/browser-sessions', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  return await response.json();
}
```

---

### 3. Get Single Session

**Endpoint:** `GET /api/v1/browser-sessions/{session_id}`

**Headers:**
```
Authorization: Bearer {user_jwt_token}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "target_url": "https://facebook.com",
  "username": "user@example.com",
  "access_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000",
  "admin_view_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000?readonly=true",
  "created_at": "2024-01-01T11:00:00Z",
  "expires_at": "2024-01-01T12:00:00Z",
  "is_active": true
}
```

---

### 4. Delete Session

**Endpoint:** `DELETE /api/v1/browser-sessions/{session_id}`

**Headers:**
```
Authorization: Bearer {user_jwt_token}
```

**Response:** `204 No Content`

**Frontend Implementation:**
```javascript
async function deleteSession(sessionId) {
  const response = await fetch(`/api/v1/browser-sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  return response.status === 204;
}
```

---

## Part 3: Admin Panel APIs (Your Backend)

### 1. List All Sessions (Admin Only)

**Endpoint:** `GET /api/v1/admin/browser-sessions`

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `user_id` (optional): Filter by user ID

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-123",
      "user_email": "user@example.com",
      "target_url": "https://facebook.com",
      "username": "user@example.com",
      "access_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000",
      "admin_view_url": "http://localhost:8080/session/550e8400-e29b-41d4-a716-446655440000?readonly=true",
      "created_at": "2024-01-01T11:00:00Z",
      "expires_at": "2024-01-01T12:00:00Z",
      "is_active": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

**Frontend Implementation:**
```javascript
async function getAllSessions(page = 1, limit = 20) {
  const response = await fetch(`/api/v1/admin/browser-sessions?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    }
  });
  
  return await response.json();
}
```

---

### 2. Get Session Details (Admin)

**Endpoint:** `GET /api/v1/admin/browser-sessions/{session_id}`

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Response:** Same as user session detail, but includes user information.

---

### 3. Delete Any Session (Admin)

**Endpoint:** `DELETE /api/v1/admin/browser-sessions/{session_id}`

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Response:** `204 No Content`

---

## Part 4: Backend Implementation Guide

### Your Backend Endpoints to Implement

#### 1. User Session Management

```javascript
// POST /api/v1/browser-sessions
// - Verify user JWT token
// - Extract user_id from token
// - Call Guacamole Service: POST /api/v1/sessions
// - Store session in your database (link to user_id)
// - Return session data to frontend

// GET /api/v1/browser-sessions
// - Verify user JWT token
// - Get user_id from token
// - Query your database for user's sessions
// - Optionally check with Guacamole Service health endpoint
// - Return list of sessions

// GET /api/v1/browser-sessions/:id
// - Verify user JWT token
// - Verify session belongs to user
// - Return session details

// DELETE /api/v1/browser-sessions/:id
// - Verify user JWT token
// - Verify session belongs to user
// - Call Guacamole Service: DELETE /api/v1/sessions/:id
// - Delete from your database
// - Return 204
```

#### 2. Admin Session Management

```javascript
// GET /api/v1/admin/browser-sessions
// - Verify admin JWT token
// - Query all sessions from database
// - Return paginated list

// GET /api/v1/admin/browser-sessions/:id
// - Verify admin JWT token
// - Get session from database
// - Return session details

// DELETE /api/v1/admin/browser-sessions/:id
// - Verify admin JWT token
// - Call Guacamole Service: DELETE /api/v1/sessions/:id
// - Delete from database
// - Return 204
```

### Database Schema (Your Backend)

```sql
-- Sessions table in your database
CREATE TABLE browser_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    session_id VARCHAR(255) UNIQUE NOT NULL,  -- From Guacamole Service
    target_url VARCHAR(500) NOT NULL,
    username VARCHAR(255) NOT NULL,
    access_url VARCHAR(500) NOT NULL,
    admin_view_url VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_expires_at (expires_at)
);
```

### Backend Proxy Example (Node.js/Express)

```javascript
const express = require('express');
const router = express.Router();
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

const GUACAMOLE_SERVICE_URL = process.env.GUACAMOLE_SERVICE_URL || 'http://localhost:8080';

// Create session (User)
router.post('/browser-sessions', authenticateUser, async (req, res) => {
  try {
    const { target_url, username, password } = req.body;
    const userId = req.user.id; // From JWT token
    
    // Call Guacamole Service
    const response = await fetch(`${GUACAMOLE_SERVICE_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_url, username, password })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    
    const sessionData = await response.json();
    
    // Store in your database
    const dbSession = await db.browserSessions.create({
      user_id: userId,
      session_id: sessionData.session_id,
      target_url: sessionData.target_url || target_url,
      username: username,
      access_url: sessionData.access_url,
      admin_view_url: sessionData.admin_view_url,
      expires_at: new Date(sessionData.expires_at)
    });
    
    res.status(201).json(sessionData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List user sessions
router.get('/browser-sessions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await db.browserSessions.findAll({
      where: { 
        user_id: userId,
        expires_at: { [Op.gt]: new Date() } // Only active sessions
      },
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      sessions: sessions.map(s => ({
        session_id: s.session_id,
        target_url: s.target_url,
        username: s.username,
        access_url: s.access_url,
        admin_view_url: s.admin_view_url,
        created_at: s.created_at,
        expires_at: s.expires_at,
        is_active: new Date() < s.expires_at
      })),
      total: sessions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session (User)
router.delete('/browser-sessions/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verify session belongs to user
    const session = await db.browserSessions.findOne({
      where: { session_id: id, user_id: userId }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Delete from Guacamole Service
    await fetch(`${GUACAMOLE_SERVICE_URL}/api/v1/sessions/${id}`, {
      method: 'DELETE'
    });
    
    // Delete from database
    await db.browserSessions.destroy({
      where: { session_id: id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: List all sessions
router.get('/admin/browser-sessions', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (user_id) where.user_id = user_id;
    
    const { count, rows: sessions } = await db.browserSessions.findAndCountAll({
      where,
      include: [{ model: db.users, attributes: ['id', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      sessions: sessions.map(s => ({
        session_id: s.session_id,
        user_id: s.user_id,
        user_email: s.user?.email,
        target_url: s.target_url,
        username: s.username,
        access_url: s.access_url,
        admin_view_url: s.admin_view_url,
        created_at: s.created_at,
        expires_at: s.expires_at,
        is_active: new Date() < s.expires_at
      })),
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## Part 5: Frontend Implementation Guide

### Frontend Components Needed

#### 1. Create Session Form Component

```jsx
// CreateSessionForm.jsx
import { useState } from 'react';

function CreateSessionForm({ onSessionCreated }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/browser-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_url: targetUrl,
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();
      onSessionCreated(session);
      
      // Reset form
      setTargetUrl('');
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        placeholder="Target URL (e.g., https://facebook.com)"
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Session'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

#### 2. Session List Component

```jsx
// SessionList.jsx
import { useState, useEffect } from 'react';

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/v1/browser-sessions', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await fetch(`/api/v1/browser-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      loadSessions(); // Reload list
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const openSession = (accessUrl) => {
    window.open(accessUrl, '_blank', 'width=1200,height=800');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="session-list">
      <h2>My Browser Sessions</h2>
      {sessions.length === 0 ? (
        <p>No active sessions</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Target URL</th>
              <th>Username</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.session_id}>
                <td>{session.target_url}</td>
                <td>{session.username}</td>
                <td>{new Date(session.created_at).toLocaleString()}</td>
                <td>{new Date(session.expires_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => openSession(session.access_url)}>
                    Open
                  </button>
                  <button onClick={() => handleDelete(session.session_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

#### 3. Browser Session Embed Component

```jsx
// BrowserSessionEmbed.jsx
function BrowserSessionEmbed({ accessUrl }) {
  return (
    <div className="browser-session-container">
      <iframe
        src={accessUrl}
        width="100%"
        height="800px"
        frameBorder="0"
        title="Browser Session"
      />
    </div>
  );
}
```

#### 4. Admin Panel Component

```jsx
// AdminSessionPanel.jsx
import { useState, useEffect } from 'react';

function AdminSessionPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSessions();
  }, [page]);

  const loadSessions = async () => {
    try {
      const response = await fetch(`/api/v1/admin/browser-sessions?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReadOnlyView = (adminViewUrl) => {
    window.open(adminViewUrl, '_blank', 'width=1200,height=800');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-panel">
      <h2>All Browser Sessions</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Target URL</th>
            <th>Username</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session.session_id}>
              <td>{session.user_email}</td>
              <td>{session.target_url}</td>
              <td>{session.username}</td>
              <td>{new Date(session.created_at).toLocaleString()}</td>
              <td>{new Date(session.expires_at).toLocaleString()}</td>
              <td>
                <button onClick={() => openReadOnlyView(session.admin_view_url)}>
                  View (Read-Only)
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Part 6: Integration Flow

### User Flow

1. **User Creates Session:**
   ```
   Frontend → POST /api/v1/browser-sessions (with JWT)
   Your Backend → Verify JWT → POST /api/v1/sessions (Guacamole Service)
   Guacamole Service → Creates Docker container → Returns session URLs
   Your Backend → Stores in database → Returns to Frontend
   Frontend → Shows session with "Open" button
   ```

2. **User Opens Session:**
   ```
   User clicks "Open" → Opens access_url in new window/iframe
   Browser → GET /session/{id} (Guacamole Service)
   Guacamole Service → Generates token → Redirects to Guacamole
   Guacamole → Shows locked-down browser session
   ```

3. **User Deletes Session:**
   ```
   Frontend → DELETE /api/v1/browser-sessions/{id} (with JWT)
   Your Backend → Verify JWT → Verify ownership → DELETE /api/v1/sessions/{id} (Guacamole Service)
   Guacamole Service → Stops container → Returns 204
   Your Backend → Deletes from database → Returns 204
   Frontend → Removes from list
   ```

### Admin Flow

1. **Admin Views All Sessions:**
   ```
   Frontend → GET /api/v1/admin/browser-sessions (with Admin JWT)
   Your Backend → Verify Admin JWT → Query database → Return all sessions
   Frontend → Shows table with all sessions
   ```

2. **Admin Views Session (Read-Only):**
   ```
   Admin clicks "View" → Opens admin_view_url in new window
   Browser → GET /session/{id}?readonly=true (Guacamole Service)
   Guacamole Service → Generates read-only token → Redirects to Guacamole
   Guacamole → Shows read-only browser session (no input)
   ```

---

## Part 7: Security Considerations

### 1. Authentication & Authorization

- **User Sessions:** Only users can create/view/delete their own sessions
- **Admin Access:** Admins can view all sessions but only in read-only mode
- **JWT Tokens:** Use secure JWT tokens with expiration
- **Token Validation:** Always validate tokens in your backend before proxying

### 2. Session URLs

- **Access URLs:** Should be accessible without authentication (handled by Guacamole Service)
- **Admin View URLs:** Should be accessible without authentication (read-only mode enforced)
- **Session IDs:** Are UUIDs (cryptographically random)

### 3. Data Protection

- **Credentials:** Never store passwords in your database (only in Guacamole Service session)
- **Session Storage:** Store only metadata (session_id, URLs, timestamps)
- **HTTPS:** Use HTTPS in production for all API calls

### 4. Rate Limiting

- Implement rate limiting on your backend endpoints
- Prevent abuse of session creation
- Monitor for suspicious activity

---

## Part 8: Environment Variables

### Your Backend (.env)

```bash
# Guacamole Service Configuration
GUACAMOLE_SERVICE_URL=http://localhost:8080

# Your Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h

# Admin Configuration
ADMIN_EMAIL=admin@example.com
```

### Guacamole Service (.env)

```bash
# Already configured in Guacamole Service
GUACAMOLE_SECRET=your-secret-key
SERVER_PORT=8080
GUACAMOLE_URL=http://localhost:8081
SESSION_TTL=60
```

---

## Part 9: Error Handling

### Common Errors

1. **Session Creation Failed:**
   - Check Guacamole Service is running
   - Check Docker is running
   - Check network connectivity

2. **Session Not Found:**
   - Session may have expired
   - Session may have been deleted
   - Check session_id is correct

3. **Authentication Failed:**
   - Verify JWT token is valid
   - Check token expiration
   - Verify user has permissions

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Part 10: Testing Checklist

### Backend Testing

- [ ] Create session endpoint works
- [ ] List sessions endpoint works
- [ ] Delete session endpoint works
- [ ] Admin endpoints require admin token
- [ ] User can only see own sessions
- [ ] Session expiration is handled
- [ ] Database cleanup on session deletion

### Frontend Testing

- [ ] Create session form works
- [ ] Session list displays correctly
- [ ] Opening session works (new window/iframe)
- [ ] Delete session works
- [ ] Admin panel shows all sessions
- [ ] Admin read-only view works
- [ ] Error messages display correctly
- [ ] Loading states work

### Integration Testing

- [ ] End-to-end session creation flow
- [ ] End-to-end session access flow
- [ ] End-to-end session deletion flow
- [ ] Admin read-only view flow
- [ ] Session expiration handling
- [ ] Multiple concurrent sessions

---

## Summary

### Quick Reference

**Your Backend → Guacamole Service:**
- `POST /api/v1/sessions` - Create session
- `DELETE /api/v1/sessions/{id}` - Delete session
- `GET /health` - Health check

**Frontend → Your Backend:**
- `POST /api/v1/browser-sessions` - Create session (User)
- `GET /api/v1/browser-sessions` - List sessions (User)
- `GET /api/v1/browser-sessions/{id}` - Get session (User)
- `DELETE /api/v1/browser-sessions/{id}` - Delete session (User)
- `GET /api/v1/admin/browser-sessions` - List all sessions (Admin)
- `GET /api/v1/admin/browser-sessions/{id}` - Get session (Admin)
- `DELETE /api/v1/admin/browser-sessions/{id}` - Delete session (Admin)

**Direct Access (No Auth Required):**
- `GET /session/{id}` - Interactive session (from Guacamole Service)
- `GET /session/{id}?readonly=true` - Read-only session (from Guacamole Service)

---

This integration plan provides everything you need to integrate the browser session service into your existing frontend and backend architecture.

