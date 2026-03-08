# AWS Deployment Guide

This guide covers deploying the AI Dev Platform to AWS using various services.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Node.js 18+ installed
- Git repository

## Deployment Options

### Option 1: AWS Amplify (Recommended for MVP)

AWS Amplify provides the easiest deployment with automatic CI/CD.

#### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ai-dev-platform.git
git push -u origin main
```

#### Step 2: Deploy to Amplify

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Configure build settings:

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
environment:
  variables:
    NEXT_PUBLIC_API_URL: 'https://your-domain.amplifyapp.com'
```

5. Add Environment Variables:
   - AWS_REGION
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - BEDROCK_MODEL_ID
   - DYNAMODB_PROJECTS_TABLE
   - DYNAMODB_MODULES_TABLE
   - S3_BUCKET_NAME

6. Deploy

#### Step 3: Configure Custom Domain (Optional)

1. Go to "Domain management"
2. Add custom domain
3. Update DNS settings

### Option 2: Vercel

Vercel provides excellent Next.js hosting with serverless functions.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
vercel
```

#### Step 3: Add Environment Variables

```bash
vercel env add AWS_REGION
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add BEDROCK_MODEL_ID
vercel env add DYNAMODB_PROJECTS_TABLE
vercel env add DYNAMODB_MODULES_TABLE
vercel env add S3_BUCKET_NAME
```

#### Step 4: Production Deployment

```bash
vercel --prod
```

### Option 3: AWS Lambda + API Gateway + CloudFront

For full AWS infrastructure control.

#### Architecture

```
CloudFront → API Gateway → Lambda Functions → Bedrock/DynamoDB
```

#### Step 1: Build for Production

```bash
npm run build
```

#### Step 2: Package Lambda Functions

Create `serverless.yml`:

```yaml
service: ai-dev-platform

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    AWS_REGION: ${env:AWS_REGION}
    BEDROCK_MODEL_ID: ${env:BEDROCK_MODEL_ID}
    DYNAMODB_PROJECTS_TABLE: ${env:DYNAMODB_PROJECTS_TABLE}
    DYNAMODB_MODULES_TABLE: ${env:DYNAMODB_MODULES_TABLE}

functions:
  createProject:
    handler: api/projects/create.handler
    events:
      - http:
          path: /projects/create
          method: post
          cors: true

  importProject:
    handler: api/projects/import.handler
    events:
      - http:
          path: /projects/import
          method: post
          cors: true

  getProject:
    handler: api/projects/[id].handler
    events:
      - http:
          path: /projects/{id}
          method: get
          cors: true

  generateModule:
    handler: api/modules/generate.handler
    events:
      - http:
          path: /modules/generate
          method: post
          cors: true
```

#### Step 3: Deploy with Serverless Framework

```bash
npm install -g serverless
serverless deploy
```

## AWS Resource Setup

### 1. DynamoDB Tables

#### Create Projects Table

```bash
aws dynamodb create-table \
    --table-name ai-dev-platform-projects \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### Create Modules Table

```bash
aws dynamodb create-table \
    --table-name ai-dev-platform-modules \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=projectId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "[
            {
                \"IndexName\": \"projectId-index\",
                \"KeySchema\": [{\"AttributeName\":\"projectId\",\"KeyType\":\"HASH\"}],
                \"Projection\":{\"ProjectionType\":\"ALL\"},
                \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
            }
        ]" \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

### 2. S3 Bucket

```bash
aws s3 mb s3://ai-dev-platform-code-storage --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket ai-dev-platform-code-storage \
    --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
    --bucket ai-dev-platform-code-storage \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'
