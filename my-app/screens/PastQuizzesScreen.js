import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import FooterMenu from "../components/FooterMenu";

const PastQuizzesScreen = () => {
    const [quizHistory, setQuizHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizHistory = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get('http://10.55.17.30:8080/api/quizzes/history', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setQuizHistory(response.data);
            } catch (error) {
                console.error('Error fetching quiz history:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizHistory();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1 }}>
                <Text style={styles.loadingText}>Loading...</Text>
                <FooterMenu />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {quizHistory.length === 0 ? (
                    <Text style={styles.noQuizzesText}>No quizzes found.</Text>
                ) : (
                    quizHistory.map((quiz, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.quizType}>{quiz.quizType}</Text>
                            <Text style={styles.date}>
                                Date: {format(new Date(quiz.date), 'dd MMM yyyy, HH:mm')}
                            </Text>
                            <Text style={styles.score}>Score: {quiz.score}</Text>
                            <Text style={styles.remark}>Remark: {quiz.remark}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
            <FooterMenu />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
    },
    noQuizzesText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: '#888',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quizType: {
        fontSize: 18,
        fontWeight: '600',
    },
    date: {
        fontSize: 14,
        color: '#555',
        marginVertical: 4,
    },
    score: {
        fontSize: 16,
        marginTop: 4,
    },
    remark: {
        fontSize: 16,
        marginTop: 2,
        color: '#333',
    },
});

export default PastQuizzesScreen;