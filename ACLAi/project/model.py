from pydantic import BaseModel, Field

class CommentRequest(BaseModel):
    text: str = Field(..., description="The text of the comment to analyze")

class CommentAnalysis(BaseModel):
    category: str  # 'Good', 'Spam', 'Inappropriate'
    reasoning: str

class TermsRequest(BaseModel):
    discount_rate: float
    promo_code: str
    business_name: str = "Our Business"

class TermsResponse(BaseModel):
    generated_text: str
