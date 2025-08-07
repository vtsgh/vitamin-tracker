import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useRef, useState, useCallback } from 'react';
import { VITAMINS } from '../constants/vitamins';

export default function ChooseVitamin() {
  const [isNavigating, setIsNavigating] = useState(false);
  const lastTapTime = useRef(0);

  // Reset navigation state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  const handleVitaminPress = (vitaminId: string, vitaminLabel: string) => {
    const now = Date.now();
    if (now - lastTapTime.current < 1000 || isNavigating) { // 1 second debounce for proper protection
      console.log('🚫 Blocked rapid tap - too soon');
      return;
    }
    lastTapTime.current = now;
    setIsNavigating(true);
    
    console.log('✅ Selected vitamin:', vitaminLabel);
    router.push({
      pathname: '/select-dosage',
      params: { vitamin: vitaminLabel }
    });
  };

  const handleBack = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 500 || isNavigating) { // 500ms debounce for back
      return;
    }
    lastTapTime.current = now;
    setIsNavigating(true);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your vitamin!</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {VITAMINS.map((vitamin) => (
          <TouchableOpacity
            key={vitamin.id}
            style={[styles.vitaminButton, isNavigating && styles.disabledButton]}
            onPress={() => handleVitaminPress(vitamin.id, vitamin.label)}
            disabled={isNavigating}
            activeOpacity={isNavigating ? 1 : 0.8}
          >
            <Text style={styles.vitaminButtonText}>{vitamin.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity 
        style={[styles.backButton, isNavigating && styles.disabledButton]} 
        onPress={handleBack}
        disabled={isNavigating}
        activeOpacity={isNavigating ? 1 : 0.8}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  vitaminButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
    marginBottom: 20,
    width: '80%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  vitaminButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
    // Keep original background color to prevent flashing, just reduce opacity
  },
});