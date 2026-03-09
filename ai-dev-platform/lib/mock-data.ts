// Mock data for demo mode when AWS services are not available

export const mockArchitectures: Record<string, any> = {
  "e-commerce": {
    projectName: "E-Commerce Platform",
    techStack: {
      frontend: ["Next.js", "React", "Tailwind CSS", "Redux"],
      backend: ["Node.js", "Express", "TypeScript"],
      database: ["PostgreSQL", "Redis"],
      external: ["Stripe", "SendGrid", "AWS S3"],
    },
    layers: [
      {
        id: "frontend-layer",
        name: "Frontend Layer",
        type: "frontend",
        description: "User interface components and pages",
      },
      {
        id: "backend-layer",
        name: "Backend Layer",
        type: "backend",
        description: "API services and business logic",
      },
      {
        id: "database-layer",
        name: "Database Layer",
        type: "database",
        description: "Data persistence and caching",
      },
      {
        id: "external-layer",
        name: "External Services",
        type: "external",
        description: "Third-party integrations",
      },
    ],
    modules: [
      {
        id: "product-catalog",
        name: "Product Catalog",
        layer: "frontend-layer",
        type: "component",
        description: "Product listing and search interface",
        dependencies: [],
        status: "pending",
      },
      {
        id: "shopping-cart",
        name: "Shopping Cart",
        layer: "frontend-layer",
        type: "component",
        description: "Cart management and checkout UI",
        dependencies: ["product-catalog"],
        status: "pending",
      },
      {
        id: "user-auth",
        name: "User Authentication",
        layer: "backend-layer",
        type: "service",
        description: "User registration and login API",
        dependencies: [],
        status: "pending",
      },
      {
        id: "product-api",
        name: "Product API",
        layer: "backend-layer",
        type: "api",
        description: "CRUD operations for products",
        dependencies: ["product-db"],
        status: "pending",
      },
      {
        id: "order-api",
        name: "Order API",
        layer: "backend-layer",
        type: "api",
        description: "Order processing and management",
        dependencies: ["product-api", "payment-service"],
        status: "pending",
      },
      {
        id: "product-db",
        name: "Product Database",
        layer: "database-layer",
        type: "database",
        description: "Product catalog storage",
        dependencies: [],
        status: "pending",
      },
      {
        id: "user-db",
        name: "User Database",
        layer: "database-layer",
        type: "database",
        description: "User accounts and profiles",
        dependencies: [],
        status: "pending",
      },
      {
        id: "payment-service",
        name: "Payment Service",
        layer: "external-layer",
        type: "external",
        description: "Stripe payment integration",
        dependencies: [],
        status: "pending",
      },
    ],
  },
};

export function generateMockArchitecture(projectIdea: string): any {
  // Simple keyword matching for demo
  const ideaLower = projectIdea.toLowerCase();
  
  if (ideaLower.includes("ecommerce") || ideaLower.includes("shop") || ideaLower.includes("store")) {
    return mockArchitectures["e-commerce"];
  }
  
  // Default generic architecture
  return {
    projectName: extractProjectName(projectIdea),
    techStack: {
      frontend: ["React", "Next.js", "Tailwind CSS"],
      backend: ["Node.js", "Express"],
      database: ["MongoDB"],
      external: ["AWS S3", "SendGrid"],
    },
    layers: [
      {
        id: "frontend-layer",
        name: "Frontend Layer",
        type: "frontend",
        description: "User interface and client-side logic",
      },
      {
        id: "backend-layer",
        name: "Backend Layer",
        type: "backend",
        description: "Server-side APIs and business logic",
      },
      {
        id: "database-layer",
        name: "Database Layer",
        type: "database",
        description: "Data storage and retrieval",
      },
    ],
    modules: [
      {
        id: "ui-components",
        name: "UI Components",
        layer: "frontend-layer",
        type: "component",
        description: "Reusable UI components",
        dependencies: [],
        status: "pending",
      },
      {
        id: "api-service",
        name: "API Service",
        layer: "backend-layer",
        type: "api",
        description: "RESTful API endpoints",
        dependencies: ["database"],
        status: "pending",
      },
      {
        id: "database",
        name: "Database Schema",
        layer: "database-layer",
        type: "database",
        description: "Data models and schemas",
        dependencies: [],
        status: "pending",
      },
    ],
  };
}

function extractProjectName(idea: string): string {
  const words = idea.split(" ").slice(0, 4);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export const mockModuleCode: Record<string, string> = {
  "product-catalog": `import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductCatalog() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="product-catalog">
      <h1>Product Catalog</h1>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}`,
  "shopping-cart": `import React from 'react';

export function ShoppingCart() {
  const [cartItems, setCartItems] = React.useState([]);

  const addItem = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeItem = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  return (
    <div className="shopping-cart">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <span>\${item.price}</span>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
          <div className="cart-total">
            Total: \${getTotalPrice()}
          </div>
        </>
      )}
    </div>
  );
}`,
};

export function generateMockModuleCode(moduleName: string, description: string): string {
  return mockModuleCode[moduleName] || `// ${moduleName}
// ${description}

export function ${moduleName.replace(/-/g, '')}() {
  // TODO: Implement ${moduleName}
  return (
    <div>
      <h2>${moduleName}</h2>
      <p>${description}</p>
    </div>
  );
}`;
}

// In-memory storage for demo mode
export class InMemoryStore {
  private projects: Map<string, any> = new Map();
  private modules: Map<string, any[]> = new Map();
  public progress: Map<string, any> = new Map();
  public conversations: Map<string, any> = new Map();
  public impacts: Map<string, any> = new Map();
  public feedbacks: any[] = [];
  public shareLinks: Map<string, any> = new Map();

  async createProject(project: any) {
    this.projects.set(project.id, project);
    return project;
  }

  async getProject(projectId: string) {
    return this.projects.get(projectId) || null;
  }

  async updateProject(projectId: string, updates: any) {
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    const updated = { ...project, ...updates };
    this.projects.set(projectId, updated);
    return updated;
  }

  async createModule(module: any) {
    const projectModules = this.modules.get(module.projectId) || [];
    projectModules.push(module);
    this.modules.set(module.projectId, projectModules);
    return module;
  }

  async getModulesByProject(projectId: string) {
    return this.modules.get(projectId) || [];
  }

  async updateModule(moduleId: string, projectId: string, updates: any) {
    const projectModules = this.modules.get(projectId) || [];
    const index = projectModules.findIndex((m) => m.id === moduleId);
    
    if (index === -1) return null;
    
    projectModules[index] = { ...projectModules[index], ...updates };
    this.modules.set(projectId, projectModules);
    return projectModules[index];
  }
}

export const inMemoryStore = new InMemoryStore();
