# Vercel Deployment Steps for Khoj Search Engine

This document outlines the steps needed to successfully deploy the Khoj Search Engine on Vercel.

## 1. Setting Up the Project on Vercel

1. Create a new project on Vercel and connect it to your GitHub repository.
2. In the project settings, configure the following:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 2. Environment Variables

No sensitive environment variables are required for this project.

## 3. Vercel Specific Configuration

The project includes the following Vercel-specific files:

- **vercel.json**: Configures routing and environment settings for Vercel deployment
- **api/**: Contains serverless functions for Vercel's API routes
- **vercel-build.sh**: Custom build script for Vercel deployment

## 4. Troubleshooting Common Issues

### API Routes Not Working

If API routes return 404 errors, verify:
- The API route files are correctly formatted as serverless functions
- The routing configuration in vercel.json is correct
- The paths in frontend API requests match the API route paths

### Build Errors

If encountering build errors:
- Check the build logs in the Vercel dashboard
- Ensure all dependencies are correctly installed
- Verify the TypeScript configuration is compatible with Vercel

## 5. Development vs Production

- **Development**: Uses Express server with Vite for frontend development
- **Production**: Uses Vercel's serverless functions and static site hosting

## 6. Deployment Workflow

The typical deployment workflow is:
1. Push code to the connected GitHub repository
2. Vercel automatically builds and deploys the application
3. Check the deployment logs for any issues
4. Verify the deployed application functions correctly