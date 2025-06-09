import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import FooterMenu from "../components/FooterMenu";
import * as Speech from "expo-speech";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://10.55.17.30:8080/api/v1/chat";

const SarvUday = () => {
  const [ state ] = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);

  const { sessionId: routeSessionId, sessionName: routeSessionName } = route.params || {};

  // Stop speech on focus change
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        Speech.stop();
      };
    }, [])
  );

  // Initialize or switch session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        
        // Clear previous chat when session changes
        setChatHistory([]);
        
        if (route.params?.sessionId) {
          // Existing session - fetch history
          await fetchChatHistory(route.params.sessionId);
          setSessionId(route.params.sessionId);
          setSessionName(route.params.sessionName || "Unnamed Chat");
        } else {
          // New session - create via API
          const res = await axios.post(
            `${API_URL}/chat-sessions`,
            {},
            { headers: { Authorization: `Bearer ${state.token}` } }
          );
          
          setSessionId(res.data.sessionId);
          setSessionName(res.data.conversationName || "New Chat");
        }
      } catch (error) {
        console.error("Session error:", error);
        Alert.alert("Error", "Could not initialize chat session");
      } finally {
        setIsLoading(false);
      }
    };
  
    initializeSession();
  }, [route.params?.sessionId]); // Add proper dependency // Added dependencies

  const fetchChatHistory = async (id) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/chat-history?sessionId=${id}`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      setChatHistory(res.data.chats || []);
      scrollToBottom();
    } catch (error) {
      console.error("History error:", error);
      Alert.alert("Error", "Could not load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);
 // Stop speech when page changes
 useEffect(() => {
  return () => {
    Speech.stop();
  };
}, [navigation]);

// Speak AI response
const speak = (text) => {
  Speech.stop(); // Stop any ongoing speech
  Speech.speak(text, {
    language: "en-US",
    pitch: 1.0,
    rate: 0.8,
  });
};
  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !sessionId || isLoading) return;

    try {
      // Optimistic update
      const userMessage = { message: trimmedMessage, response: "..." };
      setChatHistory(prev => [...prev, userMessage]);
      setMessage("");
      scrollToBottom();

      const response = await axios.post(
        `${API_URL}/send-message`,
        { message: trimmedMessage, sessionId },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );

      // Replace temporary message with actual response
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { message: trimmedMessage, response: response.data?.chat?.response || "No response" }
      ]);
    } catch (error) {
      console.error("Send error:", error);
      // Remove the optimistic update if failed
      setChatHistory(prev => prev.slice(0, -1));
      Alert.alert("Error", "Failed to send message");
    } finally {
      scrollToBottom();
    }
  };
 

// Stop speech when typing a new message
const handleInputChange = (text) => {
Speech.stop();
setMessage(text);
};
  if (isLoading && chatHistory.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.header}>{sessionName}</Text>
      
      <FlatList
        ref={flatListRef}
        data={chatHistory}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.userText}>You: {item.message}</Text>
            <View style={styles.aiContainer}>
              <Text style={styles.aiText}>AI: {item.response}</Text>
              {item.response !== "..." && (
                <TouchableOpacity 
                style={styles.speakButton}
                onPress={() => speak(item.response)}
              >
                <Text style={styles.speakText}>Speak</Text>
              </TouchableOpacity>
              
              )}
            </View>
          </View>
        )}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={handleInputChange}
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.disabledButton]}
          onPress={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <FooterMenu />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efc6f5",
    padding: 10,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 10,
    textAlign: "center",
  },
  messageContainer: {
    marginVertical: 5,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendingMessage: {
    backgroundColor: "#ddd",
  },
  userText: {
    fontWeight: "bold",
    color: "#000",
  },
  aiContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  aiText: {
    fontWeight: "bold",
    color: "#007AFF",
    flex: 1,
  },
  speakButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  speakText: {
    color: "#fff",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  sendButton: {
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    marginLeft: 5,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SarvUday;