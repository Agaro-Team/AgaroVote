# Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Fast Setup

```bash
# 1. Start PostgreSQL with Docker
docker-compose up -d

# 2. Install dependencies (already done)
# yarn install

# 3. Start development server
yarn start:dev
```

**That's it!** 🎉

The API is now running at: `http://localhost:3000/api/v1`

## ✅ Test Your Setup

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### Create a User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Get All Users
```bash
curl http://localhost:3000/api/v1/users
```

## 📚 What's Configured

✅ **NestJS 11** - Modern Node.js framework  
✅ **TypeORM** - ORM with PostgreSQL  
✅ **DDD Architecture** - Domain-Driven Design  
✅ **Global Validation** - Request/Response validation  
✅ **Error Handling** - Consistent error responses  
✅ **Docker Setup** - PostgreSQL + pgAdmin  
✅ **Environment Config** - `.env` file ready  
✅ **Health Checks** - Monitor your API  
✅ **User Module** - Complete example implementation  

## 📂 Key Files

| File | What is it? |
|------|-------------|
| `src/modules/user/` | Example DDD module |
| `src/config/` | Configuration files |
| `src/shared/` | Reusable components |
| `.env` | Environment variables |
| `docker-compose.yml` | Local database |

## 🎯 Next Steps

1. **Read the docs:**
   - [README.md](./README.md) - Complete guide
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - DDD principles
   - [SETUP.md](./SETUP.md) - Detailed setup

2. **Explore the User module** at `src/modules/user/` to understand DDD structure

3. **Create your own module** following the same pattern

4. **Access pgAdmin** at http://localhost:5050
   - Email: `admin@agaro.com`
   - Password: `admin`

## 🔧 Useful Commands

```bash
yarn start:dev      # Development with hot reload
yarn build         # Build for production
yarn lint          # Check code quality
yarn format        # Format code
yarn test          # Run tests
```

## 🐳 Docker Commands

```bash
docker-compose up -d     # Start database
docker-compose down      # Stop database
docker-compose logs -f   # View logs
```

## 💡 Tips

- The database schema auto-syncs in development mode
- All responses are wrapped in a standard format
- Validation happens automatically on requests
- Check the health endpoint to verify everything is working

## 🆘 Issues?

1. **Port 3000 in use?** Change `PORT` in `.env`
2. **Database connection error?** Check if Docker is running
3. **Build errors?** Run `yarn install` again

## 🎓 Learning Resources

- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- DDD: Read our [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Happy Coding!** 🚀