```

### 3. Amazon Bedrock

#### Enable Model Access

1. Go to AWS Console → Amazon Bedrock
2. Click "Model access" in left sidebar
3. Click "Modify model access"
4. Select "Anthropic - Claude 3.5 Sonnet"
5. Click "Save changes"
6. Wait for approval (usually instant)

#### Verify Access

```bash
aws bedrock list-foundation-models --region us-east-1
```

### 4. IAM Permissions

Create IAM policy for the application:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/ai-dev-platform-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ai-dev-platform-code-storage",
        "arn:aws:s3:::ai-dev-platform-code-storage/*"
      ]
    }
  ]
}
```

Attach to IAM user:

```bash
aws iam create-policy \
    --policy-name AiDevPlatformPolicy \
    --policy-document file://policy.json

aws iam attach-user-policy \
    --user-name your-user \
    --policy-arn arn:aws:iam::ACCOUNT_ID:policy/AiDevPlatformPolicy
```

## Monitoring and Logging

### 1. CloudWatch Logs

```bash
# Create log group
aws logs create-log-group \
    --log-group-name /aws/ai-dev-platform \
    --region us-east-1

# Set retention
aws logs put-retention-policy \
    --log-group-name /aws/ai-dev-platform \
    --retention-in-days 7
```

### 2. CloudWatch Alarms

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
    --alarm-name ai-dev-platform-high-errors \
    --alarm-description "Alert when error rate is high" \
    --metric-name Errors \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1
```

## Cost Optimization

### 1. DynamoDB

- Use on-demand pricing for variable workloads
- Enable auto-scaling for provisioned capacity
- Set up DynamoDB Accelerator (DAX) for caching if needed

### 2. Bedrock

- Cache AI responses when possible
- Implement request throttling
- Monitor token usage

### 3. S3

- Use lifecycle policies to move old files to Glacier
- Enable intelligent tiering
- Compress files before storage

### Cost Estimation (Monthly)

- **DynamoDB**: $1-5 (on-demand, low traffic)
- **Bedrock**: $10-50 (depends on usage)
- **S3**: $1-3 (1GB storage)
- **Amplify/Vercel**: $0-20 (free tier available)
- **Total**: ~$15-80/month for MVP

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Security Best Practices

1. **Use AWS Secrets Manager for credentials**
   ```bash
   aws secretsmanager create-secret \
       --name ai-dev-platform/bedrock \
       --secret-string '{"apiKey":"xxx"}'
   ```

2. **Enable AWS WAF for API Gateway**

3. **Use VPC for Lambda functions** (optional)

4. **Enable CloudTrail for audit logs**

5. **Implement CORS properly**

## Troubleshooting

### Bedrock Access Issues

```bash
# Check model access
aws bedrock list-foundation-models --region us-east-1

# Test invocation
aws bedrock-runtime invoke-model \
    --model-id anthropic.claude-3-5-sonnet-20241022-v2:0 \
    --body '{"prompt":"Hello","max_tokens":100}' \
    --region us-east-1 \
    output.json
```

### DynamoDB Connection Issues

```bash
# Verify table exists
aws dynamodb describe-table \
    --table-name ai-dev-platform-projects \
    --region us-east-1

# Test write
aws dynamodb put-item \
    --table-name ai-dev-platform-projects \
    --item '{"id":{"S":"test"},"name":{"S":"Test Project"}}'
```

### Lambda Function Issues

```bash
# View logs
aws logs tail /aws/lambda/function-name --follow

# Check function configuration
aws lambda get-function --function-name function-name
```

## Rollback Procedure

### Amplify

1. Go to Amplify Console
2. Select your app
3. Click on a previous successful deployment
4. Click "Redeploy this version"

### Vercel

```bash
vercel rollback
```

## Production Checklist

- [ ] Domain configured and SSL enabled
- [ ] Environment variables set
- [ ] DynamoDB tables created
- [ ] S3 bucket configured
- [ ] Bedrock model access enabled
- [ ] IAM permissions configured
- [ ] CloudWatch alarms set up
- [ ] Backup strategy implemented
- [ ] Monitoring dashboard created
- [ ] Error tracking configured
- [ ] Load testing completed
- [ ] Security audit performed
