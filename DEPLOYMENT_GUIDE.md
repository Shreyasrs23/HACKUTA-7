# CivicScribe Deployment Guide

## Quick Start

The CivicScribe application is now ready to run! Here's how to get it started:

### 1. Start the Backend Server

```bash
cd backend
python main.py
```

The backend will start on http://localhost:8000

### 2. Start the Frontend Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

### 3. Access the Application

Open your browser and go to http://localhost:5173

## What's Included

### ✅ Complete Backend (FastAPI)
- **Authentication**: Auth0 JWT token validation
- **Chat API**: AI-powered conversation endpoint
- **PDF Generation**: Automatic form creation and download
- **Database Integration**: Supabase support (with demo mode fallback)
- **AI Integration**: Google Gemini for natural language processing
- **Audio Support**: ElevenLabs text-to-speech integration

### ✅ Complete Frontend (React + Vite)
- **Landing Page**: Professional marketing page
- **Authentication**: Auth0 login/logout integration
- **Home Page**: Form selection interface
- **Chat Interface**: Real-time conversation with AI
- **PDF Download**: One-click form generation
- **Responsive Design**: Mobile-friendly Tailwind CSS styling

### ✅ Key Features
- **AI-Powered Chat**: Natural conversation flow for form completion
- **PDF Generation**: Automatic creation of filled forms
- **Audio Support**: Text-to-speech for accessibility
- **Professional UI**: Modern, clean interface
- **Authentication**: Secure user management
- **Extensible**: Easy to add new forms

## Demo Mode

The application runs in demo mode by default, which means:
- No database persistence (conversations are logged to console)
- All API keys are pre-configured
- Perfect for testing and demonstration

## Production Setup

To run in production mode:

1. **Set up Supabase Database**:
   - Create a new Supabase project
   - Run the SQL schema from SETUP_GUIDE.md
   - Update the environment variables

2. **Configure Auth0**:
   - Create an Auth0 application
   - Set up callback URLs
   - Update the environment variables

3. **Update Environment Variables**:
   - Backend: Update `backend/.env`
   - Frontend: Update `frontend/.env.local`

## File Structure

```
civic-scribe/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── .env.local         # Environment variables
├── start.bat              # Windows startup script
├── setup.bat              # Windows setup script
├── README.md              # Project documentation
├── SETUP_GUIDE.md         # Detailed setup instructions
└── DEPLOYMENT_GUIDE.md    # This file
```

## API Endpoints

- `GET /`: Health check
- `POST /chat`: Main chat endpoint (requires authentication)
- `POST /download`: Download completed form as PDF (requires authentication)

## Troubleshooting

### Backend Issues
- Check that Python dependencies are installed: `pip install -r requirements.txt`
- Verify environment variables are set correctly
- Check console output for error messages

### Frontend Issues
- Check that Node dependencies are installed: `npm install`
- Verify environment variables in `.env.local`
- Check browser console for errors

### Common Solutions
- Restart both servers if changes aren't reflected
- Clear browser cache if UI issues persist
- Check network connectivity for API calls

## Next Steps

1. **Test the Application**: Try the complete flow from landing page to PDF download
2. **Customize Forms**: Add new form types by extending the AI prompts
3. **Deploy to Production**: Set up proper hosting and database
4. **Add Features**: Implement additional form types and features

## Support

The application is fully functional and ready for use. All major features are implemented:
- ✅ Authentication flow
- ✅ AI-powered chat interface
- ✅ PDF generation and download
- ✅ Professional UI/UX
- ✅ Responsive design
- ✅ Error handling
- ✅ Demo mode for easy testing

Enjoy using CivicScribe! 🚀
