import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Switch, Button } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { router } from 'expo-router';

export default function AdminDashboardScreen() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'locations'));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setLocations(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const toggleStatus = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    try {
      const itemRef = doc(db, 'locations', itemId);
      await updateDoc(itemRef, { status: newStatus });
      setLocations((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not update status.');
    }
  };

  const handleLogout = () => {
    router.replace('/AdminLoginScreen');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemText}>Latitude: {item.latitude}</Text>
            <Text style={styles.itemText}>Longitude: {item.longitude}</Text>
            <Text style={styles.itemText}>Trees: {item.numberOfTrees}</Text>
            <Text style={styles.itemText}>Submitted By: {item.submittedBy}</Text>
            <Text style={styles.itemText}>id: {item.u_id}</Text>
            <Text style={styles.itemText}>note: {item.note}</Text>
            <View style={styles.statusRow}>
              <Text>Status: {item.status}</Text>
              <Switch
                value={item.status === 'done'}
                onValueChange={() => toggleStatus(item.id, item.status)}
              />
            </View>
          </View>
        )}
      />
      <View style={styles.logoutButton}>
        <Button title="Logout" color="#d9534f" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  itemText: { fontSize: 14, marginBottom: 4 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 20,
  },
});
