import os
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from jwt import PyJWKClient

from supabase import create_client, Client
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="CivicScribe API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
# --- FIX 1: Use a current, valid model name ---
gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')

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

# Auth0 JWT validation
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unable to validate token: {str(e)}"
        )

# --- IMPROVEMENT 1: Use a single 'upsert' operation for efficiency ---
def get_or_create_user(auth0_sub: str) -> str:
    """
    Get existing user or create a new one using a single upsert operation.
    """
    result = supabase.table("users").upsert({
        "auth0_sub": auth0_sub
    }).execute()
    
    return result.data[0]["id"]

# Routes
@app.get("/")
def health_check():
    return {"status": "Running"}

@app.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    token_payload: dict = Depends(verify_token)
):
    try:
        auth0_sub = token_payload.get("sub")
        user_id = get_or_create_user(auth0_sub)
        
        session_id = request.session_id
        if not session_id:
            new_session = supabase.table("applications").insert({
                "user_id": user_id,
                "form_type": "SNAP" # This can be made dynamic later
            }).execute()
            session_id = new_session.data[0]["id"]
        
        supabase.table("conversation_history").insert({
            "application_id": session_id,
            "sender": "user",
            "message": request.message
        }).execute()
        
        # --- IMPROVEMENT 2: Fetch only the last 10 messages for context ---
        history = supabase.table("conversation_history")\
            .select("*")\
            .eq("application_id", session_id)\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()
        
        # Reverse the order to be chronological
        recent_messages = reversed(history.data)

        # Build context for Gemini
        conversation_context = "You are a helpful assistant for CivicScribe. Help users fill out a SNAP form by asking friendly, one-at-a-time questions.\n\n"
        conversation_context += "Previous conversation:\n"
        
        for msg in recent_messages:
            conversation_context += f"{msg['sender']}: {msg['message']}\n"
        
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
