# Security Training Frontend

This is the frontend application for the Security Training Portal. It's built with React, Vite, and Tailwind CSS.

## Features

- **Header-based Authentication**: No login page for employees - authentication is handled via headers from the DLP backend
- **Employee Dashboard**: View and start training modules
- **Interactive Quiz**: Take quizzes with progress tracking
- **Quiz Review**: Review results with explanations
- **Certificate Generation**: View and download completion certificates
- **Admin Dashboard**: Manage employees and view statistics (requires admin login)

## Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the `frontend` directory (optional):
   ```env
   VITE_API_URL=http://localhost:5001
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```

## Docker Setup

The frontend can be run using Docker for consistent deployment across environments.

### Prerequisites
- Docker installed and running
- Docker Compose (for combined frontend + backend setup)

### Using Docker Compose (Recommended)

The frontend is included in the root `docker-compose.yml` file. To run both frontend and backend together:

```bash
# From the root directory
docker-compose up -d --build
```

The frontend will be available at `http://localhost:3000`

### Using Docker Standalone

To build and run the frontend container independently:

1. **Build the Docker image**
   ```bash
   cd frontend
   docker build -t security-training-frontend .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     -p 3000:80 \
     --name security-training-frontend \
     security-training-frontend
   ```

3. **With custom API URL** (if backend is on different host)
   ```bash
   docker build --build-arg VITE_API_URL=http://your-backend-url:5001 -t security-training-frontend .
   ```

### Docker Configuration

The frontend Dockerfile uses a multi-stage build:

1. **Builder Stage**: 
   - Uses Node.js 20 Alpine
   - Installs dependencies
   - Builds the React application with Vite

2. **Production Stage**:
   - Uses nginx Alpine
   - Serves the built static files
   - Includes nginx configuration for SPA routing and API proxying

### Environment Variables

- `VITE_API_URL` (optional): Backend API URL. If not set, uses relative URLs (nginx will proxy)

### Docker Commands

```bash
# Build the image
docker build -t security-training-frontend .

# Run the container
docker run -p 3000:80 security-training-frontend

# View logs
docker logs security-training-frontend

# Stop the container
docker stop security-training-frontend

# Remove the container
docker rm security-training-frontend
```

### Nginx Configuration

The frontend uses nginx to serve the application. The `nginx.conf` file includes:
- SPA routing support (all routes serve `index.html`)
- API request proxying to backend
- Static asset caching
- Security headers
- Health check endpoint at `/health`

### Health Checks

The container includes a health check that verifies nginx is serving the application:
```bash
# Check health
curl http://localhost:3000/health
```

## Authentication

### Employee Authentication (Header-based)

Employees are authenticated via headers sent from the DLP backend. The frontend supports three methods:

1. **URL Parameters**: `?userId=123&username=John`
2. **localStorage**: Set by parent window
   ```javascript
   localStorage.setItem('dlp_user_id', '123');
   localStorage.setItem('dlp_username', 'John');
   ```
3. **postMessage**: For iframe embedding
   ```javascript
   window.postMessage({
     type: 'DLP_AUTH',
     userId: '123',
     username: 'John'
   }, '*');
   ```

### Admin Authentication

Admins use the login page at `/admin/login` with username and password.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminProtectedRoute.jsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── Certificate.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── Quiz.jsx
│   │   └── QuizReview.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5001` (configurable via `VITE_API_URL`).

All API requests automatically include:
- `x-user-id` header (from DLP backend)
- `x-username` header (from DLP backend)
- `Authorization` header (for admin requests)

## Routes

- `/` - Root redirect (checks auth and redirects)
- `/dashboard` - Employee dashboard (protected)
- `/quiz/:sessionId` - Quiz page (protected)
- `/quiz/:sessionId/review` - Quiz review page (protected)
- `/certificate/:resultId` - Certificate page (protected)
- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)

## Development

The app uses:
- **React 18** - UI library
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Troubleshooting

### Authentication Issues

If you see "Authentication Required" error:
1. Ensure you're accessing through the DLP backend
2. Check that user ID is being passed via headers, URL params, or localStorage
3. Verify the backend is running and accessible

### API Connection Issues

1. Check `VITE_API_URL` is set correctly
2. Verify backend is running on the configured port
3. Check browser console for CORS errors
4. Ensure headers are being forwarded correctly

### Build Issues

1. Ensure all dependencies are installed: `npm install`
2. Check Node.js version (requires Node 16+)
3. Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Docker Issues

**Container won't start:**
- Check logs: `docker logs security-training-frontend`
- Verify port 3000 is not already in use
- Ensure Docker is running

**Build fails:**
- Check Node.js version compatibility
- Clear Docker build cache: `docker builder prune`
- Verify all files are present (package.json, etc.)

**Frontend can't connect to backend:**
- If using Docker Compose, ensure backend service is running
- Check nginx logs: `docker logs security-training-frontend`
- Verify API proxy configuration in `nginx.conf`
- For standalone Docker, ensure `VITE_API_URL` is set correctly during build

**404 errors on routes:**
- This is normal for SPAs - nginx should serve `index.html` for all routes
- Verify `nginx.conf` has the correct `try_files` directive


