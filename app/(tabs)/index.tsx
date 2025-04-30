import React, { useState } from 'react';
import { Image, StyleSheet, Button, View, Text, ActivityIndicator, Alert, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // adjust path as needed

export default function HomeScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New states for the fields
  const [numberOfTrees, setNumberOfTrees] = useState('');
  const [note, setNote] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');

  const fetchLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required!');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch location.');
    } finally {
      setLoading(false);
    }
  };

  const saveLocationToFirestore = async () => {
    if (!location) {
      Alert.alert('No location', 'Please fetch location first!');
      return;
    }

    if (!numberOfTrees || !submittedBy) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "locations"), {
        latitude: location.latitude,
        longitude: location.longitude,
        numberOfTrees: parseInt(numberOfTrees),
        status: 'pending',
        note,
        submittedBy,
        timestamp: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);
      Alert.alert('Success', 'Location and data saved successfully!');

      // Clear form after saving
      setNumberOfTrees('');
      setNote('');
      setSubmittedBy('');
      setLocation(null);

    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert('Error', 'Failed to save location.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Save area for Tree plantation by Bengal Tree Foundation</ThemedText>
        <ThemedText>
          Fetch your current location and save with other necessary data. Submitted data can be seen in Explore tab & in map.
        </ThemedText>
      </ThemedView>

      {/* Location Buttons and Display */}
      <View style={{ marginTop: 20, alignItems: 'center', paddingHorizontal: 20 }}>
        <Button title="Fetch Current Location" onPress={fetchLocation} />

        {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

        {location && (
          <View style={{ marginTop: 20, backgroundColor: 'white', padding: 10, borderRadius: 8, width: '100%' }}>
            <Text>Latitude: {location.latitude}</Text>
            <Text>Longitude: {location.longitude}</Text>

            {/* Input fields */}
            <TextInput
              placeholder="Number of Trees"
              value={numberOfTrees}
              onChangeText={setNumberOfTrees}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Note"
              value={note}
              onChangeText={setNote}
              style={styles.input}
            />
            <TextInput
              placeholder="Submitted By"
              value={submittedBy}
              onChangeText={setSubmittedBy}
              style={styles.input}
            />
          </View>
        )}

        {location && (
          <View style={{ marginTop: 20, width: '100%' }}>
            <Button title={saving ? "Saving..." : "Save Location Data"} onPress={saveLocationToFirestore} disabled={saving} />
          </View>
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
});
