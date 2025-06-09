import requests
import json
import time

# Test the semantic service with specific questions and options
def test_specific_options():
    url = "http://localhost:5000/map-response"
    
    # Test cases for BDI and HDRS
    test_cases = [
        {
            "category": "BDI",
            "question": "Sadness",
            "message": "I feel very sad most of the time"
        },
        {
            "category": "BDI",
            "question": "Loss of pleasure",
            "message": "I don't enjoy anything anymore"
        },
        {
            "category": "HDRS",
            "question": "Depressed mood",
            "message": "I've been feeling down lately"
        },
        {
            "category": "HDRS",
            "question": "Suicidal thoughts",
            "message": "Sometimes I think about ending it all"
        }
    ]
    
    print("Testing specific question options mapping:")
    print("=" * 70)
    
    for case in test_cases:
        print(f"\nCategory: {case['category']}")
        print(f"Question: {case['question']}")
        print(f"User message: '{case['message']}'")
        
        payload = {
            "message": case['message'],
            "conversationId": f"test-{int(time.time())}",
            "mappingType": "option",
            "category": case['category'],
            "question": case['question']
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            if response.status_code == 200:
                result = response.json()
                print(f"Mapped to option: '{result['mappedOption']}'")
                print(f"Score: {result['score']}")
                print(f"Confidence: {result['confidence']:.4f}")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        print("-" * 70)
        time.sleep(1)  # Add a small delay between requests

if __name__ == "__main__":
    print("Testing semantic service with specific question options...")
    print("Make sure the semantic service is running on http://localhost:5000")
    print("=" * 70)
    
    test_specific_options()