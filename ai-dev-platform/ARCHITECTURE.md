# Architecture Documentation

## System Overview

The AI Dev Platform is built on a serverless architecture using AWS services and Next.js. The system is designed to be scalable, cost-effective, and maintainable.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        User Interface                         │
│                     (Next.js Frontend)                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Monaco   │  │React Flow  │  │  Framer Motion UI    │  │
│  │   Editor   │  │   Graph    │  │   Components         │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                        │
│                    (Serverless Functions)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Project    │  │    Module    │  │   Architecture   │  │
│  │   Creation   │  │  Generation  │  │    Analysis      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Amazon     │   │   Amazon     │   │   Amazon     │
│   Bedrock    │   │  DynamoDB    │   │      S3      │
│   (Claude)   │   │  (Database)  │   │   (Storage)  │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Component Architecture

### Frontend Layer

#### 1. Pages
- **Home Page** (`app/page.tsx`)
  - Landing page with create/import options
  - Modern glassmorphism UI
  - Framer Motion animations

- **Create Project** (`app/create/page.tsx`)
  - Project idea input
  - Example prompts
  - Real-time AI generation status

- **Import Project** (`app/import/page.tsx`)
  - GitHub URL input
  - Repository analysis status
  - Import progress tracking

- **Workspace** (`app/workspace/[id]/page.tsx`)
  - Main IDE interface
  - Multi-panel layout
  - Real-time state management

#### 2. Workspace Components

**TopBar** (`components/workspace/TopBar.tsx`)
- Project name display
- Action buttons (Run, Export, Settings)
- Status indicators

**LeftSidebar** (`components/workspace/LeftSidebar.tsx`)
- Module list view
- File explorer
- Tab-based navigation
- Module status indicators

**CodeEditor** (`components/workspace/CodeEditor.tsx`)
- Monaco Editor integration
- Syntax highlighting
- Multiple language support
- Auto-save functionality

**RightPanel** (`components/workspace/RightPanel.tsx`)
- AI assistant chat
- Module details and insights
- Code generation triggers
- Dependency information

**BottomPanel** (`components/workspace/BottomPanel.tsx`)
- React Flow graph visualization
- Interactive node exploration
- Edge relationship display
- Fullscreen mode

**CustomNode** (`components/workspace/CustomNode.tsx`)
- Graph node rendering
- Type-based styling
- Handle connections
- Click interactions

### Backend Layer

#### 1. API Routes

**Project Creation** (`app/api/projects/create/route.ts`)
```typescript
POST /api/projects/create
Body: { idea: string }
Returns: { projectId: string, project: Project }

Flow:
1. Receive project idea
2. Call Bedrock for architecture generation
3. Parse AI response
4. Create project in DynamoDB
5. Create initial modules
6. Return project data
```

**Project Import** (`app/api/projects/import/route.ts`)
```typescript
POST /api/projects/import
Body: { repoUrl: string }
Returns: { projectId: string, project: Project }

Flow:
1. Receive repository URL
2. Call Bedrock for repository analysis
3. Parse AI response
4. Create project in DynamoDB
5. Create discovered modules
6. Return project data
```

**Get Project** (`app/api/projects/[id]/route.ts`)
```typescript
GET /api/projects/[id]
Returns: Project

Flow:
1. Extract project ID from URL
2. Query DynamoDB
3. Return project data
```

**Module Generation** (`app/api/modules/generate/route.ts`)
```typescript
POST /api/modules/generate
Body: { projectId: string, moduleId: string }
Returns: { files: FileNode[] }

Flow:
1. Get project and module details
2. Update module status to "generating"
3. Call Bedrock with module context
4. Parse generated code
5. Update module with files
6. Return generated files
```

### AI Integration Layer

#### Bedrock Integration (`lib/bedrock.ts`)

**Architecture Generation**
```typescript
generateArchitecture(projectIdea: string)

Process:
1. Construct system prompt for architecture design
2. Format user message with project idea
3. Invoke Claude 3.5 Sonnet
4. Parse JSON response
5. Validate structure
6. Return architecture object
```

**Code Generation**
```typescript
generateModuleCode(
  moduleName: string,
  moduleDescription: string,
  dependencies: string[],
  techStack: string[]
)

Process:
1. Construct system prompt for code generation
2. Include module context and dependencies
3. Invoke Claude 3.5 Sonnet
4. Parse generated files
5. Return file structure
```

**Repository Analysis**
```typescript
analyzeRepository(repoUrl: string)

Process:
1. Construct analysis prompt
2. Include repository URL
3. Invoke Claude 3.5 Sonnet
4. Parse architecture map
5. Return discovered structure
```

