import requests
import json
import time

# Test the semantic service with strict question-option matching
def test_strict_question_matching():
    url = "http://localhost:5000/map-response"
    conversation_id = f"test-strict-{int(time.time())}"
    
    # Test cases for specific question-option pairs
    test_cases = [
        # Test case 1: Tiredness or fatigue question with matching option
        {
            "question_message": "I've been feeling very tired lately",
            "expected_question": "Tiredness or fatigue",
            "expected_category": "BDI",
            "option_message": "I get tired from doing almost anything",
            "should_match": True
        },
        
        # Test case 2: Sadness question with matching option
        {
            "question_message": "I've been feeling really sad",
            "expected_question": "Sadness",
            "expected_category": "BDI",
            "option_message": "I am sad all the time and I can't snap out of it",
            "should_match": True
        },
        
        # Test case 3: Tiredness question with sadness option (should not match)
        {
            "question_message": "I've been feeling very tired lately",
            "expected_question": "Tiredness or fatigue",
            "expected_category": "BDI",
            "option_message": "I am so sad and unhappy that I can't stand it",
            "should_match": False
        }
    ]
    
    print("Testing strict question-option matching:")
    print("=" * 70)
    
    for case_idx, case in enumerate(test_cases):
        print(f"\nTest Case {case_idx + 1}:")
        print("-" * 70)
        
        # First map the question
        print(f"Step 1: Mapping question message: '{case['question_message']}'")
        question_payload = {
            "message": case['question_message'],
            "conversationId": f"{conversation_id}-{case_idx}",
            "mappingType": "question"
        }
        
        try:
            question_response = requests.post(url, json=question_payload, timeout=30)
            if question_response.status_code == 200:
                question_result = question_response.json()
                
                if question_result.get('mappingType') == 'question':
                    print(f"✓ Mapped to question: '{question_result['question']}' ({question_result['category']})")
                    print(f"  Confidence: {question_result['confidence']:.4f}")
                    
                    # Now try to map the option
                    print(f"\nStep 2: Mapping option message: '{case['option_message']}'")
                    option_payload = {
                        "message": case['option_message'],
                        "conversationId": f"{conversation_id}-{case_idx}"
                    }
                    
                    option_response = requests.post(url, json=option_payload, timeout=30)
                    if option_response.status_code == 200:
                        option_result = option_response.json()
                        
                        if option_result.get('mappingType') == 'option':
                            print(f"Mapped to option: '{option_result['mappedOption']}'")
                            print(f"For question: '{option_result['question']}' ({option_result['category']})")
                            print(f"Confidence: {option_result['confidence']:.4f}")
                            
                            # Check if the mapping is correct
                            if case['should_match']:
                                if (option_result['question'] == question_result['question'] and
                                    option_result['confidence'] >= 0.6):
                                    print("✓ CORRECT: Option correctly matched to the question")
                                else:
                                    print("✗ ERROR: Option should have matched but didn't")
                                    if option_result['question'] != question_result['question']:
                                        print(f"  Question mismatch: Expected '{question_result['question']}', got '{option_result['question']}'")
                                    if option_result['confidence'] < 0.6:
                                        print(f"  Low confidence: {option_result['confidence']:.4f} < 0.6")
                            else:
                                if (option_result['question'] != question_result['question'] or
                                    option_result['confidence'] < 0.6):
                                    print("✓ CORRECT: Option correctly did not match the question")
                                else:
                                    print("✗ ERROR: Option should not have matched but did")
                        else:
                            print(f"Mapped to: {option_result.get('mappingType', 'unknown')}")
                            if not case['should_match']:
                                print("✓ CORRECT: Option correctly did not match and was mapped as a new question")
                            else:
                                print("✗ ERROR: Should have mapped to an option but didn't")
                    else:
                        print(f"Error: {option_response.status_code}")
                        print(option_response.text)
                else:
                    print(f"Error: Expected question mapping but got {question_result.get('mappingType', 'unknown')}")
            else:
                print(f"Error: {question_response.status_code}")
                print(question_response.text)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        print("=" * 70)
        time.sleep(1)  # Add a small delay between test cases

if __name__ == "__main__":
    print("Testing semantic service with strict question-option matching...")
    print("Make sure the semantic service is running on http://localhost:5000")
    print("=" * 70)
    
    test_strict_question_matching()