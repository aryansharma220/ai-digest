# Deploying AI Digest to Vercel

This document outlines the steps to deploy the AI Digest application to Vercel.

## Prerequisites

1. [Vercel Account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli)
3. [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (for production database)
4. Valid Firebase configuration
5. GitHub account (for repository hosting)

## Step-by-Step Deployment Guide

### 1. Prepare Your Project for Deployment

#### Backend Preparation

1. Ensure your MongoDB connection is set up for production:
   - Create a MongoDB Atlas cluster
   - Configure network access and database users
   - Get your connection string

2. Update your backend environment variables for production:
   - In the Vercel dashboard, add all environment variables from `.env`
   - Make sure `NODE_ENV` is set to `production`
   - Update `MONGODB_URI` to use your MongoDB Atlas connection string

#### Frontend Preparation

1. Update the API URL in the frontend environment:
   - Set `VITE_API_URL` to point to your deployed backend URL

### 2. Deploy Backend to Vercel

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your backend directory and deploy:
   ```bash
   cd backend
   vercel
   ```

4. Follow the prompts to configure your deployment:
   - Link to an existing project or create a new one
   - Confirm deployment settings
   - Set environment variables when prompted

5. After deployment, note your backend URL for frontend configuration.

### 3. Deploy Frontend to Vercel

1. Update the frontend `.env` file with your deployed backend URL:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

2. Navigate to your frontend directory and deploy:
   ```bash
   cd ../frontend
   vercel
   ```

3. Follow the prompts to configure your deployment:
   - Link to an existing project or create a new one
   - Confirm deployment settings
   - Set environment variables when prompted

### 4. Connect Your Custom Domain (Optional)

1. In the Vercel dashboard, go to your frontend project settings
2. Navigate to the "Domains" section
3. Add your custom domain and follow the verification process

### 5. Continuous Deployment

For automatic deployments on code changes:

1. Push your code to GitHub
2. Import your repository in the Vercel dashboard
3. Configure the build settings:
   - For frontend: Build command `npm run build`, Output directory `dist`
   - For backend: Build command (leave default), Output directory (leave default)

### Troubleshooting

- **Environment Variables**: Ensure all environment variables are properly set in the Vercel dashboard
- **Build Errors**: Check build logs in the Vercel dashboard for specific errors
- **API Connection Issues**: Verify CORS settings in your backend for the new domain
- **MongoDB Connection**: Ensure your MongoDB Atlas cluster is properly configured to accept connections from Vercel

### Security Considerations

- Never commit sensitive environment variables to your repository
- Set up proper authentication and authorization for your API endpoints
- Use environment variables in Vercel for all sensitive information
