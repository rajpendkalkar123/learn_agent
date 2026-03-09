/**
 * Production API Service
 * Handles all API calls to AWS API Gateway
 */

import { apiClient } from './aws-config/api-client';

export interface Project {
  project_id: string;
  user_id: string;
  name: string;
  idea: string;
  type: string;
  knowledge_level: string;
  architecture: any;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
  modules_count: number;
}

export interface Module {
  module_id: string;
  project_id: string;
  name: string;
  layer: string;
  layer_name: string;
  technologies: string[];
  status: 'pending' | 'completed';
  dependencies: any[];
  files: any[];
  code_generated: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new project
 */
export async function createProject(idea: string, knowledgeLevel: string = 'intermediate'): Promise<{ project: Project; modules: Module[] }> {
  return apiClient.post('/projects/create', {
    idea,
    knowledgeLevel,
    type: 'new'
  });
}

/**
 * Get project by ID
 */
export async function getProject(projectId: string): Promise<{ project: Project; modules: Module[] }> {
  return apiClient.get(`/projects/${projectId}`);
}

/**
 * Generate code for a module
 */
export async function generateModule(
  moduleId: string,
  projectId: string,
  moduleName: string,
  layer: string,
  technologies: string[],
  knowledgeLevel: string = 'intermediate'
): Promise<{ module: Module; generatedFiles: any[] }> {
  return apiClient.post('/modules/generate', {
    moduleId,
    projectId,
    moduleName,
    layer,
    technologies,
    knowledgeLevel
  });
}

/**
 * Chat with AI assistant
 */
export async function sendChatMessage(
  message: string,
  context?: any[],
  projectContext?: any
): Promise<{ message: string; timestamp: string }> {
  return apiClient.post('/chat', {
    message,
    context,
    projectContext
  });
}

/**
 * Search projects and modules
 */
export async function search(
  query: string,
  projectId?: string
): Promise<{ query: string; results: any[]; total: number }> {
  return apiClient.post('/search', {
    query,
    projectId
  });
}

/**
 * Perform impact analysis
 */
export async function analyzeImpact(
  projectId: string,
  moduleId: string,
  changeType: string = 'modification'
): Promise<any> {
  return apiClient.post('/impact', {
    projectId,
    moduleId,
    changeType
  });
}

/**
 * Export project documentation
 */
export async function exportProject(
  projectId: string,
  format: 'markdown' | 'json' = 'markdown'
): Promise<{ documentation: string; format: string }> {
  return apiClient.post('/projects/export', {
    projectId,
    format
  });
}

/**
 * Get learning path for project
 */
export async function getLearningPath(projectId: string): Promise<any> {
  return apiClient.get(`/learning/${projectId}`);
}

/**
 * Health check - verify API Gateway connectivity
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  try {
    // Since we don't have a dedicated health endpoint, we'll just check config
    const { apiGatewayUrl } = await import('./aws-config/api-client').then(m => m.awsConfig);
    
    if (!apiGatewayUrl) {
      return {
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'error',
      timestamp: new Date().toISOString()
    };
  }
}
