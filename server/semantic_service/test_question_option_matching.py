import requests
import json
import time

# Test the semantic service with specific question-option matching
def test_question_option_matching():
    url = "http://localhost:5000/map-response"
    conversation_id = f"test-matching-{int(time.time())}"
    
    # Test cases for question mapping followed by option mapping
    test_cases = [
        # First test case: BDI question followed by matching option
        [
            {
                "message": "I've been feeling really sad lately",
                "expected_type": "question",
                "expected_category": "BDI"
            },
            {
                "message": "I feel sad all the time and I can't snap out of it",
                "expected_type": "option",
                "expected_match": True
            }
        ],
        
        # Second test case: BDI question followed by non-matching message, then new question
        [
            {
                "message": "I don't enjoy things like I used to",
                "expected_type": "question",
                "expected_category": "BDI"
            },
            {
                "message": "Can you tell me more about depression?",
                "expected_type": "option",
                "expected_match": False
            },
            {
                "message": "I've been having trouble sleeping",
                "expected_type": "question",
                "expected_category": "BDI"
            }
        ]
    ]
    
    print("Testing question-option matching with specific scenarios:")
    print("=" * 70)
    
    for case_idx, case in enumerate(test_cases):
        print(f"\nTest Case {case_idx + 1}:")
        print("-" * 70)
        
        for step_idx, step in enumerate(case):
            print(f"\nStep {step_idx + 1}: '{step['message']}'")
            
            payload = {
                "message": step['message'],
                "conversationId": f"{conversation_id}-{case_idx}"
            }
            
            try:
                response = requests.post(url, json=payload, timeout=30)
                if response.status_code == 200:
                    result = response.json()
                    
                    if step['expected_type'] == 'question':
                        if result.get('mappingType') == 'question':
                            print(f"✓ Mapped to QUESTION as expected: '{result['question']}' ({result['category']})")
                            print(f"  Confidence: {result['confidence']:.4f}")
                            if step.get('expected_category') and result['category'] != step['expected_category']:
                                print(f"! Warning: Expected category {step['expected_category']}, got {result['category']}")
                        else:
                            print(f"✗ Expected QUESTION mapping but got {result.get('mappingType', 'unknown')}")
                    
                    elif step['expected_type'] == 'option':
                        if result.get('mappingType') == 'option':
                            print(f"✓ Mapped to OPTION: '{result['mappedOption']}'")
                            print(f"  For question: '{result['question']}'")
                            print(f"  Score: {result['score']}")
                            print(f"  Confidence: {result['confidence']:.4f}")
                            
                            if step['expected_match']:
                                print("  Expected to match: YES")
                                if result['confidence'] < 0.6:
                                    print(f"! Warning: Confidence ({result['confidence']:.4f}) is below threshold (0.6)")
                            else:
                                print("  Expected to match: NO")
                                if result['confidence'] >= 0.6:
                                    print(f"! Warning: Confidence ({result['confidence']:.4f}) is above threshold (0.6)")
                        else:
                            if result.get('mappingType') == 'question' and not step['expected_match']:
                                print(f"✓ Correctly mapped to QUESTION instead of low-confidence option")
                                print(f"  Question: '{result['question']}' ({result['category']})")
                                print(f"  Confidence: {result['confidence']:.4f}")
                            else:
                                print(f"✗ Expected OPTION mapping but got {result.get('mappingType', 'unknown')}")
                else:
                    print(f"Error: {response.status_code}")
                    print(response.text)
            except requests.exceptions.RequestException as e:
                print(f"Request failed: {e}")
            
            time.sleep(1)  # Add a small delay between requests
        
        print("\n" + "=" * 70)

if __name__ == "__main__":
    print("Testing semantic service with question-option matching...")
    print("Make sure the semantic service is running on http://localhost:5000")
    print("=" * 70)
    
    test_question_option_matching()