### Data Layer

#### DynamoDB Integration (`lib/dynamodb.ts`)

**Tables**

1. **Projects Table**
   - Primary Key: `id` (String)
   - Attributes:
     - `name`: String
     - `idea`: String
     - `architecture`: Map
     - `createdAt`: String (ISO timestamp)
     - `updatedAt`: String (ISO timestamp)

2. **Modules Table**
   - Primary Key: `id` (String)
   - Global Secondary Index: `projectId-index`
   - Attributes:
     - `projectId`: String
     - `name`: String
     - `layer`: String
     - `type`: String
     - `description`: String
     - `dependencies`: List
     - `status`: String
     - `files`: List
     - `createdAt`: String

3. **Graph Table** (Future)
   - Primary Key: `id` (String)
   - Attributes:
     - `projectId`: String
     - `nodes`: List
     - `edges`: List

**Operations**

```typescript
createProject(project: Project)
getProject(projectId: string)
updateProject(projectId: string, updates: Partial<Project>)
createModule(module: Module)
getModulesByProject(projectId: string)
updateModule(moduleId: string, updates: Partial<Module>)
```

### State Management

#### Zustand Store (`lib/store.ts`)

```typescript
interface ProjectStore {
  // State
  currentProject: Project | null;
  selectedModule: Module | null;
  modules: Module[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  selectedFile: FileNode | null;
  isGraphVisible: boolean;

  // Actions
  setCurrentProject: (project: Project) => void;
  setSelectedModule: (module: Module | null) => void;
  addModule: (module: Module) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
  setGraphNodes: (nodes: GraphNode[]) => void;
  setGraphEdges: (edges: GraphEdge[]) => void;
  addGraphNode: (node: GraphNode) => void;
  addGraphEdge: (edge: GraphEdge) => void;
  setSelectedFile: (file: FileNode | null) => void;
  toggleGraph: () => void;
}
```

## Data Flow

### Project Creation Flow

```
User Input
    │
    ▼
Create Page
    │
    ▼
POST /api/projects/create
    │
    ├──▶ Bedrock.generateArchitecture()
    │         │
    │         ▼
    │    Claude 3.5 Sonnet
    │         │
    │         ▼
    │    Architecture JSON
    │
    ├──▶ DynamoDB.createProject()
    │
    ├──▶ DynamoDB.createModule() (for each module)
    │
    ▼
Response { projectId }
    │
    ▼
Navigate to /workspace/[id]
    │
    ▼
Load Workspace
```

### Module Generation Flow

```
User Clicks "Generate Code"
    │
    ▼
POST /api/modules/generate
    │
    ├──▶ DynamoDB.getProject()
    │
    ├──▶ DynamoDB.updateModule({ status: "generating" })
    │
    ├──▶ Bedrock.generateModuleCode()
    │         │
    │         ▼
    │    Claude 3.5 Sonnet
    │         │
    │         ▼
    │    Generated Files
    │
    ├──▶ DynamoDB.updateModule({ status: "completed", files })
    │
    ▼
Response { files }
    │
    ▼
Update Zustand Store
    │
    ▼
UI Updates
```

## Security Considerations

1. **API Authentication**
   - Currently using AWS credentials
   - TODO: Implement Cognito for user authentication
   - TODO: Add API key validation

2. **Input Validation**
   - Sanitize user inputs
   - Validate project ideas
   - Validate repository URLs

3. **Rate Limiting**
   - TODO: Implement rate limiting for API routes
   - TODO: Add throttling for Bedrock calls

4. **Data Privacy**
   - User data stored in DynamoDB
   - TODO: Implement encryption at rest
   - TODO: Add data retention policies

## Scalability

1. **Serverless Functions**
   - Auto-scaling API routes
   - Pay-per-use pricing
   - No infrastructure management

2. **Database**
   - DynamoDB on-demand pricing
   - Automatic scaling
   - Global tables for multi-region

3. **CDN**
   - Vercel Edge Network
   - Static asset optimization
   - Global distribution

## Monitoring

1. **CloudWatch**
   - API route metrics
   - Bedrock invocation logs
   - DynamoDB performance

2. **Error Tracking**
   - TODO: Implement Sentry
   - TODO: Add custom error boundaries

## Future Enhancements

1. **Real-time Collaboration**
   - WebSocket integration
   - Multi-user editing
   - Presence indicators

2. **Code Execution**
   - Lambda function execution
   - Sandbox environment
   - Live preview

3. **Version Control**
   - Git integration
   - Commit history
   - Branch management

4. **Deployment**
   - One-click deployment
   - CI/CD pipelines
   - Environment management
