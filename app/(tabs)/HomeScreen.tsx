import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Link } from "expo-router"; 
import * as Location from 'expo-location';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import OpenLocationCode from 'open-location-code-typescript';
import { Snackbar } from 'react-native-paper';
 
interface User {         
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  location?: string;
}

export default function HomeScreen() {
  const router = useRouter();

  const { email, name, phone } = useLocalSearchParams();

  const [user, setUser] = useState<User | undefined>({
    email: email as string,
    name: name as string,
    phone: phone as string,
  });
  const [visible, setVisible] = useState(false);

  function handleLogout() {
    // Lógica para logout (pode incluir Firebase Auth signOut se necessário)
    router.push('/loginscreen'); // Redirecionar para a tela de login após logout
  }

  async function getLocation() {
    if (!user || !user?.id) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão de localização negada');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    // update the current user docs with the location
    const usersRef = collection(database, 'users');

    // convert the location to OpenLocationCode
    const olc = OpenLocationCode.encode(location.coords.latitude, location.coords.longitude, 10);

    if (!olc) return;

    // update the user doc with the location
    try {
      await updateDoc(doc(usersRef, user.id), {
        location: olc,
      });
      setUser((user) => ({ ...user, location: olc }));
      setVisible(true);
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }

  useEffect(() => {
    async function fetchData() {
      const usersRef = collection(database, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      setUser({ ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id } as User);
    }
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bem-vindo à Home!</Text>
      <Text style={styles.userInfo}>Email: {user?.email}</Text>
      <Text style={styles.userInfo}>Nome: {user?.name}</Text>
      <Text style={styles.userInfo}>Celular: {user?.phone}</Text>
      {user?.location && <Text style={[styles.userInfo, styles.userLocationInfo]}>Localização salva! Ela será utilizada para que os pedidos cheguem até você.</Text>}
      {user && !user.location && (
        <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
          <Text style={styles.buttonText}>Adicionar localização</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2000}
        style={{ backgroundColor: 'green' }}
      >
        Localização adicionada ✅
      </Snackbar>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  userLocationInfo: { 
    fontSize: 16,
    marginTop: 8,
    color: '#fff',
    backgroundColor: 'green',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16
  },
  locationButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
