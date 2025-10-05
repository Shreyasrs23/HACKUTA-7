# CivicScribe - AI-Powered Form Assistant

CivicScribe is a universal, AI-powered web application that helps users fill out complex PDF forms through a simple, conversational chat interface. The system is extensible via "Form Packs" to support any form without requiring code changes.

## Features

- 🤖 **AI-Powered Chat Interface**: Natural conversation flow for form completion
- 🔐 **Secure Authentication**: Auth0 integration for user management
- 📄 **PDF Form Generation**: Automatic PDF creation from conversation data
- 🎵 **Audio Support**: Text-to-speech for accessibility
- 🎨 **Modern UI**: Clean, professional interface built with React and Tailwind CSS
- 🔧 **Extensible**: Form Pack system for adding new forms without code changes

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Supabase**: PostgreSQL database with real-time capabilities
- **Google Gemini AI**: Natural language processing
- **ElevenLabs**: Text-to-speech generation
- **Auth0**: Authentication and authorization

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Auth0 React SDK**: Authentication integration

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- Auth0 account
- Google AI API key
- ElevenLabs API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civic-scribe
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables**

   Create `backend/.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_AUDIENCE=your_auth0_audience
   GEMINI_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

   Create `frontend/.env.local`:
   ```env
   VITE_AUTH0_DOMAIN=your_auth0_domain
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id
   VITE_AUTH0_AUDIENCE=your_auth0_audience
   VITE_API_BASE=http://localhost:8000
   ```

5. **Set up the database**

   Run the following SQL in your Supabase SQL editor:
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

6. **Run the application**

   Start the backend:
   ```bash
   cd backend
   python main.py
   ```

   Start the frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Usage

### For Users

1. **Landing Page**: Visit the site and click "Start Your Application"
2. **Authentication**: Log in with Google or other Auth0 providers
3. **Form Selection**: Choose from available forms (currently SNAP)
4. **Chat Interface**: Answer questions in natural conversation
5. **Download**: Get your completed form as a PDF

### For Developers

The application is designed to be extensible. To add new forms:

1. Create a new Form Pack configuration
2. Add the form to the frontend form selection
3. Update the AI prompts for the new form type
4. No code changes required for basic forms

## API Endpoints

- `GET /`: Health check
- `POST /chat`: Main chat endpoint (requires authentication)

## Database Schema

The application uses three main tables:
- `users`: Stores user information linked to Auth0
- `applications`: Tracks form completion sessions
- `conversation_history`: Stores all chat messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@civicscribe.com or create an issue in the repository.
