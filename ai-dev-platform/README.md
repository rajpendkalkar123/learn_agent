# AI Dev Platform

**Build Smarter, Understand Deeper**

An AI-powered development platform that helps developers build software projects with visual architecture graphs, modular code generation, and deep system understanding.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![AWS](https://img.shields.io/badge/AWS-Bedrock-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 🚀 Overview

This platform addresses the critical problem of "vibe coding" - where developers use AI to generate code without truly understanding how components interact. Instead, our platform:

- **Visualizes Architecture**: See how every component, API, and service connects in real-time
- **Modular Development**: Build features step-by-step with AI guidance and clear dependencies
- **Deep Understanding**: No more black-box AI coding - know exactly how your system works

---

## ✨ Features

### 1. AI-Powered Project Creation
- Describe your project idea in natural language
- AI generates complete architecture with layers and modules
- Automatic technology stack selection

### 2. GitHub Import & Analysis
- Import existing repositories
- Automatic codebase analysis
- Architecture reverse-engineering

### 3. Visual Dependency Graphs
- Interactive architecture visualization using React Flow
- Node types: Components, Services, APIs, Databases, Functions
- Connection types: Calls, Queries, Dependencies, Data Flow

### 4. Module-by-Module Code Generation
- Break projects into logical modules
- Generate code incrementally
- Track dependencies and relationships

### 5. IDE-Like Interface
- Monaco Editor integration
- Multi-panel layout (VSCode-inspired)
- Real-time code editing

### 6. Function Insights
- Click any node to see:
  - Input parameters
  - Output data
  - Dependencies
  - Connected services
  - Full code implementation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Next.js Frontend                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  React   │ │  Monaco  │ │ React Flow   │   │
│  │   Flow   │ │  Editor  │ │    Graph     │   │
│  └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              API Routes (Next.js)               │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              AWS Services                        │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Bedrock    │  │  DynamoDB    │            │
│  │   (Claude)   │  │  (Storage)   │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Flow** - Architecture graph visualization
- **Monaco Editor** - Code editing
- **Framer Motion** - Smooth animations
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless functions
- **Amazon Bedrock** - AI model integration (Claude 3.5 Sonnet)
- **Amazon DynamoDB** - NoSQL database
- **Amazon S3** - File storage
- **Amazon Cognito** - Authentication (optional)

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- AWS Account
- AWS CLI configured

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-dev-platform.git
cd ai-dev-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your AWS credentials:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

DYNAMODB_PROJECTS_TABLE=ai-dev-platform-projects
DYNAMODB_MODULES_TABLE=ai-dev-platform-modules
DYNAMODB_GRAPH_TABLE=ai-dev-platform-graph

S3_BUCKET_NAME=ai-dev-platform-code-storage
```

### 4. Set Up AWS Resources

#### Create DynamoDB Tables
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
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=projectId,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=projectId-index,KeySchema=[{AttributeName=projectId,KeyType=HASH}],Projection={ProjectionType=ALL}" \
    --billing-mode PAY_PER_REQUEST

# Graph Table
aws dynamodb create-table \
    --table-name ai-dev-platform-graph \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

#### Create S3 Bucket
```bash
aws s3 mb s3://ai-dev-platform-code-storage
```

#### Enable Bedrock Model Access
1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access"
3. Request access to "Anthropic Claude 3.5 Sonnet"

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 Usage

### Creating a New Project

1. Click "Create with AI"
2. Describe your project idea:
   ```
   Build an Amazon clone with Next.js, featuring product catalog, 
   cart, checkout, and order management. Include user authentication, 
   payment processing, and admin dashboard.
   ```
3. AI generates architecture with modules
4. Navigate to workspace
5. Click on any module to generate code
6. View dependency graph at the bottom

### Importing from GitHub

1. Click "Import from GitHub"
2. Enter repository URL: `https://github.com/username/repo`
3. AI analyzes codebase
4. Explore architecture and dependencies

---

## 🎨 Interface Layout

```
┌────────────────────────────────────────────────────┐
│  Top Bar: Project Name | Run | Export | Settings  │
├──────────┬──────────────────────────┬──────────────┤
│          │                          │              │
│  Left    │    Center Panel         │   Right      │
│ Sidebar  │   Monaco Editor          │   Panel      │
│          │                          │              │
│ Modules  │   (Code Editing)         │  AI          │
│   &      │                          │ Assistant    │
│  Files   │                          │              │
│          │                          │              │
│          ├──────────────────────────┤              │
│          │   Bottom Panel           │              │
│          │   React Flow Graph       │              │
│          │ (Architecture Map)       │              │
└──────────┴──────────────────────────┴──────────────┘
```

---

## 🔧 Development

### Project Structure
```
ai-dev-platform/
├── app/
│   ├── api/                 # API routes
│   │   ├── projects/
│   │   └── modules/
│   ├── create/             # Create project page
│   ├── import/             # Import project page
│   ├── workspace/[id]/     # Main IDE workspace
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── workspace/          # Workspace components
│       ├── TopBar.tsx
│       ├── LeftSidebar.tsx
│       ├── CodeEditor.tsx
│       ├── RightPanel.tsx
│       ├── BottomPanel.tsx
│       └── CustomNode.tsx
├── lib/
│   ├── bedrock.ts         # AWS Bedrock integration
│   ├── dynamodb.ts        # DynamoDB operations
│   └── store.ts           # Zustand state management
├── types/
│   └── index.ts           # TypeScript types
└── public/
```

### Key Files

- **`lib/bedrock.ts`**: AI orchestration using Amazon Bedrock
- **`lib/dynamodb.ts`**: Database operations
- **`lib/store.ts`**: Global state management
- **`components/workspace/BottomPanel.tsx`**: Architecture graph visualization
- **`app/api/projects/create/route.ts`**: Project creation API

---

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to AWS Amplify

1. Connect repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
3. Add environment variables
4. Deploy

---

## 📊 Data Models

### Project
```typescript
{
  id: string;
  name: string;
  idea: string;
  architecture: {
    layers: Layer[];
    techStack: TechStack;
    modules: Module[];
  };
  createdAt: string;
  updatedAt: string;
}
```

### Module
```typescript
{
  id: string;
  name: string;
  layer: string;
  type: string;
  description: string;
  dependencies: string[];
  status: "pending" | "generating" | "completed" | "error";
  files?: FileNode[];
}
```

### GraphNode
```typescript
{
  id: string;
  type: "component" | "service" | "api" | "database" | "function";
  data: {
    label: string;
    description?: string;
    inputs?: Parameter[];
    outputs?: Parameter[];
    connections?: string[];
  };
  position: { x: number; y: number };
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎓 Hackathon Submission

This project was created for the **AWS AI for Bharat Hackathon 2026**.

### Evaluation Criteria Addressed

1. **Architecture**: Serverless AWS architecture with Bedrock, DynamoDB, and S3
2. **AI Usage**: Claude 3.5 Sonnet for architecture generation and code synthesis
3. **System Design**: Modular, scalable, and production-ready
4. **Innovation**: Unique approach to preventing "vibe coding"
5. **User Experience**: Modern, intuitive IDE-like interface

---

## 📞 Contact

- **Author**: Raj Pendkalkar
- **Email**: your.email@example.com
- **GitHub**: [@rajpendkalkar123](https://github.com/rajpendkalkar123)

---

## 🙏 Acknowledgments

- Amazon Bedrock for AI capabilities
- React Flow for graph visualization
- Monaco Editor for code editing
- Next.js team for the framework
- AWS for cloud infrastructure

---

**Built with ❤️ for developers who want to understand their code**
