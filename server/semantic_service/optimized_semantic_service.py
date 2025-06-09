from flask import Flask, request, jsonify
import numpy as np
import requests
import json
import os
import time
from functools import lru_cache
import threading
import queue
import re

app = Flask(__name__)

# Ollama API endpoint
OLLAMA_API_URL = "http://localhost:11434/api/embeddings"
OLLAMA_MODEL = "nomic-embed-text"  # You can also use other models like "llama2" or "mistral"

# Configuration
EMBEDDING_CACHE_SIZE = 1000  # Number of embeddings to cache
EMBEDDING_BATCH_SIZE = 5     # Number of texts to batch together
EMBEDDING_TIMEOUT = 30       # Timeout in seconds for embedding requests
EMBEDDING_RETRY_COUNT = 3    # Number of retries for failed requests
EMBEDDING_RETRY_DELAY = 1    # Delay between retries in seconds
PRELOAD_QUESTIONS = True     # Whether to preload question embeddings on startup

# In-memory cache for embeddings
embedding_cache = {}
embedding_cache_lock = threading.Lock()

# Worker queue for background embedding generation
embedding_queue = queue.Queue()
embedding_results = {}
embedding_results_lock = threading.Lock()

# Predefined questions and options from PHQ-9, BDI, HDRS
questions_data = {
    "PHQ-9": [
        "Little interest or pleasure in doing things?",
        "Feeling down, depressed, or hopeless?",
        "Trouble falling or staying asleep, or sleeping too much?",
        "Feeling tired or having little energy?",
        "Poor appetite or overeating?",
        "Feeling bad about yourself - or that you are a failure or have let yourself or your family down?",
        "Trouble concentrating on things, such as reading the newspaper or watching television?",
        "Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?",
        "Thoughts that you would be better off dead, or of hurting yourself in some way?"
    ],
    "BDI": [
        "Sadness",
        "Pessimism",
        "Past failure",
        "Loss of pleasure",
        "Guilty feelings",
        "Punishment feelings",
        "Self-dislike",
        "Self-criticalness",
        "Suicidal thoughts or wishes",
        "Crying",
        "Agitation",
        "Loss of interest",
        "Indecisiveness",
        "Worthlessness",
        "Loss of energy",
        "Changes in sleeping pattern",
        "Irritability",
        "Changes in appetite",
        "Concentration difficulty",
        "Tiredness or fatigue",
        "Loss of interest in sex"
    ],
    "HDRS": [
        "Depressed mood",
        "Feelings of guilt",
        "Suicidal thoughts",
        "Insomnia - early",
        "Insomnia - middle",
        "Insomnia - late",
        "Work and activities",
        "Psychomotor retardation",
        "Agitation",
        "Anxiety - psychological",
        "Anxiety - somatic",
        "Somatic symptoms - gastrointestinal",
        "Somatic symptoms - general",
        "Genital symptoms",
        "Hypochondriasis",
        "Weight loss",
        "Insight"
    ]
}

# Define options for each assessment type
options_data = {
    "PHQ-9": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    
    "BDI": {
        # BDI options (same as in the original file)
        "Sadness": [
            "I do not feel sad",
            "I feel sad",
            "I am sad all the time and I can't snap out of it",
            "I am so sad and unhappy that I can't stand it"
        ],
        # Add other BDI options here
    },
    
    "HDRS": {
        # HDRS options (same as in the original file)
        "Depressed mood": [
            "Absent",
            "These feeling states indicated only on questioning",
            "These feeling states spontaneously reported verbally",
            "Communicates feeling states non-verbally",
            "Patient reports virtually only these feeling states"
        ],
        # Add other HDRS options here
    }
}

# Default options if category-specific options aren't available
default_options = ["Not at all", "Several days", "More than half the days", "Nearly every day"]

# Track the last mapped question for each conversation
conversation_state = {}

# LRU cache for frequently used embeddings
@lru_cache(maxsize=EMBEDDING_CACHE_SIZE)
def get_cached_embedding(text):
    """Get embedding from LRU cache"""
    # This function is just a wrapper for the LRU cache decorator
    # The actual embedding generation happens in get_ollama_embedding
    return None  # This return is never used, the decorator handles caching

