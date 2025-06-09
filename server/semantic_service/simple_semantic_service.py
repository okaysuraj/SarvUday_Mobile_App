from flask import Flask, request, jsonify
import random
import re

app = Flask(__name__)

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
        "Sadness": [
            "I do not feel sad",
            "I feel sad",
            "I am sad all the time and I can't snap out of it",
            "I am so sad and unhappy that I can't stand it"
        ],
        "Pessimism": [
            "I am not particularly discouraged about the future",
            "I feel discouraged about the future",
            "I feel I have nothing to look forward to",
            "I feel the future is hopeless and that things cannot improve"
        ],
        "Past failure": [
            "I do not feel like a failure",
            "I feel I have failed more than the average person",
            "As I look back on my life, all I can see is a lot of failures",
            "I feel I am a complete failure as a person"
        ],
        "Loss of pleasure": [
            "I get as much satisfaction out of things as I used to",
            "I don't enjoy things the way I used to",
            "I don't get real satisfaction out of anything anymore",
            "I am dissatisfied or bored with everything"
        ],
        "Guilty feelings": [
            "I don't feel particularly guilty",
            "I feel guilty a good part of the time",
            "I feel quite guilty most of the time",
            "I feel guilty all of the time"
        ],
        "Punishment feelings": [
            "I don't feel I am being punished",
            "I feel I may be punished",
            "I expect to be punished",
            "I feel I am being punished"
        ],
        "Self-dislike": [
            "I don't feel disappointed in myself",
            "I am disappointed in myself",
            "I am disgusted with myself",
            "I hate myself"
        ],
        "Self-criticalness": [
            "I don't feel I am any worse than anybody else",
            "I am critical of myself for my weaknesses or mistakes",
            "I blame myself all the time for my faults",
            "I blame myself for everything bad that happens"
        ],
        "Suicidal thoughts or wishes": [
            "I don't have any thoughts of killing myself",
            "I have thoughts of killing myself, but I would not carry them out",
            "I would like to kill myself",
            "I would kill myself if I had the chance"
        ],
        "Crying": [
            "I don't cry any more than usual",
            "I cry more now than I used to",
            "I cry all the time now",
            "I used to be able to cry, but now I can't cry even though I want to"
        ],
        "Agitation": [
            "I am no more irritated by things than I ever was",
            "I am slightly more irritated now than usual",
            "I am quite annoyed or irritated a good deal of the time",
            "I feel irritated all the time"
        ],
        "Loss of interest": [
            "I have not lost interest in other people",
            "I am less interested in other people than I used to be",
            "I have lost most of my interest in other people",
            "I have lost all of my interest in other people"
        ],
        "Indecisiveness": [
            "I make decisions about as well as I ever could",
            "I put off making decisions more than I used to",
            "I have greater difficulty in making decisions more than I used to",
            "I can't make decisions at all anymore"
        ],
        "Worthlessness": [
            "I don't feel that I look any worse than I used to",
            "I am worried that I am looking old or unattractive",
            "I feel there are permanent changes in my appearance that make me look unattractive",
            "I believe that I look ugly"
        ],
        "Loss of energy": [
            "I can work about as well as before",
            "It takes an extra effort to get started at doing something",
            "I have to push myself very hard to do anything",
            "I can't do any work at all"
        ],
        "Changes in sleeping pattern": [
            "I can sleep as well as usual",
            "I don't sleep as well as I used to",
            "I wake up 1-2 hours earlier than usual and find it hard to get back to sleep",
            "I wake up several hours earlier than I used to and cannot get back to sleep"
        ],
        "Irritability": [
            "I don't get more tired than usual",
            "I get tired more easily than I used to",
            "I get tired from doing almost anything",
            "I am too tired to do anything"
        ],
        "Changes in appetite": [
            "My appetite is no worse than usual",
            "My appetite is not as good as it used to be",
            "My appetite is much worse now",
            "I have no appetite at all anymore"
        ],
        "Concentration difficulty": [
            "I can concentrate as well as ever",
            "I can't concentrate as well as usual",
            "It's hard to keep my mind on anything for very long",
            "I find I can't concentrate on anything"
        ],
        "Tiredness or fatigue": [
            "I don't get more tired than usual",
            "I get tired more easily than I used to",
            "I get tired from doing almost anything",
            "I am too tired to do anything"
        ],
        "Loss of interest in sex": [
            "I have not noticed any recent change in my interest in sex",
            "I am less interested in sex than I used to be",
            "I have almost no interest in sex",
            "I have lost interest in sex completely"
        ]
    },
    
    "HDRS": {
        "Depressed mood": [
            "Absent",
            "These feeling states indicated only on questioning",
            "These feeling states spontaneously reported verbally",
            "Communicates feeling states non-verbally",
            "Patient reports virtually only these feeling states"
        ],
        "Feelings of guilt": [
            "Absent",
            "Self reproach, feels he has let people down",
            "Ideas of guilt or rumination over past errors or sinful deeds",
            "Present illness is a punishment. Delusions of guilt",
            "Hears accusatory or denunciatory voices and/or experiences threatening visual hallucinations"
        ],
        "Suicidal thoughts": [
            "Absent",
            "Feels life is not worth living",
            "Wishes he were dead or any thoughts of possible death to self",
            "Suicide ideas or gesture",
            "Attempts at suicide"
        ],
        "Insomnia - early": [
            "No difficulty falling asleep",
            "Complains of occasional difficulty falling asleep",
            "Complains of nightly difficulty falling asleep"
        ],
        "Insomnia - middle": [
            "No difficulty",
            "Patient complains of being restless and disturbed during the night",
            "Waking during the night – any getting out of bed rates 2"
        ],
        "Insomnia - late": [
            "No difficulty",
            "Waking in early hours of the morning but goes back to sleep",
            "Unable to fall asleep again if gets out of bed"
        ],
        "Work and activities": [
            "No difficulty",
            "Thoughts and feelings of incapacity, fatigue or weakness",
            "Loss of interest in activity; hobbies or work",
            "Decrease in actual time spent in activities or decrease in productivity",
            "Stopped working because of present illness"
        ],
        "Psychomotor retardation": [
            "Normal speech and thought",
            "Slight retardation at interview",
            "Obvious retardation at interview",
            "Interview difficult",
            "Complete stupor"
        ],
        "Agitation": [
            "None",
            "Fidgetiness",
            "Playing with hands, hair, etc.",
            "Moving about, can't sit still",
            "Hand wringing, nail biting, hair-pulling, biting of lips"
        ],
        "Anxiety - psychological": [
            "No difficulty",
            "Subjective tension and irritability",
            "Worrying about minor matters",
            "Apprehensive attitude apparent in face or speech",
            "Fears expressed without questioning"
        ],
        "Anxiety - somatic": [
            "Absent",
            "Mild",
            "Moderate",
            "Severe",
            "Incapacitating"
        ],
        "Somatic symptoms - gastrointestinal": [
            "None",
            "Loss of appetite but eating without encouragement from others",
            "Difficulty eating without urging from others"
        ],
        "Somatic symptoms - general": [
            "None",
            "Heaviness in limbs, back or head. Backaches, headache, muscle aches. Loss of energy and fatigability",
            "Any clear-cut symptom rates 2"
        ],
        "Genital symptoms": [
            "Absent",
            "Mild",
            "Severe"
        ],
        "Hypochondriasis": [
            "Not present",
            "Self-absorption (bodily)",
            "Preoccupation with health",
            "Frequent complaints, requests for help, etc.",
            "Hypochondriacal delusions"
        ],
        "Weight loss": [
            "No weight loss",
            "Probable weight loss associated with present illness",
            "Definite (according to patient) weight loss",
            "Not assessed"
        ],
        "Insight": [
            "Acknowledges being depressed and ill",
            "Acknowledges illness but attributes cause to bad food, climate, overwork, virus, need for rest, etc.",
            "Denies being ill at all"
        ]
    }
}

