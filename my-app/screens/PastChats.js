import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/authContext";
import FooterMenu from "../components/FooterMenu";

const PastChats = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [state] = useContext(AuthContext);
  
  // Format message to be used as a title
  const formatMessageAsTitle = (message) => {
    if (!message) return null;
    
    // Limit to a reasonable length
    let title = message.trim();
    
    // If it's a question, just use the question
    if (title.includes('?')) {
      title = title.split('?')[0] + '?';
    } 
    // Otherwise, take the first sentence or part
    else if (title.includes('.')) {
      title = title.split('.')[0] + '.';
    } else if (title.length > 40) {
      title = title.substring(0, 40);
    }
    
    // Capitalize first letter
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get("http://10.55.17.30:8080/api/v1/chat/chat-sessions", {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
        setSessions(res.data.sessions);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
        setError("Failed to load chat sessions");
        Alert.alert("Error", "Could not load your chat sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [state.token]);

  if (loading) return (
    <View style={{ flex: 1 }}>
      <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      <FooterMenu />
    </View>
  );
  
  if (error) return (
    <View style={{ flex: 1 }}>
      <Text style={{ padding: 16, color: "red" }}>{error}</Text>
      <FooterMenu />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => navigation.navigate("SarvUday", { sessionId: null })}
          >
            <Text style={styles.newChatButtonText}>Start New Chat</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No chat sessions yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.sessionItem,
              item._id === currentSessionId && styles.activeSessionItem,
            ]}
            onPress={() => {
              setCurrentSessionId(item._id);
              navigation.navigate("SarvUday", {
                sessionId: item._id,
                sessionName: formatMessageAsTitle(item.firstMessage) || item.sessionName || "Unnamed Chat",
              });
            }}
          >
            <Text 
              style={styles.sessionName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {formatMessageAsTitle(item.firstMessage) || item.sessionName || "Unnamed Chat"}
            </Text>
            <Text style={styles.sessionDate}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />
      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#f5f5f5",
  },
  newChatButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newChatButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  sessionItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: "#666",
  },
  activeSessionItem: {
    backgroundColor: "#e6f2ff",
    borderLeftColor: "#004080",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});

export default PastChats;
