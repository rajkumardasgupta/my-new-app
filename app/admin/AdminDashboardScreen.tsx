import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Switch,
  Button,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function AdminDashboardScreen() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editTrees, setEditTrees] = useState('');

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

  const handleEdit = (item: any) => {
    setEditItemId(item.id);
    setEditNote(item.note || '');
    setEditTrees(String(item.numberOfTrees));
  };
  const handleDelete = async (itemId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'locations', itemId));
            setLocations((prev) => prev.filter((item) => item.id !== itemId));
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete item.');
          }
        },
      },
    ]);
  };
  
  const handleSave = async (itemId: string) => {
    try {
      const itemRef = doc(db, 'locations', itemId);
      await updateDoc(itemRef, {
        numberOfTrees: parseInt(editTrees),
        note: editNote,
      });
      setLocations((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, numberOfTrees: parseInt(editTrees), note: editNote }
            : item
        )
      );
      setEditItemId(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save updates.');
    }
  };

  const handleDownloadPDF = async () => {
    const html = `
      <html>
      <body>
        <h1>Location Data</h1>
        <table border="1" cellspacing="0" cellpadding="8">
          <tr>
            <th>ID</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Trees</th>
            <th>Note</th>
            <th>Status</th>
            <th>Submitted By</th>
          </tr>
          ${locations
            .map(
              (loc) => `
            <tr>
              <td>${loc.u_id}</td>
              <td>${loc.latitude}</td>
              <td>${loc.longitude}</td>
              <td>${loc.numberOfTrees}</td>
              <td>${loc.note || ''}</td>
              <td>${loc.status}</td>
              <td>${loc.submittedBy}</td>
            </tr>`
            )
            .join('')}
        </table>
      </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const handleLogout = () => {
    router.replace('/admin/AdminLoginScreen');
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
            <Text style={styles.itemText}>Submitted By: {item.submittedBy}</Text>
            <Text style={styles.itemText}>Location Submit Date: {item.timestamp.toDate().toLocaleString()}</Text>
            <Text style={styles.itemText}>ID: {item.u_id}</Text>

            {editItemId === item.id ? (
            <>
              <TextInput
                style={styles.input}
                value={editTrees}
                onChangeText={setEditTrees}
                keyboardType="numeric"
                placeholder="Number of Trees"
              />
              <TextInput
                style={styles.input}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Note"
              />
              <Button title="Save" onPress={() => handleSave(item.id)} />
            </>
          ) : (
            <>
              <Text style={styles.itemText}>Trees: {item.numberOfTrees}</Text>
              <Text style={styles.itemText}>Note: {item.note || 'N/A'}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Button title="Edit" onPress={() => handleEdit(item)} />
                <Button
                  title="Delete"
                  color="#d9534f"
                  onPress={() => handleDelete(item.id)}
                />
              </View>
            </>
          )}


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

      <View style={styles.footerButtons}>
        <Button title="Download PDF" color="#007bff" onPress={handleDownloadPDF} />
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
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 6,
    marginVertical: 4,
  },
  footerButtons: {
    marginTop: 20,
    gap: 10,
  },
});
