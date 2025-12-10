from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model import CommentRequest, CommentAnalysis, TermsRequest, TermsResponse
from ai_service import analyze_comment_with_ai, generate_loyalty_terms

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

@app.post("/analyze-comment", response_model=CommentAnalysis)
async def analyze_comment(request: CommentRequest):
    """
    Analyze a comment to determine if it is Good, Spam, or Inappropriate.
    """
    analysis = analyze_comment_with_ai(request.text)
    return analysis

@app.post("/generate-terms", response_model=TermsResponse)
async def generate_terms(request: TermsRequest):
    terms_text = generate_loyalty_terms(request.discount_rate, request.promo_code, request.business_name)
    return TermsResponse(generated_text=terms_text)
