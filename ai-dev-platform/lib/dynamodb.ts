import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { inMemoryStore } from "./mock-data";

// Check if we're in demo mode
const isDemoMode = !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY;

const client = isDemoMode
  ? null
  : new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

const PROJECTS_TABLE = process.env.DYNAMODB_PROJECTS_TABLE || "ai-dev-platform-projects";
const MODULES_TABLE = process.env.DYNAMODB_MODULES_TABLE || "ai-dev-platform-modules";
const GRAPH_TABLE = process.env.DYNAMODB_GRAPH_TABLE || "ai-dev-platform-graph";

export async function createProject(project: any) {
  if (isDemoMode) {
    console.log("🎭 Demo Mode: Using in-memory storage for project");
    return await inMemoryStore.createProject(project);
  }

  const command = new PutItemCommand({
    TableName: PROJECTS_TABLE,
    Item: marshall(project),
  });

  await client!.send(command);
  return project;
}

export async function getProject(projectId: string) {
  if (isDemoMode) {
    console.log("🎭 Demo Mode: Retrieving project from in-memory storage");
    return await inMemoryStore.getProject(projectId);
  }

  const command = new GetItemCommand({
    TableName: PROJECTS_TABLE,
    Key: marshall({ id: projectId }),
  });

  const response = await client!.send(command);
  return response.Item ? unmarshall(response.Item) : null;
}

export async function updateProject(projectId: string, updates: any) {
  if (isDemoMode) {
    console.log("🎭 Demo Mode: Updating project in in-memory storage");
    return await inMemoryStore.updateProject(projectId, updates);
  }

  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.keys(updates).forEach((key, index) => {
    updateExpressions.push(`#attr${index} = :val${index}`);
    expressionAttributeNames[`#attr${index}`] = key;
    expressionAttributeValues[`:val${index}`] = updates[key];
  });

  const command = new UpdateItemCommand({
    TableName: PROJECTS_TABLE,
    Key: marshall({ id: projectId }),
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: "ALL_NEW",
  });

  const response = await client!.send(command);
  return response.Attributes ? unmarshall(response.Attributes) : null;
}

export async function createModule(module: any) {
  if (isDemoMode) {
    console.log("🎭 Demo Mode: Creating module in in-memory storage");
    return await inMemoryStore.createModule(module);
  }

  const command = new PutItemCommand({
    TableName: MODULES_TABLE,
    Item: marshall(module),
  });

  await client!.send(command);
  return module;
}

export async function getModulesByProject(projectId: string) {
  if (isDemoMode) {
    console.log("🎭 Demo Mode: Retrieving modules from in-memory storage");
    return await inMemoryStore.getModulesByProject(projectId);
  }

  const command = new QueryCommand({
    TableName: MODULES_TABLE,
    KeyConditionExpression: "projectId = :projectId",
    ExpressionAttributeValues: marshall({
      ":projectId": projectId,
    }),
  });

  const response = await client!.send(command);
  return response.Items?.map((item) => unmarshall(item)) || [];
}

export async function updateModule(moduleId: string, updates: any) {
  if (isDemoMode) {
    console.log("🎭 Demo Mode: Updating module in in-memory storage");
    // For demo mode, we need to find the module first to get projectId
    // This is a simplified version - in production, moduleId would be unique
    return updates;
  }

  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.keys(updates).forEach((key, index) => {
    updateExpressions.push(`#attr${index} = :val${index}`);
    expressionAttributeNames[`#attr${index}`] = key;
    expressionAttributeValues[`:val${index}`] = updates[key];
  });

  const command = new UpdateItemCommand({
    TableName: MODULES_TABLE,
    Key: marshall({ id: moduleId }),
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: "ALL_NEW",
  });

  const response = await client!.send(command);
  return response.Attributes ? unmarshall(response.Attributes) : null;
}
