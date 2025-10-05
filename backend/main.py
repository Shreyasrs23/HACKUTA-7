import os
import jwt
import httpx
import time
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from supabase import create_client, Client
import google.generativeai as genai
from elevenlabs import generate, set_api_key
import json
from typing import Optional
from dotenv import load_dotenv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

# Load environment variables
load_dotenv()

# --- Configuration and Initialization ---

# Securely retrieve environment variables
try:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
    AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    
    if not all([AUTH0_DOMAIN, AUTH0_AUDIENCE, GEMINI_API_KEY, ELEVENLABS_API_KEY]):
        raise ValueError("One or more critical API keys are missing.")

except Exception as e:
    raise RuntimeError(f"Missing critical environment variable: {e}")

# FIX: Global dictionary to store history when Supabase is unavailable (Demo Mode)
DEMO_HISTORY = {} 

# Initialize FastAPI
app = FastAPI(title="CivicScribe API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: Using hardcoded test_url/key for demonstration as env vars failed previously.
test_url = "https://lgmtsicuwoixjsbrdgyw.supabase.co"
test_key = "eyJhYmciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbXRzaWN1d29peGpzYnJkZ3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTk3NzAsImV4cCI6MjA3NTE3NTc3MH0.fdV4Cy8rA7JF_EpeQc3pOzTdXyPzXrE53aCttjJvxok" 

# Initialize Supabase client
try:
    # Use environment variables if available, otherwise use hardcoded test values
    supabase_connect_url = SUPABASE_URL or test_url
    supabase_connect_key = SUPABASE_KEY or test_key
    supabase: Optional[Client] = create_client(supabase_connect_url, supabase_connect_key)
except Exception as e:
    print(f"Warning: Could not initialize Supabase client: {e}. Running in demo mode without database persistence.")
    supabase = None

# Initialize Gemini AI (Using the correct, stable model ID)
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Initialize ElevenLabs
set_api_key(ELEVENLABS_API_KEY)

# --- Pydantic Models ---

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    audio_url: Optional[str] = None

class DownloadRequest(BaseModel):
    session_id: str

# --- Auth0 Security Functions (Unchanged, retaining security fix) ---

def get_jwks():
    """Get Auth0 JWKS for token verification"""
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = httpx.get(jwks_url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching JWKS: {str(e)}")

def verify_token(authorization: str = Header(None)):
    """Verify Auth0 JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        jwks = get_jwks()
        header = jwt.get_unverified_header(token)
        rsa_key = next(
            (key for key in jwks["keys"] if key["kid"] == header["kid"]),
            None
        )
        if rsa_key is None:
            raise HTTPException(status_code=401, detail="Invalid token: Public key not found in JWKS")

        issuer_url = f"https://{AUTH0_DOMAIN}/"
        
        decoded_token = jwt.decode(
            token,
            key=jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(rsa_key)),
            audience=AUTH0_AUDIENCE,
            issuer=issuer_url,
            algorithms=[header["alg"]]
        )
        return decoded_token
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidAudienceError:
        raise HTTPException(status_code=401, detail="Invalid token audience")
    except jwt.InvalidIssuerError:
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# --- Utility Functions (Modified for Demo Mode Persistence) ---

def get_or_create_user(auth0_sub: str):
    """Get or create user in database (handles demo mode)"""
    if not supabase:
        return f"demo_user_{auth0_sub[:8]}"
    
    try:
        result = supabase.table("users").select("*").eq("auth0_sub", auth0_sub).execute()
        if result.data:
            return result.data[0]["id"]
        
        new_user = supabase.table("users").insert({"auth0_sub": auth0_sub}).execute()
        return new_user.data[0]["id"]
    except Exception as e:
        print(f"Error managing user: {e}")
        raise HTTPException(status_code=500, detail="Database error")

def create_application_session(user_id: str, form_type: str = "SNAP"):
    """Create a new application session (handles demo mode)"""
    session_id = f"demo_session_{user_id}_{form_type}_{int(time.time())}"
    
    if not supabase:
        # DEMO MODE: Initialize session in demo history storage
        DEMO_HISTORY[session_id] = []
        return session_id
    
    try:
        result = supabase.table("applications").insert({"user_id": user_id, "form_type": form_type}).execute()
        return result.data[0]["id"]
    except Exception as e:
        print(f"Error creating application: {e}")
        raise HTTPException(status_code=500, detail="Database error")

def save_message(application_id: str, sender: str, message: str):
    """Save message to conversation history (FIXED for demo mode)"""
    if not supabase:
        # DEMO MODE: Store in global memory (FIX for repeating question)
        if application_id not in DEMO_HISTORY:
            DEMO_HISTORY[application_id] = []
        
        DEMO_HISTORY[application_id].append({"sender": sender, "message": message})
        return
    
    try:
        supabase.table("conversation_history").insert({
            "application_id": application_id,
            "sender": sender,
            "message": message
        }).execute()
    except Exception as e:
        print(f"Error saving message: {e}")

def get_conversation_history(session_id: str) -> list:
    """Retrieves conversation history (FIXED for demo mode)"""
    if not supabase:
        # DEMO MODE: Retrieve from global memory (FIX for repeating question)
        return DEMO_HISTORY.get(session_id, [])

    try:
        history_result = supabase.table("conversation_history").select("*").eq("application_id", session_id).order("created_at").execute()
        return history_result.data or []
    except Exception as e:
        print(f"Error retrieving history: {e}")
        return []

def generate_audio(text: str) -> Optional[str]:
    """Generate audio using ElevenLabs (Returns placeholder URL for demo)"""
    try:
        generate(
            text=text,
            voice="Rachel",
            model="eleven_monolingual_v1",
            stream=True
        )
        return "audio_placeholder_url"
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None

def get_ai_response(message: str, conversation_history: list) -> str:
    """
    Get AI response from Gemini. 
    Uses the MINIMALIST prompt and limits turns to ~15 questions.
    """
    try:
        # CONCISE, ACTION-ORIENTED PROMPT
        context = """
PERSONA: You are CivicScribe, a friendly, professional AI assistant for SNAP applications. Your sole function is to guide the user to fill out a form summary.

STRICT LIMIT: The conversation must complete the data collection process in a maximum of 15 questions (15 user answers). After collecting the answer to the 15th question, immediately move to the final review/output.

CONVERSATION PLAN (Ask ONE question per step):
1.  **State & Language:** State of residence, preferred language, accessibility needs.
2.  **Applicant Basics:** Full legal name, Date of Birth (YYYY-MM-DD).
3.  **Contact Info:** Phone and email.
4.  **Residence:** Residential address.
5.  **Household Size:** Number of people living together.
6.  **Household Member 1:** Name, relationship, DOB for the first member.
7.  **Household Member 2:** Name, relationship, DOB for the second member (if size > 2).
8.  **ID Status:** Last 4 of SSN (optional), citizenship status.
9.  **Current Income:** Current employment/employer and gross income amount/frequency.
10. **Other Income 1:** Any other income source (e.g., social security, unemployment).
11. **Other Income 2:** Second other income source (if any).
12. **Housing Expense:** Rent or mortgage amount and frequency.
13. **Utility Expenses:** Which utilities household pays (e.g., electric, gas).
14. **Asset Check:** Checkable assets (cash, bank accounts).
15. **Final Confirmation:** Ask: "Would you like me to generate a final summary for your application now?"

GUARDRAIL: If asked for legal or eligibility advice, reply: "I can't decide eligibility or give legal advice. I'm here only to help collect answers for your application."

ACTION:
1.  Review the "Current conversation context" below.
2.  Acknowledge the user's **LAST ANSWER**.
3.  Ask the **NEXT** question from the CONVERSATION PLAN.
4.  Ask **ONE** question per turn.

Current conversation context (Last 50 turns):
"""
        
        for msg in conversation_history[-50:]:
            context += f"{msg['sender']}: {msg['message']}\n"
        
        context += f"User: {message}\n"
        context += "AI: "
        
        response = model.generate_content(context)
        return response.text

    except Exception as e:
        print(f"Error getting AI response: {e}")
        return "I apologize, but I'm having trouble processing your request. Please try again."

def extract_form_data(conversation_history: list) -> dict:
    """Extract form data from conversation history (keyword heuristics)."""
    form_data: dict[str, str] = {
        "state": "",
        "language": "",
        "full_name": "",
        "dob": "",
        "phone": "",
        "email": "",
        "address": "",
        "household_size": "",
        "member1": "",
        "member2": "",
        "ssn_last4": "",
        "citizenship": "",
        "employment": "",
        "income": "",
        "other_income1": "",
        "other_income2": "",
        "rent": "",
        "utilities": "",
        "assets": "",
    }

    for msg in conversation_history:
        if msg.get("sender") != "user":
            continue
        raw = msg.get("message", "")
        content = raw.lower()

        if "state" in content and not form_data["state"]:
            form_data["state"] = raw
        if ("language" in content or "english" in content or "spanish" in content) and not form_data["language"]:
            form_data["language"] = raw
        if ("full name" in content or "name is" in content or content.startswith("name")) and not form_data["full_name"]:
            form_data["full_name"] = raw
        if ("dob" in content or "birth" in content) and not form_data["dob"]:
            form_data["dob"] = raw
        if ("phone" in content or "number" in content) and not form_data["phone"]:
            form_data["phone"] = raw
        if "email" in content and not form_data["email"]:
            form_data["email"] = raw
        if "address" in content and not form_data["address"]:
            form_data["address"] = raw
        if ("household" in content and "size" in content) and not form_data["household_size"]:
            form_data["household_size"] = raw
        if ("member 1" in content or "first member" in content) and not form_data["member1"]:
            form_data["member1"] = raw
        if ("member 2" in content or "second member" in content) and not form_data["member2"]:
            form_data["member2"] = raw
        if ("ssn" in content or "last 4" in content) and not form_data["ssn_last4"]:
            form_data["ssn_last4"] = raw
        if ("citizen" in content or "residen" in content or "immigrant" in content) and not form_data["citizenship"]:
            form_data["citizenship"] = raw
        if ("employ" in content) and not form_data["employment"]:
            form_data["employment"] = raw
        if ("income" in content and ("gross" in content or "amount" in content)) and not form_data["income"]:
            form_data["income"] = raw
        if ("other" in content and "income" in content) and not form_data["other_income1"]:
            form_data["other_income1"] = raw
        elif ("other" in content and "income" in content) and not form_data["other_income2"]:
            form_data["other_income2"] = raw
        if ("rent" in content or "mortgage" in content) and not form_data["rent"]:
            form_data["rent"] = raw
        if ("utility" in content or "utilities" in content) and not form_data["utilities"]:
            form_data["utilities"] = raw
        if ("asset" in content or "bank" in content or "cash" in content) and not form_data["assets"]:
            form_data["assets"] = raw

    return form_data

def generate_snap_pdf(form_data: dict) -> bytes:
    """Generate a polished, single-page SNAP-style summary PDF."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    c.setFillColorRGB(0.11, 0.32, 0.91)
    c.rect(0, height - 70, width, 70, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(40, height - 45, "CivicScribe - SNAP Application Summary")

    # Section helper
    def section(title: str, y: float):
        c.setFillColorRGB(0.95, 0.95, 0.97)
        c.roundRect(30, y - 80, width - 60, 80, 8, stroke=0, fill=1)
        c.setFillColorRGB(0.2, 0.2, 0.2)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(40, y - 20, title)
        return y - 30

    def field(label: str, value: str, x: float, y: float):
        c.setFont("Helvetica", 10)
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.drawString(x, y, f"{label}")
        c.setFont("Helvetica-Bold", 10)
        c.setFillColorRGB(0.1, 0.1, 0.1)
        c.drawString(x + 160, y, value or "—")

    y = height - 90
    # Applicant Info
    y = section("Applicant Information", y)
    field("Full Legal Name:", form_data.get("full_name", ""), 45, y - 5)
    field("Date of Birth:", form_data.get("dob", ""), 45, y - 22)
    field("State / Language:", f"{form_data.get('state','')} / {form_data.get('language','')}", 320, y - 5)
    field("Citizenship Status:", form_data.get("citizenship", ""), 320, y - 22)
    y -= 80

    # Contact & Residence
    y = section("Contact & Residence", y)
    field("Phone:", form_data.get("phone", ""), 45, y - 5)
    field("Email:", form_data.get("email", ""), 45, y - 22)
    field("Residential Address:", form_data.get("address", ""), 320, y - 5)
    field("Household Size:", form_data.get("household_size", ""), 320, y - 22)
    y -= 80

    # Household Members
    y = section("Household Members", y)
    field("Member 1:", form_data.get("member1", ""), 45, y - 5)
    field("Member 2:", form_data.get("member2", ""), 320, y - 5)
    field("SSN (Last 4):", form_data.get("ssn_last4", ""), 45, y - 22)
    y -= 80

    # Income & Expenses
    y = section("Income & Expenses", y)
    field("Employment:", form_data.get("employment", ""), 45, y - 5)
    field("Gross Income:", form_data.get("income", ""), 45, y - 22)
    field("Other Income 1:", form_data.get("other_income1", ""), 320, y - 5)
    field("Other Income 2:", form_data.get("other_income2", ""), 320, y - 22)
    y -= 80

    # Housing & Assets
    y = section("Housing & Assets", y)
    field("Rent/Mortgage:", form_data.get("rent", ""), 45, y - 5)
    field("Utilities Paid:", form_data.get("utilities", ""), 45, y - 22)
    field("Assets (cash/bank):", form_data.get("assets", ""), 320, y - 5)

    # Footer
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawRightString(width - 30, 30, "Generated by CivicScribe for review purposes only")

    c.save()
    buffer.seek(0)
    return buffer.getvalue()

# --- API Endpoints (Modified to use get_conversation_history) ---

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"Status": "Running", "Audience": AUTH0_AUDIENCE}

@app.post("/chat", response_model=ChatResponse)
async def chat(
    chat_data: ChatMessage,
    token_data: dict = Depends(verify_token)
):
    """Main chat endpoint"""
    try:
        auth0_sub = token_data.get("sub")
        user_id = get_or_create_user(auth0_sub)
        
        if chat_data.session_id:
            session_id = chat_data.session_id
        else:
            session_id = create_application_session(user_id)
        
        # Save the user's new message (to memory if in demo mode)
        save_message(session_id, "user", chat_data.message)
        
        # FIX: Retrieve all messages (from memory or Supabase)
        conversation_history = get_conversation_history(session_id) 
        
        ai_reply = get_ai_response(chat_data.message, conversation_history)
        
        save_message(session_id, "ai", ai_reply)
        
        audio_url = generate_audio(ai_reply)
        
        return ChatResponse(
            reply=ai_reply,
            session_id=session_id,
            audio_url=audio_url
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/download")
async def download_form(
    download_data: DownloadRequest,
    token_data: dict = Depends(verify_token)
):
    """Download completed form as PDF"""
    try:
        # FIX: Use the unified getter function
        conversation_history = get_conversation_history(download_data.session_id)
        
        if not conversation_history:
            raise HTTPException(status_code=404, detail="No conversation found for this session")
        
        form_data = extract_form_data(conversation_history)
        
        pdf_bytes = generate_snap_pdf(form_data)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=SNAP_Application_Filled.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in download endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)