# AI Dev Platform - Quick Start Guide

## 🚀 Getting Started

### Method 1: Using the Start Script (Easiest)

**Windows:**
```bash
.\start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Method 2: Manual Installation

1. **Install Dependencies**
   ```bash
   cd ai-dev-platform
   npm install
   ```

2. **Configure Environment** (Optional for Demo)
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your AWS credentials if you want full functionality.

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📝 Demo Mode (No AWS Setup Required)

For hackathon demo purposes, the app will work in demo mode without AWS credentials:

- ✅ UI fully functional
- ✅ All pages accessible
- ✅ Visual components working
- ⚠️ AI features will show mock data
- ⚠️ Database operations simulated

---

## 🔧 Full Setup with AWS

To enable full AI functionality:

### 1. AWS Setup

1. **Create AWS Account** (if you don't have one)

2. **Enable Amazon Bedrock**
   - Go to AWS Console → Amazon Bedrock
   - Click "Model access"
   - Request access to "Anthropic Claude 3.5 Sonnet"

3. **Create DynamoDB Tables**
   ```bash
   # Projects Table
   aws dynamodb create-table \
       --table-name ai-dev-platform-projects \
       --attribute-definitions AttributeName=id,AttributeType=S \
       --key-schema AttributeName=id,KeyType=HASH \
       --billing-mode PAY_PER_REQUEST

   # Modules Table
   aws dynamodb create-table \
       --table-name ai-dev-platform-modules \
       --attribute-definitions AttributeName=id,AttributeType=S AttributeName=projectId,AttributeType=S \
       --key-schema AttributeName=id,KeyType=HASH \
       --global-secondary-indexes '[{"IndexName":"projectId-index","KeySchema":[{"AttributeName":"projectId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
       --billing-mode PAY_PER_REQUEST
   ```

4. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://ai-dev-platform-code-storage
   ```

### 2. Configure Environment Variables

Edit `.env.local`:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Amazon Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# DynamoDB Tables
DYNAMODB_PROJECTS_TABLE=ai-dev-platform-projects
DYNAMODB_MODULES_TABLE=ai-dev-platform-modules

# S3
S3_BUCKET_NAME=ai-dev-platform-code-storage
```

### 3. Restart Server

```bash
npm run dev
```

---

## 🎯 Features Overview

### 1. **Create New Project**
   - Describe your project idea
   - AI generates architecture automatically
   - See modular breakdown

### 2. **Import from GitHub**
   - Paste repository URL
   - AI analyzes codebase
   - Generates architecture map

### 3. **Visual Architecture Graph**
   - Interactive dependency visualization
   - Click nodes to see details
   - Understand system connections

### 4. **Code Editor**
   - Monaco Editor (VSCode engine)
   - Syntax highlighting
   - Multi-language support

### 5. **Module Generation**
   - Generate code module-by-module
   - Track dependencies
   - See function relationships

---

## 🎨 UI Components

The platform includes:
- Modern glassmorphism design
- Dark theme optimized for developers
- Smooth animations (Framer Motion)
- Responsive layout
- IDE-like multi-panel interface

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Editor**: Monaco Editor
- **Graphs**: React Flow
- **Animations**: Framer Motion
- **State**: Zustand
- **Backend**: Next.js API Routes
- **AI**: Amazon Bedrock (Claude 3.5 Sonnet)
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3

---

## 📚 Example Project Ideas to Try

1. **E-commerce Platform**
   ```
   Build an Amazon clone with product catalog, cart, checkout, 
   user authentication, payment processing, and order management.
   ```

2. **Task Management App**
   ```
   Create a Trello-like app with boards, cards, drag-and-drop, 
   real-time collaboration, and notifications.
   ```

3. **Social Media Platform**
   ```
   Build a Twitter clone with posts, comments, likes, user profiles, 
   messaging, and feed algorithm.
   ```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### AWS Connection Issues
- Check credentials in `.env.local`
- Verify Bedrock model access is enabled
- Ensure tables exist in DynamoDB

---

## 📖 Documentation

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

---

## 🎓 For Hackathon Judges

This platform demonstrates:

✅ **Innovative AI Usage**: Not just code generation, but architecture understanding  
✅ **AWS Integration**: Bedrock, DynamoDB, S3  
✅ **System Design**: Scalable serverless architecture  
✅ **User Experience**: Modern, intuitive interface  
✅ **Practical Value**: Solves real problem of "vibe coding"

### Key Differentiators:
1. **Visual Architecture Graphs** - See how everything connects
2. **Module-by-Module Development** - Build incrementally with understanding
3. **Function Insights** - Know what each function does, inputs/outputs
4. **IDE-Like Experience** - Professional development environment

---

## 📞 Support

For issues or questions:
- Check existing documentation
- Review code comments
- Open GitHub issue

---

**Happy Coding! 🚀**
