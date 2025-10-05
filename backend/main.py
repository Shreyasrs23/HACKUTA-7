import os
import uuid
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from jwt import PyJWKClient
import requests

from supabase import create_client, Client
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="CivicScribe API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-pro')

# Auth0 configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]

# Security
security = HTTPBearer()

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str

class User(BaseModel):
    id: str
    auth0_sub: str

# Auth0 JWT validation
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify and decode Auth0 JWT token
    """
    token = credentials.credentials
    
    try:
        # Get the JWKS from Auth0
        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks_client = PyJWKClient(jwks_url)
        
        # Get the signing key
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTClaimsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unable to validate token: {str(e)}"
        )

def get_or_create_user(auth0_sub: str) -> str:
    """
    Get existing user or create a new one based on Auth0 subject ID
    """
    # Check if user exists
    result = supabase.table("users").select("*").eq("auth0_sub", auth0_sub).execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]["id"]
    
    # Create new user
    new_user = supabase.table("users").insert({
        "auth0_sub": auth0_sub
    }).execute()
    
    return new_user.data[0]["id"]

# Routes
@app.get("/")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "Running"}

@app.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Core chat endpoint with Auth0 authentication
    """
    try:
        # Get or create user
        auth0_sub = token_payload.get("sub")
        user_id = get_or_create_user(auth0_sub)
        
        # Handle session
        session_id = request.session_id
        
        if not session_id:
            # Create new application session
            new_session = supabase.table("applications").insert({
                "user_id": user_id,
                "form_type": "SNAP"
            }).execute()
            session_id = new_session.data[0]["id"]
        
        # Save user message to conversation history
        supabase.table("conversation_history").insert({
            "application_id": session_id,
            "sender": "user",
            "message": request.message
        }).execute()
        
        # Get conversation history for context
        history = supabase.table("conversation_history")\
            .select("*")\
            .eq("application_id", session_id)\
            .order("created_at")\
            .execute()
        
        # Build context for Gemini
        conversation_context = "You are a helpful assistant helping users fill out a SNAP (Food Assistance) application form. Ask questions one at a time to gather the necessary information. Be friendly and conversational.\n\n"
        conversation_context += "Form fields needed:\n"
        conversation_context += "- Full Name\n"
        conversation_context += "- Date of Birth\n"
        conversation_context += "- Address\n"
        conversation_context += "- Phone Number\n"
        conversation_context += "- Number of Household Members\n"
        conversation_context += "- Monthly Income\n\n"
        conversation_context += "Previous conversation:\n"
        
        for msg in history.data[:-1]:  # Exclude the message we just added
            conversation_context += f"{msg['sender']}: {msg['message']}\n"
        
        conversation_context += f"user: {request.message}\n"
        conversation_context += "ai: "
        
        # Get AI response from Gemini
        response = gemini_model.generate_content(conversation_context)
        ai_reply = response.text
        
        # Save AI response to conversation history
        supabase.table("conversation_history").insert({
            "application_id": session_id,
            "sender": "ai",
            "message": ai_reply
        }).execute()
        
        return ChatResponse(
            reply=ai_reply,
            session_id=session_id
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
