# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeUnite is a social network backend that connects people and opportunities, specifically targeting athletes and companies. Built with Spring Boot 3.x and Java 17+, using PostgreSQL database and JWT authentication.

## Common Commands

### Running the Application
```bash
# Run with Maven wrapper
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

### Testing
```bash
# Run all tests
./mvnw test

# Run a specific test class
./mvnw test -Dtest=ClassNameTest

# Run a specific test method
./mvnw test -Dtest=ClassNameTest#methodName
```

### Building
```bash
# Clean and package
./mvnw clean package

# Skip tests
./mvnw clean package -DskipTests
```

### Code Quality
```bash
# Lint Java files (via npm script)
npm run lint

# Format Java files (via npm script)
npm run format
```

### Database
The application uses PostgreSQL. Ensure the database `weunite` exists:
```sql
CREATE DATABASE weunite;
```

## Architecture

### Domain Model Structure

The application uses **Single Table Inheritance** for the User hierarchy:
- **User** (base class): Common user fields (name, username, email, password, profileImg, bannerImg, bio, roles)
- **Athlete** (extends User): CPF, height, weight, footDomain, position, birthDate, skills, subscriptions
- **Company** (extends User): CNPJ, opportunities

All users share the `tb_user` table with a `dtype` discriminator column ("USER", "ATHLETE", "COMPANY").

### Key Domain Entities

**Users & Social Features:**
- `User`, `Athlete`, `Company`: User types with inheritance
- `Role`: User authorization roles (stored in `tb_user_roles` join table)
- `Follow`: Many-to-many self-referencing relationship for followers/following
- `Post`: User-generated content with images
- `Comment`: Comments on posts
- `Like`: Likes on posts

**Opportunities System:**
- `Opportunity`: Job/opportunity postings created by companies with required skills and end dates
- `Skill`: Reusable skills that can be associated with both Athletes and Opportunities (many-to-many)
- `Subscriber`: Athletes subscribing to opportunities

### Authentication & Security

- **JWT Authentication** using RSA256 asymmetric keys (public/private key pair)
- Keys are stored base64-encoded in environment variables (`JWT_PUBLIC_KEY`, `JWT_PRIVATE_KEY`)
- JwtConfig at `config/JwtConfig.java` handles key loading and JWT encoder/decoder beans
- Spring Security configured with OAuth2 Resource Server
- Email verification system with tokens that expire

### Image Upload System (Cloudinary)

The application has a sophisticated image handling system documented in `CLOUDINARY_IMAGE_STANDARDS.md`:

**Image Types:**
1. **Profile Images**: 400x400px square with face-focused cropping (`gravity: face`)
2. **Banner Images**: 300px height, proportional width
3. **Post Images**: Adaptive sizing based on orientation
   - Horizontal (width > height): 1280x720px max
   - Vertical (height ≥ width): 375x500px max (controlled for feed)

**Folder Structure in Cloudinary:**
- `posts/{userId}/` - Post images
- `profile/{username}/` - Profile photos
- `banner/{username}/` - Banner images

**CloudinaryService** methods handle uploads with automatic transformations and tagging.

### Package Structure

```
com.example.weuniteauth/
├── config/          # Configuration beans (JWT, Security, CORS, Cloudinary, Database)
├── controller/      # REST endpoints (Auth, User, Post, Comment, Like, Follow, Opportunity, Subscriber)
├── domain/          # JPA entities
│   ├── users/       # User, Athlete, Company, Role, Follow
│   ├── post/        # Post, Comment, Like
│   └── opportunity/ # Opportunity, Skill, Subscriber
├── dto/             # Data Transfer Objects for API requests/responses
├── exceptions/      # Custom exception classes
├── handler/         # Exception handlers
├── mapper/          # MapStruct mappers (DTO ↔ Entity conversion)
├── repository/      # JPA repositories (Spring Data JPA)
├── response/        # Response wrapper classes
├── service/         # Business logic
│   ├── jwt/         # JwtService for token generation
│   ├── mail/        # Email service for verification emails
│   └── cloudinary/  # CloudinaryService for image uploads
└── validations/     # Custom validation annotations
```

### Key Technologies & Libraries

- **MapStruct 1.5.5**: DTO-Entity mapping with annotation processors
- **Lombok**: Reduces boilerplate with @Getter/@Setter/@NoArgsConstructor
- **Spring Security + OAuth2**: JWT-based authentication
- **Spring Data JPA**: Database operations
- **Cloudinary**: Image upload and transformation
- **Spring Boot Mail**: Email verification
- **SpringDoc OpenAPI**: API documentation at `/swagger-ui.html`
- **spring-dotenv**: Loads `.env` file for configuration

### Environment Configuration

Required environment variables (see `.env.example`):
- `JWT_PUBLIC_KEY` / `JWT_PRIVATE_KEY`: RSA key pair for JWT signing
- `DB_USERNAME` / `DB_PASSWORD`: PostgreSQL credentials
- `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_PORT`: SMTP email settings
- `CLOUDINARY_URL`: Cloudinary connection string

Application properties use `${env.VARIABLE_NAME}` syntax to reference .env variables.

## Commit Conventions

This project uses Conventional Commits enforced by commitlint and husky:
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(opportunity): add skill filtering to opportunity search`

## API Endpoints

The application runs on `http://localhost:8080` by default.

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/forgot-password` - Password reset

**Posts:**
- `POST /api/posts/create/{userId}` - Create post with image
- `GET /api/posts/get/{postId}` - Get post
- `PUT /api/posts/update/{userId}/{postId}` - Update post
- `DELETE /api/posts/delete/{userId}/{postId}` - Delete post

**Users:**
- `GET /api/users/{userId}` - Get user
- `PUT /api/users/{userId}` - Update user

**Opportunities:**
- `POST /api/opportunity/create/{companyId}` - Create opportunity (Company only)
- `GET /api/opportunity/{opportunityId}` - Get opportunity details

## Development Notes

### Database Schema
- The JPA configuration uses `hibernate.ddl-auto=update` which auto-updates schema
- `show-sql=true` logs SQL queries for debugging
- Be cautious with schema changes as they affect the shared `tb_user` table

### MapStruct Annotation Processing
The Maven compiler plugin is configured to run MapStruct and Lombok annotation processors in the correct order. When creating new mappers, ensure they're in the `mapper/` package and follow the existing interface pattern.

### Testing Configuration
The surefire plugin is configured with mockito-inline agent for static/final method mocking. Tests use the standard Spring Boot test annotations.

### Cloudinary Image Standards
When working with image uploads, always reference `CLOUDINARY_IMAGE_STANDARDS.md` for the correct dimensions and transformation parameters. The CloudinaryImageProperties config class loads these from application.properties.
