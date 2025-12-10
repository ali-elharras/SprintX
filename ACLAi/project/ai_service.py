import os
from pathlib import Path
from dotenv import load_dotenv

# Construct path to .env file in parent directory
env_path = Path(__file__).parent.parent / '.env'
print(f"DEBUG: env_path = {env_path}")
print(f"DEBUG: env_path exists? {env_path.exists()}")

loaded = load_dotenv(dotenv_path=env_path)
print(f"DEBUG: load_dotenv returned {loaded}")
print(f"DEBUG: GROQ_API_KEY in os.environ? {'GROQ_API_KEY' in os.environ}")
if 'GROQ_API_KEY' in os.environ:
    print(f"DEBUG: GROQ_API_KEY length: {len(os.environ['GROQ_API_KEY'])}")



from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import ValidationError
from model import CommentAnalysis

# Ensure GROQ_API_KEY is in environment variables

def get_groq_model():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    
    # Using a versatile model like llama3-8b-8192 which is often available on Groq
    return ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile", groq_api_key=api_key)

def analyze_comment_with_ai(comment_text: str) -> CommentAnalysis:
    model = get_groq_model()
    
    # We want structured output, so we can use a parser or structured output method if available.
    # Here we'll use a prompt and JsonOutputParser for robustness.
    
    parser = JsonOutputParser(pydantic_object=CommentAnalysis)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI content moderator. Your job is to classify comments into one of three categories: 'Good', 'Spam', or 'Inappropriate'. Provide a brief reasoning."),
        ("user", "Analyze the following comment:\n\n{text}\n\n{format_instructions}")
    ])
    
    chain = prompt | model | parser
    
    try:
        result = chain.invoke({
            "text": comment_text,
            "format_instructions": parser.get_format_instructions()
        })
        # Validate result against the Pydantic model
        return CommentAnalysis(**result)
    except Exception as e:
        # Fallback in case of parsing error or other issues
        print(f"Error classifying comment: {e}")
        return CommentAnalysis(category="Error", reasoning="Failed to analyze comment due to an internal error.")

def generate_loyalty_terms(discount_rate: float, promo_code: str, business_name: str) -> str:
    model = get_groq_model()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a professional legal assistant for a business. Your job is to write clear, standard Terms and Conditions for a loyalty program."),
        ("user", """Generate a professional Terms and Conditions text for a loyalty program with the following details:
        - Business Name: {business_name}
        - Discount Rate: {discount_rate}%
        - Promo Code: {promo_code}
        
        The terms should include:
        1. Validity of the promo code.
        2. Non-transferability.
        3. Cannot be combined with other offers.
        4. Right to modify or cancel.
        
        Output ONLY the terms text, formatted as a numbered list. Do not include introductory text.""")
    ])
    
    chain = prompt | model
    
    try:
        response = chain.invoke({
            "business_name": business_name,
            "discount_rate": discount_rate,
            "promo_code": promo_code
        })
        return response.content
    except Exception as e:
        print(f"Error generating terms: {e}")
        return "Failed to generate terms. Please try again or write them manually."
