# CivicScribe

An AI-powered web application that helps users fill out complex PDF forms through a simple, conversational chat interface.

## Project Overview

CivicScribe uses conversational AI to guide users through complex government forms (starting with SNAP/Food Assistance applications) in a friendly, accessible way. The system is designed to be extensible via "Form Packs" to support any form without requiring code changes.

## Features

- 🤖 **AI-Powered Conversations**: Natural language chat interface powered by Google's Gemini AI
- 🔐 **Secure Authentication**: Auth0 integration with JWT token validation
- 💾 **Persistent Sessions**: Conversation history stored in Supabase
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 🔊 **Text-to-Speech**: Browser-based speech synthesis for AI responses
- 📱 **Mobile-Friendly**: Fully responsive design

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database and real-time features
- **Google Gemini AI** - Conversational AI model
- **Auth0** - Authentication and authorization
- **JWT** - Token-based authentication

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Auth0 React SDK** - Authentication integration
- **Axios** - HTTP client

## Project Structure

```
civic-scribe/
├── backend/
│   ├── .env                    # Environment variables (DO NOT COMMIT)
│   ├── main.py                 # FastAPI application
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── .env.local              # Frontend environment variables (DO NOT COMMIT)
│   ├── index.html              # HTML entry point
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   └── src/
│       ├── main.jsx            # React entry point with Auth0Provider
│       ├── App.jsx             # Main application component
│       ├── index.css           # Global styles with Tailwind imports
│       └── components/
│           ├── ChatWindow.jsx  # Main chat interface
│           └── LoginButton.jsx # Authentication button
└── README.md                   # This file
```

## Database Schema

The application uses Supabase (PostgreSQL) with the following schema:

```sql
-- Table to store unique users based on their Auth0 ID
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_sub TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table to hold application sessions, linked to a user
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  form_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table to store individual messages
CREATE TABLE conversation_history (
  id BIGSERIAL PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- A Supabase account and project
- An Auth0 account and application
- Google AI (Gemini) API key

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the database schema provided above
3. Note your Supabase URL and anon key from Project Settings > API

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. The `.env` file is already configured with the necessary credentials.

5. Start the FastAPI server:
   ```bash
   python main.py
   ```
   
   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The `.env.local` file is already configured with the necessary credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## Usage

### UX Flow: "Meet Maria"

1. **Home Page**: Maria visits the site and sees "Start Your Application"
2. **Authentication**: She clicks and logs in via Auth0 (Google)
3. **Welcome Page**: She sees "Welcome, Maria!" and a card for "Food Assistance (SNAP)"
4. **Start Application**: She clicks "Start Application" on the SNAP card
5. **Chat Interface**: A chat window opens with the first AI message asking for her name
6. **Conversation**: She types answers, and the AI asks follow-up questions with audio
7. **Completion**: After all fields are collected, she can download her completed form

### Form Fields (SNAP Application)

The AI assistant will collect the following information:
- Full Name
- Date of Birth
- Address
- Phone Number
- Number of Household Members
- Monthly Income

## API Endpoints

### `GET /`
Health check endpoint
- **Response**: `{"status": "Running"}`

### `POST /chat`
Main chat endpoint (requires authentication)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "message": "string",
    "session_id": "uuid (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "string",
    "session_id": "uuid"
  }
  ```

## Authentication Flow

1. User clicks "Start Your Application"
2. Auth0 Universal Login appears
3. User authenticates (Google, email/password, etc.)
4. Auth0 redirects back with an authorization code
5. Frontend exchanges code for JWT access token
6. Frontend includes JWT in `Authorization` header for API requests
7. Backend validates JWT and extracts user identity
8. Backend creates/retrieves user record in Supabase

## Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

### Building for Production

#### Backend
The FastAPI application can be deployed to any platform that supports Python:
- Heroku
- Railway
- AWS Lambda (with Mangum)
- Google Cloud Run
- Your own VPS

#### Frontend
```bash
cd frontend
npm run build
```
The built files will be in `frontend/dist/` and can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Future Enhancements

- [ ] PDF generation and filling functionality
- [ ] Form Packs system for supporting multiple form types
- [ ] Document upload and parsing
- [ ] Multi-language support
- [ ] Voice input/output with ElevenLabs
- [ ] Progress indicators
- [ ] Form field validation
- [ ] Save and resume functionality
- [ ] Admin dashboard
- [ ] Analytics and reporting

## Security Notes

- Never commit `.env` files to version control
- Rotate API keys regularly
- Use environment variables for all sensitive data
- Enable Row Level Security (RLS) in Supabase for production
- Implement rate limiting on API endpoints
- Use HTTPS in production

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

Built with ❤️ for making civic services more accessible