# Function to get embeddings from Ollama with caching
def get_ollama_embedding(text):
    # Check if we already have this embedding cached
    cache_key = text.strip().lower()
    
    # Try to get from LRU cache first (fastest)
    cached_result = get_cached_embedding(cache_key)
    if cached_result is not None:
        return cached_result
    
    # Then check our manual cache (for items that might be evicted from LRU)
    with embedding_cache_lock:
        if cache_key in embedding_cache:
            return embedding_cache[cache_key]
    
    # If not cached, generate the embedding
    try:
        for attempt in range(EMBEDDING_RETRY_COUNT):
            try:
                response = requests.post(
                    OLLAMA_API_URL,
                    json={"model": OLLAMA_MODEL, "prompt": text},
                    timeout=EMBEDDING_TIMEOUT
                )
                
                if response.status_code == 200:
                    embedding = np.array(response.json()["embedding"])
                    
                    # Cache the result
                    with embedding_cache_lock:
                        embedding_cache[cache_key] = embedding
                    
                    # Also store in LRU cache
                    get_cached_embedding.cache_clear()  # Clear to avoid memory issues
                    get_cached_embedding(cache_key)     # Add to LRU cache
                    
                    return embedding
                else:
                    print(f"Error from Ollama API (attempt {attempt+1}/{EMBEDDING_RETRY_COUNT}): {response.status_code}")
                    print(response.text)
                    if attempt < EMBEDDING_RETRY_COUNT - 1:
                        time.sleep(EMBEDDING_RETRY_DELAY)
            except requests.exceptions.RequestException as e:
                print(f"Request exception (attempt {attempt+1}/{EMBEDDING_RETRY_COUNT}): {e}")
                if attempt < EMBEDDING_RETRY_COUNT - 1:
                    time.sleep(EMBEDDING_RETRY_DELAY)
        
        # If all attempts failed, fall back to simple word matching
        print(f"All {EMBEDDING_RETRY_COUNT} attempts failed, falling back to simple embedding")
        return simple_text_embedding(text)
    except Exception as e:
        print(f"Exception in get_ollama_embedding: {e}")
        # Return a simple embedding as last resort
        return simple_text_embedding(text)

# Function to process embeddings in batches
def process_embeddings_batch(texts_batch):
    """Process a batch of texts to get embeddings"""
    results = {}
    
    # First check cache for all texts
    uncached_texts = []
    uncached_indices = []
    
    for i, text in enumerate(texts_batch):
        cache_key = text.strip().lower()
        
        # Check LRU cache
        cached_result = get_cached_embedding(cache_key)
        if cached_result is not None:
            results[i] = cached_result
            continue
            
        # Check manual cache
        with embedding_cache_lock:
            if cache_key in embedding_cache:
                results[i] = embedding_cache[cache_key]
                continue
        
        # If not in cache, add to list for batch processing
        uncached_texts.append(text)
        uncached_indices.append(i)
    
    # If all texts were cached, return results
    if not uncached_texts:
        return results
    
    # Process uncached texts
    try:
        # Currently Ollama doesn't support true batching, so we process sequentially
        # This can be updated if Ollama adds batch support in the future
        for batch_idx, text in zip(uncached_indices, uncached_texts):
            embedding = get_ollama_embedding(text)
            results[batch_idx] = embedding
    except Exception as e:
        print(f"Error in batch processing: {e}")
        # Fall back to simple embeddings for any remaining texts
        for batch_idx, text in zip(uncached_indices, uncached_texts):
            if batch_idx not in results:
                results[batch_idx] = simple_text_embedding(text)
    
    return results

# Simple fallback function for when Ollama is not available
def simple_text_embedding(text):
    """Create a simple embedding based on word presence"""
    # Create a simple bag-of-words representation
    text = text.lower()
    # Use a fixed vocabulary of common words in mental health assessments
    vocab = ["sad", "happy", "depressed", "anxious", "sleep", "tired", "energy", 
             "interest", "pleasure", "guilt", "concentration", "suicide", "death",
             "appetite", "eating", "failure", "worthless", "hopeless", "future",
             "past", "worry", "fear", "panic", "stress", "mood", "feeling", "emotion"]
    
    # Create a simple embedding based on word presence
    embedding = np.zeros(len(vocab) + 10)  # Add some random dimensions
    
    for i, word in enumerate(vocab):
        if word in text:
            embedding[i] = 1.0
    
    # Add some random noise to differentiate similar texts
    embedding[len(vocab):] = np.random.rand(10) * 0.1
    
    # Normalize
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    
    return embedding

# Background worker for pre-generating embeddings
def embedding_worker():
    """Background worker to pre-generate embeddings"""
    print("Starting embedding worker thread")
    while True:
        try:
            # Get batch of texts to process
            batch = []
            batch_keys = []
            
            # Try to get up to EMBEDDING_BATCH_SIZE items
            for _ in range(EMBEDDING_BATCH_SIZE):
                try:
                    item = embedding_queue.get(block=True, timeout=1)
                    batch.append(item[1])  # Text
                    batch_keys.append(item[0])  # Key
                except queue.Empty:
                    break
            
            # If batch is empty, continue waiting
            if not batch:
                time.sleep(0.1)
                continue
            
            # Process batch
            print(f"Processing batch of {len(batch)} embeddings")
            batch_results = process_embeddings_batch(batch)
            
            # Store results
            with embedding_results_lock:
                for i, key in enumerate(batch_keys):
                    if i in batch_results:
                        embedding_results[key] = batch_results[i]
            
            # Mark tasks as done
            for _ in range(len(batch)):
                embedding_queue.task_done()
                
        except Exception as e:
            print(f"Error in embedding worker: {e}")
            time.sleep(1)  # Avoid tight loop in case of repeated errors

