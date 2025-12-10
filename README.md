# File Analyzer Frontend

Next.js application for file management and analysis.

## Quick Start

```bash
# Using Docker Compose
docker-compose up -d

# Or local development
npm install
npm run dev
```

## Environment

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Features

- File upload (single & batch)
- File analysis & metadata
- Image conversion (JPEG, PNG, WebP)
- Image compression, resize, crop
- PDF text extraction
- File statistics
- Duplicate detection
- Batch operations

## Tech Stack

- Next.js 15, React 19, TypeScript 5
- Tailwind CSS
- Lucide React (icons)
