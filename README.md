# File Analyzer Frontend

Next.js application for file management and analysis.

## Quick Start

### Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Running with Docker Compose

```bash
# 1. Create .env.local file (see Environment section below)

# 2. Start the frontend service
docker-compose up -d

# 3. View logs
docker-compose logs -f frontend

# 4. Stop the service
docker-compose down
```

The frontend will be available at `http://localhost:3000`

## Environment

Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note:** 
- `NEXT_PUBLIC_API_URL` should point to your backend API URL
- For local development: `http://localhost:3001`
- For production: Use your ALB URL or domain name

## Features

- File upload (single & batch)
- File analysis & metadata
- Image conversion (JPEG, PNG, WebP)
- Image compression, resize, crop
- PDF text extraction
- File statistics
- Duplicate detection
- Batch operations

## Building Docker Image

### Build for Local Testing

```bash
# Build the image
docker build -t fileanalyzer-frontend:latest .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001 \
  -e NODE_ENV=production \
  fileanalyzer-frontend:latest
```

### Build and Push to ECR (AWS)

```bash
# 1. Authenticate Docker to ECR
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# 2. Build the image
docker build -t frontend-repo:latest .

# 3. Tag for ECR
docker tag frontend-repo:latest \
  <account-id>.dkr.ecr.<region>.amazonaws.com/frontend-repo:latest

# 4. Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/frontend-repo:latest

# Optional: Tag with Git commit SHA
COMMIT_SHA=$(git rev-parse --short HEAD)
docker tag frontend-repo:latest \
  <account-id>.dkr.ecr.<region>.amazonaws.com/frontend-repo:$COMMIT_SHA
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/frontend-repo:$COMMIT_SHA
```

**Replace:**
- `<account-id>` with your AWS account ID
- `<region>` with your AWS region (e.g., `us-east-1`)

## Tech Stack

- Next.js 15, React 19, TypeScript 5
- Tailwind CSS
- Lucide React (icons)
