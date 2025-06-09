import requests
import time
import random
import statistics
import json
import matplotlib.pyplot as plt
import numpy as np
from concurrent.futures import ThreadPoolExecutor

# Configuration
BASE_URL = "http://localhost:5000/map-response"
NUM_REQUESTS = 50
NUM_CONCURRENT = 5
CONVERSATION_ID = f"perf-test-{int(time.time())}"

# Test messages
test_messages = [
    "I've been feeling really sad lately",
    "I don't enjoy things like I used to",
    "I'm having trouble sleeping at night",
    "I feel tired all the time",
    "I don't have much of an appetite these days",
    "I feel like I've let everyone down",
    "I can't concentrate on anything",
    "I've been moving really slowly",
    "Sometimes I think about ending it all",
    "I cry more than I used to",
    "I get irritated easily",
    "I've lost interest in other people",
    "I can't make decisions anymore",
    "I feel worthless",
    "I don't have any energy",
    "I wake up earlier than I used to",
    "I get tired from doing almost anything",
    "My appetite is much worse now",
    "I can't concentrate as well as before",
    "I'm too tired to do anything"
]

# Function to send a request and measure response time
def send_request(message):
    start_time = time.time()
    
    try:
        payload = {
            "message": message,
            "conversationId": CONVERSATION_ID
        }
        
        response = requests.post(BASE_URL, json=payload, timeout=60)
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "elapsed_time": elapsed_time,
                "mapping_type": result.get("mappingType"),
                "confidence": result.get("confidence"),
                "message": message
            }
        else:
            return {
                "success": False,
                "elapsed_time": elapsed_time,
                "error": f"HTTP {response.status_code}",
                "message": message
            }
    except Exception as e:
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        return {
            "success": False,
            "elapsed_time": elapsed_time,
            "error": str(e),
            "message": message
        }

# Run performance test
def run_performance_test():
    print(f"Running performance test with {NUM_REQUESTS} requests ({NUM_CONCURRENT} concurrent)...")
    
    # Generate random messages
    messages = []
    for _ in range(NUM_REQUESTS):
        messages.append(random.choice(test_messages))
    
    # Send requests concurrently
    results = []
    with ThreadPoolExecutor(max_workers=NUM_CONCURRENT) as executor:
        futures = [executor.submit(send_request, message) for message in messages]
        for future in futures:
            results.append(future.result())
    
    # Analyze results
    successful_times = [r["elapsed_time"] for r in results if r["success"]]
    failed_times = [r["elapsed_time"] for r in results if not r["success"]]
    
    question_times = [r["elapsed_time"] for r in results if r.get("mapping_type") == "question"]
    option_times = [r["elapsed_time"] for r in results if r.get("mapping_type") == "option"]
    
    # Print summary
    print("\nPerformance Test Results:")
    print(f"Total requests: {len(results)}")
    print(f"Successful: {len(successful_times)} ({len(successful_times)/len(results)*100:.1f}%)")
    print(f"Failed: {len(failed_times)} ({len(failed_times)/len(results)*100:.1f}%)")
    
    if successful_times:
        print("\nResponse Times (successful requests):")
        print(f"  Min: {min(successful_times):.3f}s")
        print(f"  Max: {max(successful_times):.3f}s")
        print(f"  Avg: {statistics.mean(successful_times):.3f}s")
        print(f"  Median: {statistics.median(successful_times):.3f}s")
        
        if len(successful_times) > 1:
            print(f"  Std Dev: {statistics.stdev(successful_times):.3f}s")
    
    if question_times:
        print("\nQuestion Mapping Times:")
        print(f"  Count: {len(question_times)}")
        print(f"  Avg: {statistics.mean(question_times):.3f}s")
    
    if option_times:
        print("\nOption Mapping Times:")
        print(f"  Count: {len(option_times)}")
        print(f"  Avg: {statistics.mean(option_times):.3f}s")
    
    # Plot results
    try:
        plt.figure(figsize=(12, 6))
        
        # Response time histogram
        plt.subplot(1, 2, 1)
        plt.hist(successful_times, bins=20, alpha=0.7, color='blue')
        plt.xlabel('Response Time (s)')
        plt.ylabel('Count')
        plt.title('Response Time Distribution')
        
        # Response time by request number
        plt.subplot(1, 2, 2)
        x = range(len(results))
        y = [r["elapsed_time"] for r in results]
        colors = ['green' if r["success"] else 'red' for r in results]
        plt.scatter(x, y, c=colors, alpha=0.7)
        plt.xlabel('Request Number')
        plt.ylabel('Response Time (s)')
        plt.title('Response Time by Request')
        
        plt.tight_layout()
        plt.savefig('performance_results.png')
        print("\nPlot saved to performance_results.png")
    except Exception as e:
        print(f"\nCould not generate plot: {e}")
    
    # Save detailed results to file
    try:
        with open('performance_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        print("Detailed results saved to performance_results.json")
    except Exception as e:
        print(f"Could not save detailed results: {e}")

if __name__ == "__main__":
    run_performance_test()