# Preload question embeddings
def preload_question_embeddings():
    """Preload embeddings for all questions and common options"""
    print("Preloading question and option embeddings...")
    
    # Collect all texts to preload
    texts_to_preload = []
    
    # Add all questions
    for category, questions in questions_data.items():
        for question in questions:
            texts_to_preload.append(question)
    
    # Add common options
    for options in options_data.values():
        if isinstance(options, list):
            texts_to_preload.extend(options)
    
    # Process in batches
    batch_size = 10
    for i in range(0, len(texts_to_preload), batch_size):
        batch = texts_to_preload[i:i+batch_size]
        print(f"Preloading batch {i//batch_size + 1}/{(len(texts_to_preload) + batch_size - 1)//batch_size}")
        
        # Process batch
        batch_dict = {idx: text for idx, text in enumerate(batch)}
        process_embeddings_batch(batch)
        
        # Small delay to avoid overloading Ollama
        time.sleep(0.5)
    
    print(f"Preloaded {len(texts_to_preload)} embeddings")

# Calculate cosine similarity between two embeddings
def cosine_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings"""
    dot_product = np.dot(embedding1, embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0
    
    return dot_product / (norm1 * norm2)

# Map user message to a question
def map_to_question(user_message, conversation_id):
    """Map user message to a question from one of the assessment categories using Ollama"""
    best_match = None
    best_score = -1
    best_category = None
    best_question_idx = -1

    # Get embedding for user message
    query_embedding = get_ollama_embedding(user_message)
    if query_embedding is None:
        return jsonify({
            "success": False,
            "message": "Failed to get embedding from Ollama API"
        }), 500

    # Process questions in batches for efficiency
    for category, questions in questions_data.items():
        # Get embeddings for all questions in this category
        question_embeddings = {}
        
        # Process in batches
        batch_size = 10
        for i in range(0, len(questions), batch_size):
            batch = questions[i:i+batch_size]
            batch_results = process_embeddings_batch(batch)
            
            # Add to question_embeddings
            for j, embedding in batch_results.items():
                if i + j < len(questions):
                    question_embeddings[i + j] = embedding
        
        # Compare with each question
        for idx, question in enumerate(questions):
            if idx not in question_embeddings:
                continue
                
            # Calculate similarity
            similarity = cosine_similarity(query_embedding, question_embeddings[idx])
            
            if similarity > best_score:
                best_match = question
                best_score = similarity
                best_category = category
                best_question_idx = idx

    # Store the state for this conversation
    conversation_state[conversation_id] = {
        'category': best_category,
        'question': best_match
    }
    
    return jsonify({
        "mappingType": "question",
        "question": best_match,
        "category": best_category,
        "confidence": float(best_score),  # Convert numpy float to Python float
        "success": True
    })

# Map user message to an option
def map_to_option(user_message, category, question, conversation_id):
    """Map user message to an option for the given category using Ollama"""
    # Get the appropriate options for this category and question
    if category == "PHQ-9":
        # PHQ-9 has the same options for all questions
        question_options = options_data.get(category, default_options)
    elif category in ["BDI", "HDRS"]:
        # BDI and HDRS have different options for each question
        category_options = options_data.get(category, {})
        # Try to get options for this specific question
        question_options = category_options.get(question, default_options)
        # If the question isn't found exactly, try to find a close match
        if question_options == default_options:
            best_match = None
            best_score = 0
            for q in category_options:
                # Calculate similarity between questions
                if q in question or question in q:
                    similarity = len(set(q.lower().split()) & set(question.lower().split())) / max(len(q.split()), len(question.split()))
                    if similarity > best_score:
                        best_score = similarity
                        best_match = q
            
            if best_match:
                question_options = category_options[best_match]
                # Update the question to the matched one for consistency
                question = best_match
    else:
        # Fallback to default options
        question_options = default_options
    
    # Get embedding for user message
    query_embedding = get_ollama_embedding(user_message)
    if query_embedding is None:
        return jsonify({
            "success": False,
            "message": "Failed to get embedding from Ollama API"
        }), 500
    
    # Process options in batch for efficiency
    option_embeddings = process_embeddings_batch(question_options)
    
    best_score = -1
    max_idx = 0
    
    # Compare with each option
    for idx, option in enumerate(question_options):
        if idx not in option_embeddings:
            continue
            
        similarity = cosine_similarity(query_embedding, option_embeddings[idx])
        
        if similarity > best_score:
            best_score = similarity
            max_idx = idx
    
    matched_option = question_options[max_idx]
    score = max_idx  # The index represents the severity score
    
    return jsonify({
        "mappingType": "option",
        "question": question,  # Return the exact question that was matched
        "category": category,
        "mappedOption": matched_option,
        "score": score,
        "confidence": float(best_score),  # Convert numpy float to Python float
        "success": True
    })

@app.route('/map-response', methods=['POST'])
def map_response():
    try:
        data = request.json
        user_message = data['message']
        conversation_id = data.get('conversationId', 'default')
        mapping_type = data.get('mappingType', 'auto')
        
        print(f"DEBUG: Received request - message: '{user_message}', type: '{mapping_type}', conversation: '{conversation_id}'")
        
        # If we have a specific mapping type request
        if mapping_type == 'question':
            print(f"DEBUG: Explicitly mapping to question")
            return map_to_question(user_message, conversation_id)
        elif mapping_type == 'option':
            # We need the category to map to options
            category = data.get('category')
            question = data.get('question')
            if not category or not question:
                print(f"DEBUG: Missing category or question for option mapping")
                return jsonify({
                    "success": False,
                    "message": "Category and question are required for option mapping"
                }), 400
            print(f"DEBUG: Explicitly mapping to option for {category}/{question}")
            return map_to_option(user_message, category, question, conversation_id)
        else:
            # Auto-detect if we should map to a question or an option
            if conversation_id in conversation_state:
                # If we have a previous question for this conversation, try to map to option
                prev_state = conversation_state[conversation_id]
                print(f"DEBUG: Found previous state - question: '{prev_state['question']}', category: '{prev_state['category']}'")
                
                # First try to map to an option for the exact question
                option_result = map_to_option(user_message, prev_state['category'], prev_state['question'], conversation_id)
                option_data = option_result.get_json()
                
                # If confidence is too low, try mapping to a question instead
                if option_data.get('confidence', 0) < 0.6:
                    print(f"DEBUG: Option confidence too low ({option_data.get('confidence', 0)}), trying question mapping")
                    
                    # Clear the conversation state since we're abandoning this question
                    print(f"DEBUG: Abandoning question '{prev_state['question']}' due to low option confidence")
                    del conversation_state[conversation_id]
                    
                    # Try mapping to a question
                    question_result = map_to_question(user_message, conversation_id)
                    question_data = question_result.get_json()
                    
                    # If question confidence is higher, return that instead
                    if question_data.get('confidence', 0) >= 0.6:
                        print(f"DEBUG: Found better question match: '{question_data.get('question')}' with confidence {question_data.get('confidence', 0)}")
                        return question_result
                    else:
                        print(f"DEBUG: Question confidence also too low ({question_data.get('confidence', 0)})")
                        # Return the question result anyway, as we've abandoned the previous question
                        return question_result
                
                # Check if the option matches the question
                if option_data.get('question') != prev_state['question']:
                    print(f"DEBUG: Question mismatch - expected '{prev_state['question']}', got '{option_data.get('question')}'")
                    
                    # Clear the conversation state since we're abandoning this question
                    print(f"DEBUG: Abandoning question '{prev_state['question']}' due to question mismatch")
                    del conversation_state[conversation_id]
                    
                    # Try mapping to a question instead
                    question_result = map_to_question(user_message, conversation_id)
                    question_data = question_result.get_json()
                    
                    # If question confidence is good, return that instead
                    if question_data.get('confidence', 0) >= 0.6:
                        print(f"DEBUG: Found question match: '{question_data.get('question')}' with confidence {question_data.get('confidence', 0)}")
                        return question_result
                    else:
                        # Return the question result anyway, as we've abandoned the previous question
                        return question_result
                
                # If we have a good match, clear the conversation state
                if (option_data.get('confidence', 0) >= 0.6 and 
                    option_data.get('question') == prev_state['question'] and
                    option_data.get('category') == prev_state['category']):
                    # Clear the state if we have a confident match for the right question
                    print(f"DEBUG: Good option match, clearing conversation state")
                    del conversation_state[conversation_id]
                
                return option_result
            else:
                # Otherwise map to question
                print(f"DEBUG: No previous state, mapping to question")
                return map_to_question(user_message, conversation_id)
    except Exception as e:
        print(f"Error in map_response: {e}")
        return jsonify({
            "success": False,
            "message": f"Error processing request: {str(e)}"
        }), 500

# Start background worker thread
embedding_thread = threading.Thread(target=embedding_worker, daemon=True)
embedding_thread.start()

# Preload embeddings if enabled
if PRELOAD_QUESTIONS:
    preload_thread = threading.Thread(target=preload_question_embeddings, daemon=True)
    preload_thread.start()

if __name__ == '__main__':
    print("Starting optimized semantic service...")
    app.run(host='0.0.0.0', port=5000)