# Lost & Found Backend API

A scalable, maintainable backend service for the Lost & Found platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Firebase Authentication Integration** - Secure token verification
- **RESTful API** - Clean, well-structured endpoints
- **MongoDB Database** - Flexible schema for items, users, and notifications
- **TypeScript** - Full type safety and better developer experience
- **Service Layer Architecture** - Separation of concerns for maintainability
- **Error Handling** - Comprehensive error management middleware
- **Request Logging** - Built-in request tracking

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 6+
- **Authentication**: Firebase Admin SDK
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
src/
├── config/           # Configuration files (Firebase, Database)
├── middleware/       # Express middleware (Auth, Error, Logging)
├── models/          # Mongoose schemas (User, Item, Notification)
├── routes/          # API route handlers
├── services/        # Business logic layer
└── index.ts         # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance or MongoDB Atlas account
- Firebase project with admin credentials

### Installation

1. Clone the repository and navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables:
- MongoDB connection string
- Firebase credentials
- Frontend URL for CORS

### Running the Server

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Items
- `GET /api/items` - List items (with filters)
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item (auth required)
- `PUT /api/items/:id` - Update item (auth required)
- `DELETE /api/items/:id` - Delete item (auth required)
- `POST /api/items/:id/claim` - Claim/recover item
- `GET /api/items/user/:userId` - Get user's items

### Search
- `GET /api/search` - Advanced search with filters
- `GET /api/search/nearby` - Find items near location

### Notifications
- `GET /api/notifications/preferences` - Get notification settings
- `PUT /api/notifications/preferences` - Update settings
- `POST /api/notifications/send-test` - Send test email

## Database Schema

### Users
```
{
  _id: String (Firebase UID)
  email: String
  displayName: String
  profileImage: String
  location: String
  notificationPreferences: Object
  stats: {
    itemsPosted: Number
    itemsRecovered: Number
    itemsClaimed: Number
  }
}
```

### Items
```
{
  _id: ObjectId
  itemType: "Lost" | "Found"
  title: String
  description: String
  category: String
  location: String
  coordinates: { lat, lng }
  dateLost: Date
  images: [String]
  userId: String (Firebase UID)
  status: "active" | "recovered" | "claimed"
  claimedBy: String
  claimedAt: Date
}
```

## Security

- Firebase token verification on protected routes
- CORS restricted to frontend domain
- Helmet for HTTP headers security
- Input validation and sanitization
- Environment variables for sensitive data

## Deployment

### Vercel Functions

The backend is designed to work with Vercel serverless functions:

1. Create `api/` folder structure in the frontend project
2. Configure environment variables in Vercel dashboard
3. Deploy using `vercel deploy`

### MongoDB Atlas

1. Create a cluster on MongoDB Atlas
2. Add IP whitelist for Vercel
3. Get connection string and add to `.env`

## Monitoring & Logging

- Request logging with method, path, status, and duration
- Error tracking with stack traces in development
- Built-in logging middleware for all requests

## Future Enhancements

- Redis caching for frequently accessed data
- Advanced matching algorithm
- Email notification service integration
- User analytics and reporting
- Geospatial query optimization
- API documentation with Swagger
- Unit and integration tests

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Use meaningful commit messages
4. Update API documentation

## License

MIT
