import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface BedrockMessage {
  role: "user" | "assistant";
  content: string;
}

export async function invokeBedrockModel(
  messages: BedrockMessage[],
  systemPrompt?: string
): Promise<string> {
  const modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4000,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    ...(systemPrompt && { system: systemPrompt }),
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error("Error invoking Bedrock:", error);
    throw error;
  }
}

export async function generateArchitecture(projectIdea: string) {
  const systemPrompt = `You are an expert software architect. Given a project idea, generate a comprehensive architecture breakdown in JSON format.

The response should include:
1. Project name
2. Technology stack (frontend, backend, database, external services)
3. Architecture layers
4. Detailed modules for each layer with dependencies

Return ONLY valid JSON, no markdown or explanations.`;

  const userMessage = {
    role: "user" as const,
    content: `Generate a complete architecture for this project: ${projectIdea}

Return a JSON object with this structure:
{
  "projectName": "string",
  "techStack": {
    "frontend": ["framework", "libraries"],
    "backend": ["framework", "services"],
    "database": ["type"],
    "external": ["services"]
  },
  "layers": [
    {
      "id": "string",
      "name": "string",
      "type": "frontend|backend|database|infrastructure|external",
      "description": "string"
    }
  ],
  "modules": [
    {
      "id": "string",
      "name": "string",
      "layer": "string",
      "type": "string",
      "description": "string",
      "dependencies": ["module-ids"],
      "status": "pending"
    }
  ]
}`,
  };

  const response = await invokeBedrockModel([userMessage], systemPrompt);

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from response");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generateModuleCode(
  moduleName: string,
  moduleDescription: string,
  dependencies: string[],
  techStack: string[]
) {
  const systemPrompt = `You are an expert software developer. Generate production-ready code for a specific module.

Return ONLY valid JSON with this structure:
{
  "files": [
    {
      "id": "string",
      "name": "string",
      "path": "string",
      "content": "string",
      "type": "file"
    }
  ]
}`;

  const userMessage = {
    role: "user" as const,
    content: `Generate code for this module:

Module: ${moduleName}
Description: ${moduleDescription}
Dependencies: ${dependencies.join(", ")}
Tech Stack: ${techStack.join(", ")}

Include all necessary files with complete, production-ready code.`,
  };

  const response = await invokeBedrockModel([userMessage], systemPrompt);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from response");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function analyzeRepository(repoUrl: string) {
  const systemPrompt = `You are an expert code analyst. Analyze a repository and generate an architecture map.

Return ONLY valid JSON with the same structure as generateArchitecture.`;

  const userMessage = {
    role: "user" as const,
    content: `Analyze this repository and generate an architecture map: ${repoUrl}

Note: For this demo, generate a plausible architecture based on common patterns for the repository type.`,
  };

  const response = await invokeBedrockModel([userMessage], systemPrompt);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from response");
  }

  return JSON.parse(jsonMatch[0]);
}
