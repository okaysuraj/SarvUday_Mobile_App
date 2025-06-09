import requests
import json
import time

# Test the semantic service with Ollama embeddings
def test_question_mapping():
    url = "http://localhost:5000/map-response"
    
    # Test mapping to questions
    test_messages = [
        "I don't enjoy things like I used to",
        "I feel sad most of the time",
        "I can't sleep well lately",
        "I feel like I'm a failure"
    ]
    
    print("Testing question mapping with Ollama embeddings:")
    for message in test_messages:
        payload = {
            "message": message,
            "conversationId": "test-conversation",
            "mappingType": "question"
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                result = response.json()
                print(f"Message: '{message}'")
                print(f"Mapped to: '{result['question']}' ({result['category']})")
                print(f"Confidence: {result['confidence']:.4f}")
                print("-" * 50)
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        # Add a small delay to avoid overwhelming Ollama
        time.sleep(1)

def test_option_mapping():
    url = "http://localhost:5000/map-response"
    
    # Test mapping to options
    test_data = [
        {"message": "Not at all, I feel fine", "category": "PHQ-9", "question": "Feeling down, depressed, or hopeless?"},
        {"message": "I feel this way almost every day", "category": "PHQ-9", "question": "Feeling down, depressed, or hopeless?"},
        {"message": "I feel very sad and can't snap out of it", "category": "BDI", "question": "Sadness"}
    ]
    
    print("\nTesting option mapping with Ollama embeddings:")
    for data in test_data:
        payload = {
            "message": data["message"],
            "conversationId": "test-conversation",
            "mappingType": "option",
            "category": data["category"],
            "question": data["question"]
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                result = response.json()
                print(f"Message: '{data['message']}'")
                print(f"Question: '{data['question']}' ({data['category']})")
                print(f"Mapped to option: '{result['mappedOption']}'")
                print(f"Score: {result['score']}")
                print(f"Confidence: {result['confidence']:.4f}")
                print("-" * 50)
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        # Add a small delay to avoid overwhelming Ollama
        time.sleep(1)

def test_auto_mapping():
    url = "http://localhost:5000/map-response"
    
    # Test the auto-mapping feature (question followed by option)
    conversation_id = f"test-auto-{int(time.time())}"
    
    # First message should map to a question
    first_message = "I've been feeling really down lately"
    print("\nTesting auto-mapping with Ollama embeddings:")
    print(f"First message: '{first_message}'")
    
    try:
        response = requests.post(url, json={
            "message": first_message,
            "conversationId": conversation_id
        }, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Mapped to question: '{result['question']}' ({result['category']})")
            print(f"Confidence: {result['confidence']:.4f}")
            print("-" * 50)
            
            # Second message should map to an option for the previous question
            time.sleep(1)
            second_message = "It's been happening almost every day for weeks"
            print(f"Second message: '{second_message}'")
            
            response2 = requests.post(url, json={
                "message": second_message,
                "conversationId": conversation_id
            }, timeout=10)
            
            if response2.status_code == 200:
                result2 = response2.json()
                print(f"Mapped to option: '{result2['mappedOption']}'")
                print(f"Score: {result2['score']}")
                print(f"Confidence: {result2['confidence']:.4f}")
                print("-" * 50)
            else:
                print(f"Error on second message: {response2.status_code}")
                print(response2.text)
        else:
            print(f"Error on first message: {response.status_code}")
            print(response.text)
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    print("Testing semantic service with Ollama embeddings...")
    print("Make sure Ollama is running and the semantic service is started.")
    print("=" * 70)
    
    test_question_mapping()
    test_option_mapping()
    test_auto_mapping()