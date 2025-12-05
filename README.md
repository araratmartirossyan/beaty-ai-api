# Beauty License Manager

A RAG (Retrieval-Augmented Generation) backend application with license management capabilities.

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running locally without Docker)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=beauty_db
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# LLM Provider API Keys (set the ones you want to use)
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-google-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Local Development Setup

### Option 1: Using Docker Compose (Recommended)

1. **Start PostgreSQL database only:**
   ```bash
   npm run docker:db
   ```
   Or manually:
   ```bash
   docker-compose up -d postgres
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** with your configuration (see above)

4. **Start the application:**
   ```bash
   npm run dev
   ```

### Option 2: Full Docker Compose Setup

1. **Start all services (PostgreSQL + App):**
   ```bash
   npm run docker:up
   ```
   Or manually:
   ```bash
   docker-compose up
   ```

2. The application will be available at `http://localhost:3000`

### Option 3: Local PostgreSQL

1. **Install and start PostgreSQL locally**

2. **Create the database:**
   ```bash
   createdb beauty_db
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create `.env` file** with your PostgreSQL connection details

5. **Start the application:**
   ```bash
   npm run dev
   ```

## Docker Commands

- `npm run docker:up` - Start all services
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs
- `npm run docker:build` - Build Docker images
- `npm run docker:db` - Start only PostgreSQL database

## Production Deployment

### Building the Docker Image

```bash
docker build -t beauty-app .
```

### Running in Production

1. **Set environment variables** (use a secure method like Docker secrets or environment files)

2. **Run with Docker Compose:**
   ```bash
   NODE_ENV=production docker-compose up -d
   ```

3. **Or run standalone:**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e DB_HOST=your-db-host \
     -e DB_USERNAME=your-db-user \
     -e DB_PASSWORD=your-db-password \
     -e DB_NAME=beauty_db \
     -e JWT_SECRET=your-secret-key \
     beauty-app
   ```

## Database Migrations

The application uses TypeORM with `synchronize: true` in development. For production, you should:

1. Set `NODE_ENV=production` to disable auto-synchronization
2. Use TypeORM migrations for schema changes

## API Documentation

Interactive API documentation is available via Swagger UI at:
- **Development**: `http://localhost:3000/api-docs`

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality for testing endpoints
- Authentication support (Bearer token)

## API Endpoints

- `/auth` - Authentication routes
- `/rag` - RAG service routes
- `/licenses` - License management routes
- `/knowledge-bases` - Knowledge base routes

## Initial Admin Setup

After starting the application for the first time, create the default admin user:

```bash
yarn seed:admin
```

Or with npm:
```bash
npm run seed:admin
```

**Default Admin Credentials:**
- **Email**: `admin@beauty.com`
- **Password**: `admin123`

You can customize these by setting environment variables:
- `ADMIN_EMAIL` - Admin email (default: `admin@beauty.com`)
- `ADMIN_PASSWORD` - Admin password (default: `admin123`)

⚠️ **Important**: Change the default password after first login!

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed:admin` - Create initial admin user

