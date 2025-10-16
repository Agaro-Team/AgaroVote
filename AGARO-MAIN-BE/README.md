# 🗳️ AgaroVote Backend

> **Decentralized Voting Platform with Enterprise-Grade Web3 Authentication**

## 🎯 Overview

AgaroVote Backend is a secure, scalable NestJS application that powers a blockchain-based voting system. It features **SIWE (Sign-In With Ethereum)** authentication, providing cryptographic proof of wallet ownership without traditional passwords.

---

## ✨ Key Features

- 🔐 **Web3 Authentication** - SIWE + JWT for secure wallet-based auth
- 📊 **Voting System** - Create polls, cast votes, track statistics
- 🛡️ **Security** - Rate limiting, wallet verification, audit logging
- 🏗️ **Clean Architecture** - DDD with CQRS pattern
- 📦 **Type-Safe** - Full TypeScript with strict mode
- 🚀 **Production-Ready** - Comprehensive error handling & validation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL 14+
- Docker (optional, for local database)

### Installation

```bash
# Install dependencies
yarn install

# Setup environment
cp .env.example .env
# Edit .env and set JWT_SECRET, database credentials

# Run migrations
yarn migration:run

# Start development server
yarn start:dev
```

Server will be available at: **http://localhost:3000/api/v1**

---

## 🔐 Authentication

This backend uses **SIWE (Sign-In With Ethereum)** for Web3 authentication:

```
1. User connects wallet (MetaMask, WalletConnect, etc.)
2. Backend generates unique nonce
3. User signs SIWE message with private key
4. Backend verifies signature & issues JWT token
5. All subsequent requests include JWT in Authorization header
```

### Quick Test

```bash
# 1. Get nonce
curl -X POST http://localhost:3000/api/v1/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'

# 2. Sign message with your wallet, then verify
curl -X POST http://localhost:3000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "message":"...",
    "signature":"0x..."
  }'

# 3. Use the returned JWT token
curl -X GET http://localhost:3000/api/v1/polls \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

📖 **Full Guide**: See [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) | Complete authentication & frontend integration guide |
| [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) | Security architecture & attack mitigation details |
| [WEB3_AUTH_SUMMARY.md](./WEB3_AUTH_SUMMARY.md) | Implementation summary & overview |
| [QUICK_START.md](./QUICK_START.md) | Quick setup guide for developers |

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL + TypeORM
- **Authentication**: SIWE + JWT + Passport
- **Pattern**: DDD + CQRS + Event Sourcing
- **Validation**: class-validator
- **Security**: Rate limiting, CORS, helmet (recommended)

### Project Structure

```
src/
├── modules/
│   ├── auth/           # 🔐 Web3 authentication (SIWE + JWT)
│   ├── poll/           # 📊 Poll management
│   ├── vote/           # 🗳️  Voting & statistics
│   └── user/           # 👤 User management
├── shared/
│   ├── domain/         # Base entities & interfaces
│   ├── application/    # DTOs, response wrappers
│   ├── infrastructure/ # Database module
│   └── presentation/   # Filters, interceptors, pipes
├── database/
│   └── migrations/     # Database migrations
├── config/             # Configuration
└── main.ts            # Application entry point
```

---

## 🌐 API Endpoints

### Public Endpoints

```
POST   /auth/nonce                      # Get authentication nonce
POST   /auth/verify                     # Verify signature & get JWT
GET    /health                          # Health check
GET    /polls                           # List all polls
GET    /polls/:id                       # Get poll details
GET    /votes/stats/:pollId             # Vote statistics
```

### Protected Endpoints (Auth Required)

```
POST   /polls                           # Create poll
PUT    /polls/:id                       # Update poll
DELETE /polls/:id                       # Delete poll
POST   /votes                           # Cast vote
```

**All protected endpoints require:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔒 Security Features

| Feature | Status | Description |
|---------|:------:|-------------|
| SIWE Authentication | ✅ | Cryptographic wallet ownership proof |
| JWT Sessions | ✅ | Stateless token-based authentication |
| Wallet Verification | ✅ | Server-side validation on every request |
| Rate Limiting | ✅ | 100 requests/minute per IP |
| Nonce Management | ✅ | Single-use, time-limited (5-min expiry) |
| Audit Logging | ✅ | Complete authentication event logging |
| CORS Protection | ✅ | Configurable allowed origins |
| Global Guards | ✅ | All routes protected by default |

---

## 🛠️ Development

### Available Scripts

```bash
# Development
yarn start:dev          # Start with hot reload
yarn build              # Build for production
yarn start:prod         # Start production build

# Database
yarn migration:generate # Generate migration from entities
yarn migration:run      # Run pending migrations
yarn migration:revert   # Revert last migration

# Testing
yarn test               # Run unit tests
yarn test:e2e           # Run e2e tests
yarn test:cov           # Generate coverage report

# Code Quality
yarn lint               # Lint code
yarn format             # Format code with Prettier
```

### Environment Variables

```env
# Application
NODE_ENV=development
APP_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=agaro_vote

# Authentication (REQUIRED!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

---

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

---

## 📦 Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` (min 32 random characters)
- [ ] Configure `CORS_ORIGIN` to your production domain
- [ ] Enable HTTPS
- [ ] Run database migrations
- [ ] Set `NODE_ENV=production`
- [ ] Configure rate limiting based on expected traffic
- [ ] Set up monitoring and logging
- [ ] Configure database SSL
- [ ] Set up automated backups

### Docker Deployment

```bash
# Build image
docker build -t agaro-vote-backend .

# Run container
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e DB_HOST=your-db-host \
  agaro-vote-backend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript strict mode
- Follow NestJS best practices
- Write unit tests for new features
- Document public APIs
- Run linter before committing

---

## 📝 License

[Add your license here]

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [SIWE](https://login.xyz/) - Sign-In With Ethereum
- [TypeORM](https://typeorm.io/) - ORM for TypeScript
- [Passport](http://www.passportjs.org/) - Authentication middleware

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues]
- **Security**: Report vulnerabilities responsibly

---

## 🎉 Getting Started

1. **Read the docs**: Start with [QUICK_START.md](./QUICK_START.md)
2. **Set up authentication**: See [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
3. **Understand security**: Read [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)
4. **Build your frontend**: Use the JWT tokens in your API calls

**Your backend is secure and ready for production! 🚀**

---

Made with ❤️ for the Web3 community
