# CivicScribe Setup Guide

This guide will help you set up and run the CivicScribe application on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** and npm
- **Python 3.8+** and pip
- **Git** (for cloning the repository)

## Quick Setup

### 1. Install Dependencies

Run the setup script to install all dependencies:

```bash
# Windows
setup.bat

# Or manually:
cd backend
pip install -r requirements.txt
cd ../frontend
npm install
```

### 2. Database Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, run the following schema:

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

3. Copy your Supabase URL and anon key from the project settings

### 3. Auth0 Setup

1. Go to [Auth0](https://auth0.com) and create a new application
2. Set the application type to "Single Page Application"
3. Add `http://localhost:5173` to the allowed callback URLs
4. Add `http://localhost:5173` to the allowed logout URLs
5. Copy your Domain, Client ID, and Audience from the application settings

### 4. API Keys Setup

1. **Google Gemini AI**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **ElevenLabs**: Get your API key from [ElevenLabs](https://elevenlabs.io)

### 5. Environment Configuration

Update the environment files with your credentials:

**backend/.env**:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**frontend/.env.local**:
```env
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
VITE_API_BASE=http://localhost:8000
```

## Running the Application

### Option 1: Using the startup script (Windows)

```bash
start.bat
```

### Option 2: Manual startup

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Testing the Application

1. **Landing Page**: Visit http://localhost:5173
2. **Authentication**: Click "Start Your Application" and log in with Google
3. **Form Selection**: Choose "Food Assistance (SNAP)" and click "Start Application"
4. **Chat Interface**: Answer the AI's questions about your information
5. **Download**: Once complete, click "Download Form" to get your filled PDF

## Troubleshooting

### Common Issues

1. **Backend won't start**: Check that all environment variables are set correctly
2. **Frontend won't start**: Ensure Node.js and npm are installed
3. **Authentication fails**: Verify Auth0 configuration and callback URLs
4. **Database errors**: Check Supabase connection and table schema
5. **AI not responding**: Verify Gemini API key is correct

### Logs

- Backend logs: Check the terminal where you ran `python main.py`
- Frontend logs: Check the browser console (F12)
- Database logs: Check Supabase dashboard

## Development

### Project Structure

```
civic-scribe/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── .env.local         # Environment variables
├── start.bat              # Windows startup script
├── setup.bat              # Windows setup script
└── README.md              # Project documentation
```

### Adding New Forms

1. Create a new form configuration
2. Add the form to the frontend form selection
3. Update the AI prompts for the new form type
4. Add PDF generation logic for the new form

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify all environment variables are correct

For additional help, create an issue in the repository or contact the development team.