# Default options if category-specific options aren't available
default_options = ["Not at all", "Several days", "More than half the days", "Nearly every day"]

# Track the last mapped question for each conversation
conversation_state = {}

# Simple keyword matching for questions
keywords = {
    "interest": ["interest", "pleasure", "enjoy", "fun", "hobby", "motivation"],
    "mood": ["sad", "down", "depress", "hopeless", "blue", "unhappy", "mood"],
    "sleep": ["sleep", "insomnia", "awake", "night", "rest", "tired", "bed"],
    "energy": ["energy", "tired", "fatigue", "exhausted", "weary", "sluggish"],
    "appetite": ["appetite", "eat", "food", "weight", "hungry", "meal"],
    "guilt": ["guilt", "blame", "fault", "shame", "disappoint", "failure"],
    "concentration": ["concentrate", "focus", "attention", "distract", "think"],
    "psychomotor": ["slow", "fast", "agitated", "restless", "fidgety", "moving"],
    "suicide": ["suicid", "death", "die", "kill", "harm", "end", "life"]
}

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
                if option_data.get('confidence', 0) < 0.45:
                    print(f"DEBUG: Option confidence too low ({option_data.get('confidence', 0)}), trying question mapping")
                    
                    # Clear the conversation state since we're abandoning this question
                    print(f"DEBUG: Abandoning question '{prev_state['question']}' due to low option confidence")
                    del conversation_state[conversation_id]
                    
                    # Try mapping to a question
                    question_result = map_to_question(user_message, conversation_id)
                    question_data = question_result.get_json()
                    
                    # If question confidence is higher, return that instead
                    if question_data.get('confidence', 0) >= 0.45:
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
                    if question_data.get('confidence', 0) >= 0.45:
                        print(f"DEBUG: Found question match: '{question_data.get('question')}' with confidence {question_data.get('confidence', 0)}")
                        return question_result
                    else:
                        # Return the question result anyway, as we've abandoned the previous question
                        return question_result
                
                # If we have a good match, clear the conversation state
                if (option_data.get('confidence', 0) >= 0.45 and 
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

def map_to_question(user_message, conversation_id):
    """Map user message to a question using simple keyword matching"""
    user_message = user_message.lower()
    
    # Count keyword matches for each question
    best_match = None
    best_category = None
    best_score = -1
    
    # Try to find keyword matches
    for category, questions in questions_data.items():
        for question_idx, question in enumerate(questions):
            score = 0
            
            # Check for direct keyword matches
            for key, words in keywords.items():
                for word in words:
                    if re.search(r'\b' + word + r'\b', user_message):
                        score += 1
                        
            # Check if any words from the question appear in the message
            question_words = re.findall(r'\b\w+\b', question.lower())
            for word in question_words:
                if len(word) > 3 and re.search(r'\b' + word + r'\b', user_message):
                    score += 0.5
            
            if score > best_score:
                best_score = score
                best_match = question
                best_category = category
    
    # If no good match found, pick a random question
    if best_score <= 0:
        best_category = random.choice(list(questions_data.keys()))
        best_match = random.choice(questions_data[best_category])
        best_score = 0.1
    
    # Store the state for this conversation
    conversation_state[conversation_id] = {
        'category': best_category,
        'question': best_match
    }
    
    return jsonify({
        "mappingType": "question",
        "question": best_match,
        "category": best_category,
        "confidence": best_score / 10,  # Normalize to 0-1 range
        "success": True
    })

def map_to_option(user_message, category, question, conversation_id):
    """Map user message to an option using simple pattern matching"""
    user_message = user_message.lower()
    
    print(f"DEBUG: Mapping option for question: '{question}' in category: '{category}'")
    
    # Get the appropriate options for this category and question
    if category == "PHQ-9":
        # PHQ-9 has the same options for all questions
        question_options = options_data.get(category, default_options)
        print(f"DEBUG: Using PHQ-9 standard options")
    elif category in ["BDI", "HDRS"]:
        # BDI and HDRS have different options for each question
        category_options = options_data.get(category, {})
        
        # Try to get options for this specific question with exact match
        if question in category_options:
            question_options = category_options[question]
            print(f"DEBUG: Found exact match for question '{question}'")
        else:
            # If not found, try to find the closest match
            print(f"DEBUG: No exact match for '{question}', searching for closest match")
            best_match = None
            best_score = 0
            
            for q in category_options:
                # Print all available questions for debugging
                print(f"DEBUG: Comparing with question: '{q}'")
                
                # Calculate word overlap similarity
                q_words = set(q.lower().split())
                question_words = set(question.lower().split())
                common_words = q_words.intersection(question_words)
                
                # Calculate Jaccard similarity
                if len(q_words.union(question_words)) > 0:
                    similarity = len(common_words) / len(q_words.union(question_words))
                    print(f"DEBUG: Similarity with '{q}': {similarity:.4f}")
                    
                    if similarity > best_score:
                        best_score = similarity
                        best_match = q
            
            if best_match and best_score > 0.3:  # Require at least 30% similarity
                print(f"DEBUG: Best match found: '{best_match}' with score {best_score:.4f}")
                question_options = category_options[best_match]
                # Update the question to the matched one for consistency
                question = best_match
            else:
                print(f"DEBUG: No good match found for question '{question}', using default options")
                question_options = default_options
    else:
        # Fallback to default options
        question_options = default_options
        print(f"DEBUG: Unknown category '{category}', using default options")
    
    # Print the options we're using
    print(f"DEBUG: Using options: {question_options}")
    
    # Look for direct mentions of the options
    best_match_idx = -1
    best_score = -1
    
    for idx, option in enumerate(question_options):
        option_lower = option.lower()
        score = 0
        
        # Check for direct option mentions
        if option_lower in user_message:
            score += 3
        
        # Check for individual words from the option
        option_words = re.findall(r'\b\w+\b', option_lower)
        for word in option_words:
            if len(word) > 3 and re.search(r'\b' + word + r'\b', user_message):
                score += 1
        
        # Check for severity indicators
        severity_indicators = {
            0: ["not", "never", "none", "absent", "rarely", "no"],
            1: ["little", "mild", "somewhat", "occasionally", "sometimes", "few", "slightly"],
            2: ["moderate", "half", "often", "regular", "frequently"],
            3: ["severe", "very", "always", "constantly", "every", "extremely", "completely"]
        }
        
        for severity, words in severity_indicators.items():
            for word in words:
                if re.search(r'\b' + word + r'\b', user_message):
                    # If the severity matches the option index, give it a boost
                    if severity == idx:
                        score += 2
                    else:
                        score += 0.5
        
        if score > best_score:
            best_score = score
            best_match_idx = idx
    
    # If no good match found, make an educated guess based on sentiment
    if best_match_idx == -1:
        # Simple sentiment analysis
        negative_words = ["bad", "worse", "terrible", "awful", "horrible", "sad", "depressed", "unhappy", "miserable"]
        positive_words = ["good", "better", "fine", "okay", "alright", "happy", "well", "great", "excellent"]
        
        negative_count = sum(1 for word in negative_words if re.search(r'\b' + word + r'\b', user_message))
        positive_count = sum(1 for word in positive_words if re.search(r'\b' + word + r'\b', user_message))
        
        if negative_count > positive_count:
            # More negative sentiment, choose a higher severity option
            best_match_idx = min(len(question_options) - 1, 2)
        else:
            # More positive sentiment, choose a lower severity option
            best_match_idx = max(0, 1)
        
        best_score = 0.5
    
    matched_option = question_options[best_match_idx]
    
    return jsonify({
        "mappingType": "option",
        "question": question,  # Return the exact question that was matched
        "category": category,
        "mappedOption": matched_option,
        "score": best_match_idx,
        "confidence": best_score / 10,  # Normalize to 0-1 range
        "success": True
    })

if __name__ == '__main__':
    print("Starting simple semantic service (no Ollama required)...")
    print("This service uses basic keyword matching instead of embeddings.")
    print("Running on http://localhost:5000")
    app.run(port=5000)