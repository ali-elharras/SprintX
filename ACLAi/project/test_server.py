from fastapi.testclient import TestClient
from server import app
from unittest.mock import patch
import os

client = TestClient(app)

# Mocking the AI service for testing purposes to avoid API key requirements for this verification
# In a real integration test, we would use the real service with a valid key.
# But here we want to verify the endpoint plumbing first.

@patch("ai_service.analyze_comment_with_ai")
def test_analyze_comment_endpoint(mock_analyze):
    # Setup mock return value
    mock_analyze.return_value = {
        "category": "Good",
        "reasoning": "Positive sentiment detected."
    }

    response = client.post("/analyze-comment", json={"text": "This is a great post!"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Good"
    assert data["reasoning"] == "Positive sentiment detected."
    print("Test passed!")

if __name__ == "__main__":
    test_analyze_comment_endpoint()
