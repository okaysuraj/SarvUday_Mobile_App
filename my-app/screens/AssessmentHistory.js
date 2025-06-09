import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { Ionicons } from "@expo/vector-icons";
import FooterMenu from "../components/FooterMenu";

const API_URL = "http://10.55.17.30:8080/api/v1/chat/assessment-results";

const AssessmentHistory = ({ navigation }) => {
  const [state] = useContext(AuthContext);
  const [assessmentData, setAssessmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchAssessmentHistory();
  }, []);

  const fetchAssessmentHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${state.token}` },
      });

      if (response.data && response.data.success) {
        setAssessmentData(response.data.results || {});
      } else {
        setAssessmentData({});
        Alert.alert("Info", "No assessment data found.");
      }
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      Alert.alert("Error", "Could not load assessment history.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const toggleCategory = (sessionId, category) => {
    const key = `${sessionId}-${category}`;
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'PHQ-9': return '#4285F4'; // Blue
      case 'BDI': return '#EA4335';   // Red
      case 'HDRS': return '#34A853';  // Green
      default: return '#FBBC05';      // Yellow
    }
  };

  const getScoreSeverity = (category, score) => {
    if (category === 'PHQ-9') {
      if (score <= 4) return { text: 'Minimal', color: '#34A853' };
      if (score <= 9) return { text: 'Mild', color: '#FBBC05' };
      if (score <= 14) return { text: 'Moderate', color: '#F56C2D' };
      if (score <= 19) return { text: 'Moderately Severe', color: '#EA4335' };
      return { text: 'Severe', color: '#B31412' };
    }
    if (category === 'BDI') {
      if (score <= 13) return { text: 'Minimal', color: '#34A853' };
      if (score <= 19) return { text: 'Mild', color: '#FBBC05' };
      if (score <= 28) return { text: 'Moderate', color: '#F56C2D' };
      return { text: 'Severe', color: '#B31412' };
    }
    if (category === 'HDRS') {
      if (score <= 7) return { text: 'Normal', color: '#34A853' };
      if (score <= 13) return { text: 'Mild', color: '#FBBC05' };
      if (score <= 18) return { text: 'Moderate', color: '#F56C2D' };
      if (score <= 22) return { text: 'Severe', color: '#EA4335' };
      return { text: 'Very Severe', color: '#B31412' };
    }
    return { text: 'Unknown', color: '#757575' };
  };
  
  const getInterpretation = (category, score) => {
    if (category === 'PHQ-9') {
      if (score <= 4) return 'Your symptoms suggest minimal depression. Continue monitoring your mood.';
      if (score <= 9) return 'Your symptoms suggest mild depression. Consider discussing with a healthcare provider.';
      if (score <= 14) return 'Your symptoms suggest moderate depression. A healthcare provider can help determine appropriate treatment.';
      if (score <= 19) return 'Your symptoms suggest moderately severe depression. Active treatment with medication and/or therapy is recommended.';
      return 'Your symptoms suggest severe depression. Immediate treatment with medication and therapy is strongly recommended.';
    }
    if (category === 'BDI') {
      if (score <= 13) return 'Your symptoms suggest minimal depression. Continue monitoring your mood.';
      if (score <= 19) return 'Your symptoms suggest mild depression. Consider discussing with a healthcare provider.';
      if (score <= 28) return 'Your symptoms suggest moderate depression. A healthcare provider can help determine appropriate treatment.';
      return 'Your symptoms suggest severe depression. Immediate treatment with medication and therapy is strongly recommended.';
    }
    if (category === 'HDRS') {
      if (score <= 7) return 'Your symptoms are within normal range. Continue monitoring your mood.';
      if (score <= 13) return 'Your symptoms suggest mild depression. Consider discussing with a healthcare provider.';
      if (score <= 18) return 'Your symptoms suggest moderate depression. A healthcare provider can help determine appropriate treatment.';
      if (score <= 22) return 'Your symptoms suggest severe depression. Immediate treatment with medication and therapy is recommended.';
      return 'Your symptoms suggest very severe depression. Immediate treatment with medication and therapy is strongly recommended.';
    }
    return 'Assessment interpretation not available.';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSessionItem = ({ item: sessionId }) => {
    const sessionData = assessmentData[sessionId];
    const categories = Object.keys(sessionData);
    const isExpanded = expandedSessions[sessionId] || false;
    
    // Get the date from the first category's first response
    let sessionDate = 'Unknown date';
    let sessionTitle = '';
    
    // Find the first user message to use as session title
    if (categories.length > 0) {
      const firstCategory = categories[0];
      if (sessionData[firstCategory].responses.length > 0) {
        // Get date from the first response
        sessionDate = formatDate(sessionData[firstCategory].responses[0].timestamp);
        
        // Get the first question as the session title
        const firstResponse = sessionData[firstCategory].responses[0];
        if (firstResponse.question) {
          // Use the first part of the question as the session title
          sessionTitle = firstResponse.question.split('?')[0] + '?';
          if (sessionTitle.length > 30) {
            sessionTitle = sessionTitle.substring(0, 30) + '...';
          }
        }
      }
    }
    
    // If no title was found, use a fallback
    if (!sessionTitle) {
      sessionTitle = `Session ${sessionId.substring(0, 8)}...`;
    }

    return (
      <View style={styles.sessionCard}>
        <TouchableOpacity 
          style={styles.sessionHeader} 
          onPress={() => toggleSession(sessionId)}
        >
          <View style={styles.sessionHeaderContent}>
            <Text style={styles.sessionTitle}>{sessionTitle}</Text>
            <Text style={styles.sessionDate}>{sessionDate}</Text>
          </View>
          <View style={styles.sessionActions}>
            <TouchableOpacity 
              style={styles.viewChatButton}
              onPress={() => navigation.navigate('SarvUday', { sessionId })}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#007AFF" />
              <Text style={styles.viewChatText}>View Chat</Text>
            </TouchableOpacity>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#555" 
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoriesContainer}>
            {categories.map(category => {
              const categoryData = sessionData[category];
              const categoryKey = `${sessionId}-${category}`;
              const isCategoryExpanded = expandedCategories[categoryKey] || false;
              const severity = getScoreSeverity(category, categoryData.totalScore);

              return (
                <View key={categoryKey} style={styles.categoryCard}>
                  <TouchableOpacity 
                    style={[
                      styles.categoryHeader, 
                      { backgroundColor: getCategoryColor(category) + '20' }
                    ]} 
                    onPress={() => toggleCategory(sessionId, category)}
                  >
                    <View style={styles.categoryHeaderContent}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>
                          Score: {categoryData.totalScore}
                        </Text>
                        <View style={[styles.severityBadge, { backgroundColor: severity.color }]}>
                          <Text style={styles.severityText}>{severity.text}</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons 
                      name={isCategoryExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#555" 
                    />
                  </TouchableOpacity>
                  
                  {isCategoryExpanded && (
                    <View style={styles.interpretationContainer}>
                      <Text style={styles.interpretationTitle}>Interpretation:</Text>
                      <Text style={styles.interpretationText}>
                        {getInterpretation(category, categoryData.totalScore)}
                      </Text>
                    </View>
                  )}

                  {isCategoryExpanded && (
                    <View style={styles.responsesContainer}>
                      {categoryData.responses.map((response, index) => (
                        <View key={index} style={styles.responseItem}>
                          <Text style={styles.questionText}>Q: {response.question}</Text>
                          <Text style={styles.responseText}>A: {response.response}</Text>
                          <Text style={styles.scoreItemText}>Score: {response.score}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
        <FooterMenu />
      </View>
    );
  }

  const sessionIds = Object.keys(assessmentData);

  // Get the most recent assessment for the summary card
  const getLatestAssessment = () => {
    if (sessionIds.length === 0) return null;
    
    // Sort sessions by date (using the first response's timestamp)
    const sortedSessions = [...sessionIds].sort((a, b) => {
      const aDate = getSessionDate(assessmentData[a]);
      const bDate = getSessionDate(assessmentData[b]);
      return new Date(bDate) - new Date(aDate); // Descending order
    });
    
    const latestSession = sortedSessions[0];
    const sessionData = assessmentData[latestSession];
    
    // Find the category with the highest score
    let highestCategory = null;
    let highestScore = -1;
    
    Object.entries(sessionData).forEach(([category, data]) => {
      if (data.totalScore > highestScore) {
        highestScore = data.totalScore;
        highestCategory = category;
      }
    });
    
    if (!highestCategory) return null;
    
    // Get session title from first question
    let sessionTitle = '';
    const categories = Object.keys(sessionData);
    if (categories.length > 0) {
      const firstCategory = categories[0];
      if (sessionData[firstCategory].responses.length > 0) {
        const firstResponse = sessionData[firstCategory].responses[0];
        if (firstResponse.question) {
          sessionTitle = firstResponse.question.split('?')[0] + '?';
          if (sessionTitle.length > 30) {
            sessionTitle = sessionTitle.substring(0, 30) + '...';
          }
        }
      }
    }
    
    if (!sessionTitle) {
      sessionTitle = `Session ${latestSession.substring(0, 8)}...`;
    }
    
    return {
      sessionId: latestSession,
      category: highestCategory,
      score: sessionData[highestCategory].totalScore,
      date: getSessionDate(sessionData),
      title: sessionTitle
    };
  };
  
  const getSessionDate = (sessionData) => {
    if (!sessionData) return 'Unknown';
    
    const categories = Object.keys(sessionData);
    if (categories.length === 0) return 'Unknown';
    
    const firstCategory = categories[0];
    if (sessionData[firstCategory].responses.length === 0) return 'Unknown';
    
    return sessionData[firstCategory].responses[0].timestamp;
  };
  
  const latestAssessment = sessionIds.length > 0 ? getLatestAssessment() : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Assessment History</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchAssessmentHistory}
          >
            <Ionicons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {sessionIds.length > 0 ? (
          <>
            {latestAssessment && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Latest Assessment</Text>
                <View style={styles.summaryContent}>
                  <View style={styles.summaryInfo}>
                    <Text style={styles.summaryCategory}>{latestAssessment.category}</Text>
                    <Text style={styles.summaryQuestion}>{latestAssessment.title}</Text>
                    <Text style={styles.summaryDate}>
                      {formatDate(latestAssessment.date)}
                    </Text>
                  </View>
                  <View style={styles.summaryScoreContainer}>
                    <Text style={styles.summaryScoreLabel}>Score</Text>
                    <View style={[
                      styles.summaryScoreBadge, 
                      { backgroundColor: getScoreSeverity(latestAssessment.category, latestAssessment.score).color }
                    ]}>
                      <Text style={styles.summaryScoreValue}>{latestAssessment.score}</Text>
                    </View>
                    <Text style={styles.summarySeverity}>
                      {getScoreSeverity(latestAssessment.category, latestAssessment.score).text}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => {
                    // Expand the latest session
                    toggleSession(latestAssessment.sessionId);
                    // Scroll to it
                    setTimeout(() => {
                      // This would need a ref to the FlatList and the scrollToItem method
                    }, 100);
                  }}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Ionicons name="chevron-down" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
            
            <FlatList
              data={sessionIds}
              renderItem={renderSessionItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContainer}
            />
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.noDataText}>No assessment history found.</Text>
            <Text style={styles.noDataSubtext}>
              Complete assessments in chat to see your results here.
            </Text>
          </View>
        )}
      </View>
      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f7",
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    padding: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sessionHeaderContent: {
    flex: 1,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  viewChatText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sessionDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  categoriesContainer: {
    padding: 10,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  categoryHeaderContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreText: {
    fontSize: 14,
    color: "#555",
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  responsesContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  interpretationContainer: {
    padding: 12,
    backgroundColor: '#f0f7ff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  interpretationText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  responseItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  questionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  responseText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  scoreItemText: {
    fontSize: 13,
    color: "#777",
    fontStyle: "italic",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
    marginTop: 16,
    textAlign: "center",
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryCategory: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  summaryQuestion: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
    fontStyle: "italic",
  },
  summaryDate: {
    fontSize: 14,
    color: "#666",
  },
  summaryScoreContainer: {
    alignItems: 'center',
  },
  summaryScoreLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  summaryScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryScoreValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  summarySeverity: {
    fontSize: 12,
    fontWeight: "500",
    color: "#555",
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    marginRight: 4,
  },
});

export default AssessmentHistory;
