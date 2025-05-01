import React, { useState } from 'react';
import { Image, StyleSheet, Button, View, Text, ActivityIndicator, Alert, TextInput, Modal, Pressable, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default function HomeScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [temperature, setTemperature] = useState<string | null>(null);
  const [weatherDetails, setWeatherDetails] = useState<any>(null);


  const [numberOfTrees, setNumberOfTrees] = useState('');
  const [note, setNote] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');

  const fetchLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required!');
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchTemperature(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch location.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemperature = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const data = await res.json();
  
      if (data.current_weather) {
        setTemperature(`${data.current_weather.temperature}°C`);
        setWeatherDetails(data.current_weather);
      } else {
        setTemperature('Unavailable');
        setWeatherDetails(null);
      }
    } catch (err) {
      console.error('Error fetching temperature:', err);
      setTemperature('Error');
      setWeatherDetails(null);
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
        u_id: Date.now(),
      });

      Alert.alert('Success', 'Location and data saved successfully!');
      setNumberOfTrees('');
      setNote('');
      setSubmittedBy('');
      setLocation(null);
      setTemperature(null);
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert('Error', 'Failed to save location.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#004520' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Tree plantation locations by Bengal Tree Foundation</ThemedText>
        <ThemedText>
          Go to a plantation site where trees can be planted and Fetch current location, then save with other necessary data like number of trees that can be planted, details of the plantation site in notes. Submitted data can be seen in Explore tab & map.
        </ThemedText>
      </ThemedView>

      <View style={{ marginTop: 20, alignItems: 'center', paddingHorizontal: 20 }}>
        <Button title="Fetch Current Location" onPress={fetchLocation} />
        {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

        {location && (
          <View style={styles.infoBox}>
            <View style={styles.row}>
              <Text>Latitude: {location.latitude.toFixed(6)}</Text>
            
                <Text style={styles.tempText}>
                  {temperature ?? '...'}
                </Text>
              
            </View>
            <View style={styles.row}>
              <Text>Longitude: {location.longitude.toFixed(6)}</Text>
            </View>

            <TextInput
              placeholder="Number of Trees"
              value={numberOfTrees}
              onChangeText={setNumberOfTrees}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Note (in details)"
              value={note}
              onChangeText={setNote}
              style={styles.input}
            />
            <TextInput
              placeholder="Submitted By (your name)"
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
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 200,
    width: 390,
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
  infoBox: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
tempText: {
  fontSize: 16,
  color: '#f51612',
  fontWeight: 'bold',
  paddingLeft: 10,
},

});
