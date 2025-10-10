# AGARO Vote Backend

A modular backend application built with NestJS, TypeORM, and PostgreSQL following Domain-Driven Design (DDD) principles.

## 📚 Documentation Guide

Please read the documentation in the following order:

### **1️⃣ [Quick Start](./01-QUICKSTART.md)** ⚡
**Start here!** Get up and running in 5 minutes.
- Fast setup instructions
- Test your installation
- Verify everything works

### **2️⃣ [Setup Guide](./02-SETUP.md)** 🛠️
Detailed setup and configuration instructions.
- Prerequisites and requirements
- Step-by-step installation
- Database setup (Docker & Local)
- Environment configuration
- Troubleshooting common issues

### **3️⃣ [Complete Guide](./03-README.md)** 📖
Full project documentation and API reference.
- Project overview
- API endpoints documentation
- Database management
- Development workflow
- Testing strategies
- Production deployment

### **4️⃣ [Architecture Guide](./04-ARCHITECTURE.md)** 🏗️
Understand the DDD architecture and design patterns.
- Domain-Driven Design principles
- Layer responsibilities
- Design patterns used
- Best practices
- Code examples

### **5️⃣ [Project Structure](./05-PROJECT-STRUCTURE.md)** 📂
Complete file structure and organization.
- Directory layout
- File naming conventions
- Module template
- Layer breakdown

### **6️⃣ [Module Generation](./06-MODULE-GENERATION.md)** ⚙️
Learn how to generate new modules quickly.
- NestJS CLI commands
- Custom DDD generator
- Complete CRUD generator ⚡
- Step-by-step examples
- Best practices

### **📖 [Generator Example](./GENERATOR-EXAMPLE.md)** 💡
See a complete example of the CRUD generator in action.
- Real-world example
- Before/after comparison
- Customization guide
- API testing examples

---

## 🚀 Quick Commands

```bash
# Start development
yarn start:dev

# Build for production
yarn build

# Run production
yarn start:prod

# Run tests
yarn test

# Generate complete CRUD module (⚡ Recommended)
yarn generate:crud <module-name> <entity-name>

# Generate module structure only
yarn generate:module <module-name> <entity-name>

# Database migrations
yarn migration:generate src/database/migrations/MigrationName
yarn migration:run
```

## 🎯 Key Features

✅ **NestJS 11** - Modern Node.js framework  
✅ **TypeORM** - ORM with PostgreSQL  
✅ **DDD Architecture** - Clean, maintainable code  
✅ **Type Safety** - Full TypeScript support  
✅ **Validation** - Automatic request validation  
✅ **Error Handling** - Consistent error responses  
✅ **Docker Ready** - PostgreSQL + pgAdmin included  
✅ **Migration System** - Database version control  
✅ **Production Ready** - Best practices implemented  

## 📞 Quick Links

- **API Base URL**: `http://localhost:3000/api/v1`
- **Health Check**: `http://localhost:3000/api/v1/health`
- **pgAdmin**: `http://localhost:5050` (admin@agaro.com / admin)

## 🆘 Need Help?

1. Check [Quick Start](./01-QUICKSTART.md) for common issues
2. Read [Setup Guide](./02-SETUP.md) for detailed troubleshooting
3. Review [Complete Guide](./03-README.md) for comprehensive docs

## 📋 Project Status

- ✅ TypeORM with PostgreSQL configured
- ✅ DDD modular architecture implemented
- ✅ User module as example
- ✅ Global validation and error handling
- ✅ Docker setup for local development
- ✅ Production build ready
- ✅ Migration system configured

---

**Version**: 0.0.1  
**License**: UNLICENSED  
**Team**: AGARO Vote Backend Team

Happy Coding! 🚀

