# AWS Configuration Library

This library provides centralized AWS service configuration for the frontend to communicate with API Gateway.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-client-id
```

## Usage

```typescript
import { apiClient } from '@/lib/aws-config';

// All API calls go through API Gateway
const response = await apiClient.post('/projects/create', {
  idea: 'Build an e-commerce platform'
});
```
