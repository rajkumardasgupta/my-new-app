import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

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

export default function ExMapScreen() {
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

  const leafletHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
    />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <script>
      const map = L.map('map').setView([22.5726, 88.3639], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const redIcon = new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const locations = ${JSON.stringify(locations)};
      locations.forEach(loc => {
        const icon = loc.status === 'done' ? greenIcon : redIcon;

        const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
        marker.bindPopup(\`
          By: <strong>\${loc.submittedBy}</strong><br/>
          Trees: \${loc.numberOfTrees}<br/>
          Status: \${loc.status}<br/>
          Note: \${loc.note || 'N/A'}<br/>
          <a href="https://www.google.com/maps?q=\${loc.latitude},\${loc.longitude}" target="_blank">
            Open in Google Maps
          </a>
        \`);

      });
    </script>
  </body>
  </html>
`;


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: leafletHtml }}
      style={styles.webview}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
