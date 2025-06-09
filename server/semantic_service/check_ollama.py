import requests
import sys
import time

def check_ollama():
    """Check if Ollama is running and the model is available"""
    print("Checking Ollama service...")
    
    try:
        # Check if Ollama server is running
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code != 200:
            print("❌ Ollama server is not responding correctly")
            print(f"Status code: {response.status_code}")
            print(response.text)
            return False
            
        models = response.json().get("models", [])
        print(f"✅ Ollama server is running. Available models: {[m['name'] for m in models]}")
        
        # Check if our embedding model is available
        model_name = "nomic-embed-text"
        if not any(m['name'] == model_name for m in models):
            print(f"❌ Model '{model_name}' is not available. Please run: ollama pull {model_name}")
            return False
        
        print(f"✅ Model '{model_name}' is available")
        
        # Test embedding functionality
        print("Testing embedding functionality...")
        start_time = time.time()
        
        test_response = requests.post(
            "http://localhost:11434/api/embeddings",
            json={"model": model_name, "prompt": "This is a test message"},
            timeout=10
        )
        
        if test_response.status_code != 200 or "embedding" not in test_response.json():
            print("❌ Embedding test failed")
            print(f"Status code: {test_response.status_code}")
            print(test_response.text)
            return False
            
        embedding = test_response.json()["embedding"]
        elapsed = time.time() - start_time
        
        print(f"✅ Embedding test successful ({len(embedding)} dimensions, {elapsed:.2f}s)")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama server at http://localhost:11434")
        print("Please make sure Ollama is installed and running")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("OLLAMA SERVICE CHECK")
    print("=" * 50)
    
    success = check_ollama()
    
    print("\nSUMMARY:")
    if success:
        print("✅ Ollama is running correctly and ready for semantic service")
        sys.exit(0)
    else:
        print("❌ Ollama check failed. Please fix the issues above")
        print("\nTo install Ollama:")
        print("1. Visit https://ollama.com/download")
        print("2. After installation, run: ollama pull nomic-embed-text")
        sys.exit(1)