# 🌍 LifeMesh Backend Architecture Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Clean Architecture Principles](#clean-architecture-principles)
3. [Package Structure](#package-structure)
4. [Layer-by-Layer Explanation](#layer-by-layer-explanation)
5. [Data Flow](#data-flow)
6. [File-by-File Breakdown](#file-by-file-breakdown)
7. [SOLID Principles Applied](#solid-principles-applied)
8. [Design Patterns Used](#design-patterns-used)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Testing Strategy](#testing-strategy)

---

## 🎯 Project Overview

LifeMesh is a **local community network app** that connects neighbors for help, donations, events, and social interactions. The backend follows **Clean Architecture** principles to ensure maintainability, testability, and scalability.

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** MySQL with Prisma ORM
- **Authentication:** JWT tokens
- **Validation:** Zod runtime validation
- **Language:** TypeScript
- **Architecture:** Clean Architecture + Domain-Driven Design

---

## 🏗️ Clean Architecture Principles

Our backend follows Uncle Bob's Clean Architecture:

```
┌─────────────────────────────────────────┐
│           🌐 HTTP Layer (API Routes)     │  ← External Interface
├─────────────────────────────────────────┤
│           💼 Use Cases (Business Logic)  │  ← Application Layer
├─────────────────────────────────────────┤
│           📋 Entities (Domain Models)    │  ← Core Domain
├─────────────────────────────────────────┤
│           🏪 Repository Interfaces       │  ← Abstract Contracts
├─────────────────────────────────────────┤
│           🗄️ Database Implementation     │  ← Infrastructure
└─────────────────────────────────────────┘
```

**Core Principles:**
- **Dependency Inversion:** Inner layers don't depend on outer layers
- **Single Responsibility:** Each class has one reason to change
- **Testability:** Business logic is isolated and easily testable
- **Flexibility:** Can swap implementations without changing business logic

---

## 📁 Package Structure

```
lifemesh-backend/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   └── 📁 api/                # HTTP API endpoints
│   │       ├── 📁 auth/           # Authentication endpoints
│   │       ├── 📁 posts/          # Post CRUD endpoints
│   │       └── 📁 users/          # User management endpoints
│   │
│   ├── 📁 core/                   # 🧠 Business Logic (Domain Layer)
│   │   ├── 📁 entities/           # Domain models & interfaces
│   │   ├── 📁 interfaces/         # Repository contracts
│   │   └── 📁 use-cases/          # Business operations
│   │
│   ├── 📁 data/                   # 🗄️ Data Access Layer
│   │   └── 📁 repositories/       # Database implementations
│   │
│   ├── 📁 infrastructure/         # 🔌 Dependency Injection
│   │   └── container.ts           # Wires everything together
│   │
│   ├── 📁 services/               # 🛠️ External Services
│   │   ├── jwt.service.ts         # JWT token handling
│   │   └── cloudinary.service.ts  # Image upload service
│   │
│   └── 📁 utils/                  # 🔧 Shared Utilities
│       ├── api-response.ts        # HTTP response helpers
│       └── validation.ts          # Input validation schemas
│
├── 📁 prisma/                     # Database Schema & Migrations
│   └── schema.prisma              # Database model definitions
│
├── 📄 package.json                # Dependencies & scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 next.config.js             # Next.js configuration
└── 📄 .env                       # Environment variables
```

---

## 🎯 Layer-by-Layer Explanation

### 1. 🌐 HTTP Layer (`src/app/api/`)

**Responsibility:** Handle HTTP requests and responses

```typescript
// Example: POST /api/posts
export async function POST(request: NextRequest) {
  // 1. Authentication & Authorization
  // 2. Input validation
  // 3. Call use case
  // 4. Return formatted response
}
```

**Key Files:**
- `auth/login/route.ts` - User authentication
- `auth/register/route.ts` - User registration
- `posts/route.ts` - Post CRUD operations
- `users/me/route.ts` - User profile management

**What this layer does:**
- ✅ Validates JWT tokens
- ✅ Parses and validates input data
- ✅ Calls appropriate use cases
- ✅ Formats responses with proper HTTP status codes
- ✅ Handles errors and returns meaningful messages

**What this layer does NOT do:**
- ❌ Business logic (that's in use cases)
- ❌ Database operations (that's in repositories)
- ❌ Complex data transformations

### 2. 💼 Use Cases Layer (`src/core/use-cases/`)

**Responsibility:** Implement business rules and orchestrate operations

```typescript
export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    // 1. Validate business rules
    // 2. Apply domain logic
    // 3. Coordinate with repositories
    // 4. Return business result
  }
}
```

**Key Files:**
- `create-post.use-case.ts` - Post creation logic
- `get-posts.use-case.ts` - Post retrieval with filtering
- `register-user.use-case.ts` - User registration logic
- `login-user.use-case.ts` - Authentication logic

**Business Rules Examples:**
- Post titles must be 1-200 characters
- Users can only edit their own posts
- Location coordinates must be valid
- Posts expire after set time if specified

### 3. 📋 Entities Layer (`src/core/entities/`)

**Responsibility:** Define domain models and data structures

```typescript
export interface Post {
  id: string;
  title: string;
  content: string;
  category: Category;
  authorId: string;
  createdAt: Date;
  // ... other properties
}
```

**Key Files:**
- `post.entity.ts` - Post domain model
- `user.entity.ts` - User domain model

**Different Interface Types:**
- `Post` - Complete entity with all fields
- `CreatePostData` - Data needed to create
- `UpdatePostData` - Data that can be modified
- `PostPreview` - Lightweight version for lists

### 4. 🏪 Repository Interfaces (`src/core/interfaces/`)

**Responsibility:** Define contracts for data access

```typescript
export interface PostRepository {
  create(data: CreatePostData): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  update(id: string, data: UpdatePostData): Promise<Post>;
  delete(id: string): Promise<void>;
  findMany(options?: FindPostsOptions): Promise<PostsResult>;
}
```

**Key Files:**
- `post-repository.interface.ts` - Post data access contract
- `user-repository.interface.ts` - User data access contract

**Why Interfaces:**
- 🧪 **Testability:** Can mock for unit tests
- 🔄 **Flexibility:** Can swap database implementations
- 📝 **Documentation:** Clear contract of what's available
- 🎯 **Dependency Inversion:** Use cases depend on abstractions

### 5. 🗄️ Data Layer (`src/data/repositories/`)

**Responsibility:** Implement database operations

```typescript
export class PrismaPostRepository implements PostRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePostData): Promise<Post> {
    return await this.prisma.post.create({
      data: { /* mapped data */ }
    });
  }
}
```

**Key Files:**
- `prisma-post.repository.ts` - Post database operations
- `prisma-user.repository.ts` - User database operations

**Responsibilities:**
- 🔄 Translate domain models to database schema
- 🛡️ Handle database errors gracefully
- 📊 Implement complex queries (filtering, pagination)
- 🧮 Optimize database performance

### 6. 🔌 Infrastructure Layer (`src/infrastructure/`)

**Responsibility:** Dependency injection and service configuration

```typescript
export const container = {
  // Database
  prisma,
  
  // Repositories
  userRepository,
  postRepository,
  
  // Use Cases
  createPostUseCase,
  getPostsUseCase,
  loginUserUseCase,
  
  // Services
  jwtService,
  imageUploadService,
};
```

**What the container does:**
- 🎯 **Single place** to configure all dependencies
- 🔌 **Wires together** all the layers
- 🧪 **Makes testing easy** by allowing dependency injection
- 📊 **Clear dependency graph** showing how components relate

---

## 🔄 Data Flow

### Creating a Post - Complete Flow

```
1. 📱 Frontend → POST /api/posts
   ├── Headers: Authorization: Bearer <jwt>
   └── Body: { title, content, category, ... }

2. 🌐 HTTP Layer (route.ts)
   ├── Validates JWT token
   ├── Validates input with Zod schema
   └── Calls → container.createPostUseCase.execute()

3. 💼 Use Case (create-post.use-case.ts)
   ├── Validates business rules
   ├── Applies domain logic
   └── Calls → postRepository.create()

4. 🏪 Repository Interface
   └── Defines contract for data operations

5. 🗄️ Database Implementation (prisma-post.repository.ts)
   ├── Maps domain data to database schema
   ├── Executes SQL via Prisma
   └── Returns domain entity

6. ⬆️ Response flows back up
   ├── Repository → Use Case
   ├── Use Case → HTTP Layer
   └── HTTP Layer → Frontend
```

### Getting Posts - Complete Flow

```
1. 📱 Frontend → GET /api/posts?category=HELP_REQUEST&page=1
2. 🌐 HTTP Layer → Parses query parameters
3. 💼 Use Case → Applies pagination logic
4. 🗄️ Repository → Builds dynamic SQL query
5. 📊 Database → Returns paginated results
6. ⬆️ Response → Formatted with pagination metadata
```

---

## 📄 File-by-File Breakdown

### Core Domain Files

#### `src/core/entities/post.entity.ts`
```typescript
// Defines what a Post IS in business terms
export interface Post {
  id: string;
  title: string;
  content: string;
  category: Category;
  // ... all post properties
}

// Defines what's needed to CREATE a post
export interface CreatePostData {
  title: string;
  content: string;
  category: Category;
  authorId: string;
  // ... creation requirements
}
```

#### `src/core/interfaces/post-repository.interface.ts`
```typescript
// Contract for post data operations
export interface PostRepository {
  create(data: CreatePostData): Promise<Post>;
  findMany(options?: FindPostsOptions): Promise<PostsResult>;
  // ... other operations
}
```

#### `src/core/use-cases/create-post.use-case.ts`
```typescript
// Business logic for creating posts
export class CreatePostUseCase {
  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    // 1. Validate input
    // 2. Apply business rules
    // 3. Create post via repository
    // 4. Return result
  }
}
```

### Infrastructure Files

#### `src/data/repositories/prisma-post.repository.ts`
```typescript
// Concrete implementation using Prisma
export class PrismaPostRepository implements PostRepository {
  async create(data: CreatePostData): Promise<Post> {
    // Transform domain data to database format
    // Execute database operation
    // Return domain entity
  }
}
```

#### `src/infrastructure/container.ts`
```typescript
// Dependency injection container
export const container = {
  // All dependencies wired together
  createPostUseCase: new CreatePostUseCase(postRepository),
  postRepository: new PrismaPostRepository(prisma),
  // ...
};
```

### API Layer Files

#### `src/app/api/posts/route.ts`
```typescript
// HTTP endpoints for post operations
export async function POST(request: NextRequest) {
  // Handle post creation
}

export async function GET(request: NextRequest) {
  // Handle post retrieval
}

export async function PUT(request: NextRequest) {
  // Handle post updates
}

export async function DELETE(request: NextRequest) {
  // Handle post deletion
}
```

---

## 🎯 SOLID Principles Applied

### Single Responsibility Principle (SRP)
- **CreatePostUseCase:** Only handles post creation logic
- **PostRepository:** Only handles post data access
- **JWT Service:** Only handles token operations

### Open/Closed Principle (OCP)
- Can add new post types without modifying existing code
- Can add new validation rules by extending schemas
- Can add new repositories without changing use cases

### Liskov Substitution Principle (LSP)
- Any implementation of `PostRepository` can replace another
- Mock repositories can substitute real ones in tests

### Interface Segregation Principle (ISP)
- Small, focused interfaces like `PostRepository`
- Clients depend only on methods they use

### Dependency Inversion Principle (DIP)
- Use cases depend on `PostRepository` interface, not concrete `PrismaPostRepository`
- High-level modules don't depend on low-level modules

---

## 🎨 Design Patterns Used

### 1. Repository Pattern
```typescript
interface PostRepository {
  // Abstract data access
}

class PrismaPostRepository implements PostRepository {
  // Concrete implementation
}
```

### 2. Dependency Injection
```typescript
class CreatePostUseCase {
  constructor(private postRepo: PostRepository) {}
  // Dependencies injected, not created
}
```

### 3. Use Case Pattern
```typescript
class CreatePostUseCase {
  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    // Single business operation
  }
}
```

### 4. Factory Pattern (Container)
```typescript
export const container = {
  // Factory for creating configured objects
  createPostUseCase: new CreatePostUseCase(postRepository),
};
```

---

## 🌐 API Endpoints Reference

### Authentication Endpoints
```
POST   /api/auth/register    # Create new user account
POST   /api/auth/login       # Authenticate user
```

### User Management Endpoints
```
GET    /api/users/me         # Get current user profile
PUT    /api/users/me         # Update user profile
POST   /api/users/me/avatar  # Upload user avatar
DELETE /api/users/me/avatar  # Remove user avatar
```

### Post Management Endpoints
```
POST   /api/posts            # Create new post
GET    /api/posts            # Get posts (with filtering/pagination)
PUT    /api/posts?id={id}    # Update specific post
DELETE /api/posts?id={id}    # Delete specific post
```

### Query Parameters for GET /api/posts
```
?page=1                      # Page number (default: 1)
?pageSize=20                 # Posts per page (default: 20, max: 100)
?category=HELP_REQUEST       # Filter by category
?search=groceries            # Search in title/content
?sortBy=newest               # Sort order (newest, oldest, mostLiked, mostViewed)
?authorId={uuid}             # Posts by specific user
```

### Request/Response Examples

#### Create Post
```json
POST /api/posts
Authorization: Bearer <jwt-token>

{
  "title": "Need help with groceries",
  "content": "Can someone help me carry groceries?",
  "category": "HELP_REQUEST",
  "imageUrls": ["https://example.com/image.jpg"],
  "latitude": 45.764043,
  "longitude": 21.228072,
  "address": "Hunedoara, Romania"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid-here",
      "title": "Need help with groceries",
      "content": "Can someone help me carry groceries?",
      "category": "HELP_REQUEST",
      "authorId": "user-uuid",
      "upvotes": 0,
      "downvotes": 0,
      "createdAt": "2024-01-20T10:30:00Z"
    }
  },
  "message": "Post created successfully"
}
```

---

## 🧪 Testing Strategy

### Unit Testing Structure
```
tests/
├── unit/
│   ├── use-cases/
│   │   ├── create-post.use-case.test.ts
│   │   └── get-posts.use-case.test.ts
│   ├── repositories/
│   │   └── prisma-post.repository.test.ts
│   └── services/
│       └── jwt.service.test.ts
├── integration/
│   └── api/
│       └── posts.integration.test.ts
└── e2e/
    └── post-flow.e2e.test.ts
```

### Testing Approach

#### 1. Unit Tests (Use Cases)
```typescript
describe('CreatePostUseCase', () => {
  it('should create post with valid data', async () => {
    // Arrange
    const mockRepository = createMockPostRepository();
    const useCase = new CreatePostUseCase(mockRepository);
    
    // Act
    const result = await useCase.execute(validPostData);
    
    // Assert
    expect(result.post.title).toBe(validPostData.title);
  });
});
```

#### 2. Integration Tests (API)
```typescript
describe('POST /api/posts', () => {
  it('should create post when authenticated', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPostData);
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Mock Strategies

#### Repository Mocking
```typescript
const mockPostRepository: PostRepository = {
  create: jest.fn().mockResolvedValue(mockPost),
  findById: jest.fn().mockResolvedValue(mockPost),
  // ... other methods
};
```

#### Database Mocking
```typescript
// Use test database or in-memory database
const testPrisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } }
});
```

---

## 🚀 Getting Started

### Prerequisites
1. Node.js 18+
2. MySQL database
3. Environment variables configured

### Installation
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL="mysql://user:password@localhost:3306/lifemesh"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 🎯 Key Benefits of This Architecture

### 1. **Maintainability**
- Clear separation of concerns
- Each layer has specific responsibilities
- Easy to locate and fix bugs

### 2. **Testability**
- Business logic isolated from external dependencies
- Can mock any layer for testing
- Fast unit tests without database

### 3. **Scalability**
- Easy to add new features
- Can optimize individual layers
- Horizontal scaling possible

### 4. **Flexibility**
- Can swap database implementations
- Can add new authentication methods
- Can support multiple frontends

### 5. **Security**
- Input validation at multiple layers
- Authentication and authorization centralized
- Business rules enforced consistently

---

## 📚 Next Steps for Learning

### 1. **Explore Advanced Patterns**
- Event sourcing for audit trails
- CQRS for read/write separation
- Domain events for loose coupling

### 2. **Add More Features**
- Real-time updates with WebSockets
- Caching layer with Redis
- Message queues for background processing

### 3. **Improve Observability**
- Structured logging
- Metrics and monitoring
- Distributed tracing

### 4. **Enhance Security**
- Rate limiting
- Input sanitization
- CORS configuration

---

## 🤝 Contributing

When adding new features:

1. **Start with the domain** - Define entities and business rules
2. **Create interfaces** - Define contracts for data access
3. **Implement use cases** - Add business logic
4. **Add repository implementation** - Handle data persistence
5. **Create API endpoints** - Expose functionality via HTTP
6. **Wire in container** - Configure dependencies
7. **Add tests** - Ensure quality and prevent regressions

---

This architecture provides a solid foundation for building scalable, maintainable applications. Each layer serves a specific purpose, and the separation of concerns makes the codebase easy to understand, test, and extend.

Happy coding! 🚀