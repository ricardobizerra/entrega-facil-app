import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function OnBoardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | undefined>();
  const [visible, setVisible] = useState(false);
  const [screen, setScreen] = useState(1);

  const { email, name, phone } = useLocalSearchParams();

  useEffect(() => {
    async function fetchData() {
      const usersRef = collection(database, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      setUser({ ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id } as User);
    }
    fetchData();
  }, []);

  async function getLocation() {
    if (!user || !user?.id) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão de localização negada');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    // Convert the location to OpenLocationCode
    const olc = OpenLocationCode.encode(location.coords.latitude, location.coords.longitude, 10);

    if (!olc) return;

    // Update the user doc with the location
    try {
      await updateDoc(doc(collection(database, 'users'), user.id), {
        location: olc,
      });
      setUser((user) => ({ ...user, location: olc }));
      setVisible(true);

      // Redirect to the HomeScreen with user data
      router.push({
        pathname: '/HomeScreen',
        params: { email: user.email, name: user.name, phone: user.phone },
      });

    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }

  return (
    <View style={styles.container}>
      {screen === 1 && (
        <>
          <Image source={require('@/assets/images/tela_cadastro.png')} style={styles.image} />
          <Text style={styles.text}>Cadastre o seu local de entrega</Text>
          <Text style={styles.subtext}>Para utilizar o Tá Entregue, é preciso primeiro ter um local de entrega cadastrado</Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => setScreen(2)}>
            <Text style={styles.buttonText}>Avançar</Text>
          </TouchableOpacity>
        </>
      )}
      {screen === 2 && (
        <>
          <Image source={require('@/assets/images/tela_cadastro2.png')} style={styles.image} />
          <Text style={styles.text}>Esteja presente no local em que você quer receber seu pedido</Text>
          <Text style={styles.subtext}>É necessário estar presente no seu local de entrega para cadastrá-lo no Tá Entregue</Text>
          {!user?.location && (
            <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
              <Text style={styles.buttonText}>Estou no local</Text>
            </TouchableOpacity>
          )}
        </>
      )}
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
    backgroundColor: '#ffffff',
  },
  image: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
  },
  subtext: {
    fontSize: 18,
    marginHorizontal: 20,
    textAlign: 'center',
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#260AB1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 20,
  },
  locationButton: {
    backgroundColor: '#260AB1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
