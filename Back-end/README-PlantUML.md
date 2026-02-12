# F1 TANGER - PlantUML Documentation

This directory contains automatically generated PlantUML diagrams for the F1 TANGER Laravel project.

## 📋 **Available Diagrams**

### 1. **Database Schema** - `f1-database-schema.puml`
- Complete database table structure
- Primary keys, foreign keys, and relationships
- Generated from Laravel migrations
- Shows all tables: users, teams, drivers, races, laps, standings, tickets

### 2. **Laravel Models** - `f1-models.puml`
- All Eloquent model classes
- Model properties and methods
- Eloquent relationships (hasMany, belongsTo, etc.)
- Generated from actual model files

### 3. **API Routes** - `f1-api-routes.puml`
- Current API endpoint structure
- Public vs Authenticated routes
- Controller mappings
- Middleware and security layers

### 4. **System Architecture** - `f1-system-architecture.puml`
- Overall system design
- Frontend to Backend flow
- Database layer architecture
- External services integration

## 🚀 **How to View Diagrams**

### **In VS Code with PlantUML Extension:**
1. Install PlantUML extension (`jebbs.plantuml`)
2. Open any `.puml` file
3. Press `Alt + D` or `Ctrl + Shift + P` → "PlantUML: Preview Current Diagram"

### **Export Options:**
- PNG (for documentation)
- SVG (scalable vector)
- PDF (for reports)

## 📊 **Current Project Status**

Based on the generated diagrams:

### ✅ **Completed:**
- User authentication (register/login/logout)
- Basic team and driver models
- Database schema with relationships
- API routes structure with Sanctum

### 🔄 **In Progress:**
- Team and Driver CRUD operations
- Search functionality
- File upload for images

### ❌ **Pending:**
- Race management system
- Lap timing functionality
- Standings calculations
- Ticket booking system

## 🔧 **Technical Stack Detected:**

- **Framework:** Laravel 10.x
- **Database:** MySQL with migrations
- **Authentication:** Laravel Sanctum (API tokens)
- **Authorization:** Laratrust (roles & permissions)
- **Models:** 11 main entities
- **API Endpoints:** 12 routes (6 public, 6 authenticated)

## 📝 **Notes:**

These diagrams are automatically generated from your actual Laravel code structure. They reflect the current state of your:
- `app/Models/*.php` files
- `database/migrations/*.php` files  
- `routes/api.php` configuration

Update the diagrams by re-running the generation process when your code changes.

---
**Generated:** November 2025  
**Project:** F1 TANGER Backend API  
**Developer:** HAMZA