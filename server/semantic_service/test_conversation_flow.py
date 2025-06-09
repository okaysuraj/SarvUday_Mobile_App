import requests
import json
import time

# Test the semantic service with a realistic conversation flow
def test_conversation_flow():
    url = "http://localhost:5000/map-response"
    conversation_id = f"test-flow-{int(time.time())}"
    
    # Simulate a conversation with questions, answers, and unrelated messages
    messages = [
        # First message should map to a question
        "I've been feeling really sad lately",
        
        # This should map to an option for the previous question
        "I feel sad all the time and I can't snap out of it",
        
        # This is an unrelated message that shouldn't map to an option
        "Can you tell me more about depression?",
        
        # This should map to a new question
        "I don't enjoy things like I used to",
        
        # This should map to an option for the new question
        "I don't get any satisfaction from anything anymore",
        
        # Another unrelated message
        "What treatments are available for depression?",
        
        # Another question
        "I've been having trouble sleeping"
    ]
    
    print("Testing conversation flow with mixed messages:")
    print("=" * 70)
    
    for i, message in enumerate(messages):
        print(f"\nMessage {i+1}: '{message}'")
        
        payload = {
            "message": message,
            "conversationId": conversation_id
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            if response.status_code == 200:
                result = response.json()
                
                if result.get('mappingType') == 'question':
                    print(f"✓ Mapped to QUESTION: '{result['question']}' ({result['category']})")
                    print(f"  Confidence: {result['confidence']:.4f}")
                elif result.get('mappingType') == 'option':
                    print(f"✓ Mapped to OPTION: '{result['mappedOption']}'")
                    print(f"  For question: '{result['question']}'")
                    print(f"  Score: {result['score']}")
                    print(f"  Confidence: {result['confidence']:.4f}")
                else:
                    print(f"? Unknown mapping type: {result}")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        print("-" * 70)
        time.sleep(1)  # Add a small delay between requests

if __name__ == "__main__":
    print("Testing semantic service with realistic conversation flow...")
    print("Make sure the semantic service is running on http://localhost:5000")
    print("=" * 70)
    
    test_conversation_flow()