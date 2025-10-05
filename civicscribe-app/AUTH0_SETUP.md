# Auth0 Setup Guide for CivicScribe

This guide will help you set up Auth0 authentication for the CivicScribe application.

## Prerequisites

- A free Auth0 account (sign up at https://auth0.com)
- Node.js and npm installed
- CivicScribe app dependencies installed (`npm install`)

## Step 1: Create an Auth0 Application

1. Go to the [Auth0 Dashboard](https://manage.auth0.com/)
2. Click on "Applications" in the left sidebar
3. Click "Create Application"
4. Name your application (e.g., "CivicScribe")
5. Select "Regular Web Applications"
6. Click "Create"

## Step 2: Configure Your Auth0 Application

1. In your Auth0 application settings, find the following information:
   - **Domain** (e.g., `your-tenant.auth0.com`)
   - **Client ID**
   - **Client Secret**

2. Configure the **Allowed Callback URLs**:
   ```
   http://localhost:3000/auth/callback
   ```

3. Configure the **Allowed Logout URLs**:
   ```
   http://localhost:3000
   ```

4. Configure the **Allowed Web Origins**:
   ```
   http://localhost:3000
   ```
   
   **Note**: In Auth0 SDK v4, the authentication routes are at `/auth/*` instead of `/api/auth/*`.

5. Click "Save Changes"

## Step 3: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Generate a secret for `AUTH0_SECRET`:
   ```bash
   openssl rand -hex 32
   ```

3. Update `.env.local` with your Auth0 credentials:
   ```env
   AUTH0_SECRET='your-generated-secret-here'
   APP_BASE_URL='http://localhost:3000'
   AUTH0_DOMAIN='your-tenant.auth0.com'
   AUTH0_CLIENT_ID='your-client-id'
   AUTH0_CLIENT_SECRET='your-client-secret'
   ```
   
   **Note**: For Auth0 v4, use `APP_BASE_URL` instead of `AUTH0_BASE_URL`, and `AUTH0_DOMAIN` instead of `AUTH0_ISSUER_BASE_URL`.

## Step 4: Enable Sign Up

By default, Auth0 allows both login and signup. To customize the sign-up experience:

1. Go to your Auth0 Dashboard
2. Navigate to "Authentication" → "Database" → "Username-Password-Authentication"
3. Ensure "Disable Sign Ups" is turned OFF
4. Configure password policies and requirements as needed

## Step 5: Test Your Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Click on the "Sign Up" button to create a new account

4. Click on the "Sign In" button to log in with existing credentials

5. After logging in, you should see your user profile in the header with a logout button

## Features Implemented

### Sign In
- Users can sign in with email/password
- Uses Auth0's Universal Login page
- Secure authentication flow

### Sign Up
- New users can create accounts
- Email verification can be enabled in Auth0 settings
- Customizable password requirements

### User Profile
- Displays user avatar and name in the header when logged in
- Shows user information from Auth0 profile

### Logout
- Secure logout with session cleanup
- Redirects to home page after logout

## Customization Options

### Customize Login/Signup UI

You can customize the Auth0 Universal Login page:
1. Go to "Branding" → "Universal Login" in Auth0 Dashboard
2. Choose a template or create a custom design
3. Add your branding, colors, and logo

### Add Social Login

To enable social login (Google, Facebook, etc.):
1. Go to "Authentication" → "Social" in Auth0 Dashboard
2. Click on the provider you want to enable
3. Follow the setup instructions for each provider
4. The login page will automatically show social login options

### Email Verification

To require email verification:
1. Go to "Authentication" → "Database" → "Username-Password-Authentication"
2. Enable "Requires Verification"
3. Configure email templates under "Branding" → "Email Templates"

## Production Deployment

When deploying to production:

1. Update `AUTH0_BASE_URL` to your production URL
2. Add your production URL to Auth0 Allowed Callback URLs, Logout URLs, and Web Origins
3. Never commit `.env.local` to version control
4. Use environment variables in your hosting platform for sensitive values

## Troubleshooting

### "Invalid state" error
- Make sure `AUTH0_SECRET` is set and is at least 32 characters
- Clear browser cookies and try again

### "Callback URL mismatch" error
- Verify the callback URL in Auth0 matches your `AUTH0_BASE_URL`
- Check for trailing slashes in URLs

### Users not appearing after signup
- Check Auth0 Dashboard → "User Management" → "Users" to see registered users
- Verify email verification settings if emails aren't being received

## Additional Resources

- [Auth0 Next.js SDK Documentation](https://github.com/auth0/nextjs-auth0)
- [Auth0 Documentation](https://auth0.com/docs)
- [Auth0 Quickstarts](https://auth0.com/docs/quickstarts)
