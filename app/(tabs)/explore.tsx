import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface LocationItem {
  id: string;
  latitude: number;
  longitude: number;
  numberOfTrees: number;
  note: string;
  status: string;
  submittedBy: string;
  timestamp: any;
}

export default function TabTwoScreen() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'locations'));
      const fetchedLocations: LocationItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedLocations.push({
          id: doc.id,
          latitude: data.latitude,
          longitude: data.longitude,
          numberOfTrees: data.numberOfTrees,
          status: data.status,
          note: data.note,
          submittedBy: data.submittedBy,
          timestamp: data.timestamp,
        });
      });

      setLocations(fetchedLocations);
    } catch (error) {
      console.error('Error fetching locations: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);  // Show the loader when refreshing
    fetchLocations();  // Re-fetch the locations
  };

  const renderItem = ({ item }: { item: LocationItem }) => (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle" style={styles.cardTitle}>
        Submitted by: {item.submittedBy}
      </ThemedText>
      <ThemedText style={styles.cardText}>Latitude: {item.latitude.toFixed(6)}</ThemedText>
      <ThemedText style={styles.cardText}>Longitude: {item.longitude.toFixed(6)}</ThemedText>
      <ThemedText style={styles.cardText}>Number of Trees: {item.numberOfTrees}</ThemedText>
      {item.note ? <ThemedText style={styles.cardText}>Note: {item.note}</ThemedText> : null}
      <ThemedText style={styles.cardText}>Status: {item.status}</ThemedText>
      
      {/* Google Maps Link */}
      <TouchableOpacity
        onPress={() => {
          const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
          Linking.openURL(url);
        }}
      >
        <ThemedText style={styles.mapLink}>Open in Google Maps</ThemedText>
      </TouchableOpacity>
  
      <ThemedText style={styles.cardTime}>
        {new Date(item.timestamp?.seconds * 1000).toLocaleString()}
      </ThemedText>
    </ThemedView>
  );

  const ListHeader = () => (
    <View style={{ alignItems: 'center', marginTop: 50 }}>
      <ThemedText type="title">Saved Locations</ThemedText>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
            No locations saved yet.
          </ThemedText>
        }
      />
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the container takes full height
    backgroundColor: '#000',
    paddingTop: 20, // Optional: Adjust the top padding if needed
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#f51612',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#f6fcf1',
  },
  cardText: {
    fontSize: 16,
    color: '#cde5bd',
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 12,
    color: '#f51612',
    marginTop: 8,
    textAlign: 'right',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  refreshButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f51612', // Button color
    borderRadius: 5,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  mapLink: {
    color: '#1e90ff',
    marginTop: 4,
  },
});
