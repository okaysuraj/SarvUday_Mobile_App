import requests
import json
import time

# Test the semantic service with question abandonment behavior
def test_question_abandonment():
    url = "http://localhost:5000/map-response"
    conversation_id = f"test-abandon-{int(time.time())}"
    
    # Test case: Map a question, then send unrelated messages, then a new question
    messages = [
        # First message should map to a question
        {
            "message": "I've been feeling down lately",
            "expected_type": "question",
            "description": "Initial question mapping"
        },
        
        # Second message is unrelated and shouldn't match as an option
        {
            "message": "Can you tell me more about depression?",
            "expected_type": "option_fail",
            "description": "Unrelated message that shouldn't match as an option"
        },
        
        # Third message should be mapped as a new question
        {
            "message": "I've been having trouble sleeping",
            "expected_type": "question",
            "description": "New question after abandoning previous one"
        },
        
        # Fourth message should match as an option for the sleep question
        {
            "message": "I wake up several hours earlier than I used to",
            "expected_type": "option",
            "description": "Option matching for the new question"
        }
    ]
    
    print("Testing question abandonment behavior:")
    print("=" * 70)
    
    for i, message_data in enumerate(messages):
        print(f"\nStep {i+1}: {message_data['description']}")
        print(f"Message: '{message_data['message']}'")
        
        payload = {
            "message": message_data['message'],
            "conversationId": conversation_id
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            if response.status_code == 200:
                result = response.json()
                
                if message_data['expected_type'] == 'question' and result.get('mappingType') == 'question':
                    print(f"✓ SUCCESS: Mapped to question as expected: '{result['question']}' ({result['category']})")
                    print(f"  Confidence: {result['confidence']:.4f}")
                
                elif message_data['expected_type'] == 'option' and result.get('mappingType') == 'option':
                    print(f"✓ SUCCESS: Mapped to option as expected: '{result['mappedOption']}'")
                    print(f"  For question: '{result['question']}'")
                    print(f"  Confidence: {result['confidence']:.4f}")
                
                elif message_data['expected_type'] == 'option_fail':
                    if result.get('mappingType') == 'question':
                        print(f"✓ SUCCESS: Correctly abandoned previous question and mapped to new question: '{result['question']}'")
                        print(f"  Confidence: {result['confidence']:.4f}")
                    elif result.get('mappingType') == 'option' and result.get('confidence', 0) < 0.6:
                        print(f"✓ SUCCESS: Low confidence option match as expected: {result['confidence']:.4f}")
                        print(f"  This should cause the question to be abandoned")
                    else:
                        print(f"✗ FAILURE: Expected option to fail matching, but got: {result}")
                
                else:
                    print(f"✗ FAILURE: Expected {message_data['expected_type']} but got {result.get('mappingType')}")
                    print(f"  Result: {result}")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        print("-" * 70)
        time.sleep(1)  # Add a small delay between requests

if __name__ == "__main__":
    print("Testing semantic service with question abandonment behavior...")
    print("Make sure the semantic service is running on http://localhost:5000")
    print("=" * 70)
    
    test_question_abandonment()