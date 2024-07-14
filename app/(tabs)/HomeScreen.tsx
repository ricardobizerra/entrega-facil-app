import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Link } from "expo-router"; 
import * as Location from 'expo-location';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import OpenLocationCode from 'open-location-code-typescript';
import { Snackbar } from 'react-native-paper';
import LaUrsaSvg from '@/assets/images/la-ursa-home.svg';
import ScooterSvg from '@/assets/images/scooter-home.svg';
import styled from 'styled-components';
import { LinearGradient } from 'expo-linear-gradient';

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
    router.push('/LoginScreen'); // Redirecionar para a tela de login após logout
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
      {/* <Text style={styles.welcomeText}>Bem-vindo à Home!</Text>
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
      </Snackbar> */}

      <Header>
        <Titles>
          <Title>Olá, {user?.name?.split(' ')[0] || ''}</Title>
          <Description>
            Comece a receber seus pedidos em casa
          </Description>
        </Titles>

        <LaUrsaSvg width={55} />        
      </Header>

      <SubContainer>
        <OnboardingButton>
          <OnboardingGradient
            colors={['#FFF', '#DB3319']}
          >
            <OnboardingTitle>Etapas para usar o Tá Entregue</OnboardingTitle>
            <ScooterSvg width={'40%'} />
          </OnboardingGradient>
        </OnboardingButton>
      </SubContainer>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2af2c',
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

const Header = styled(View)`
  padding: 32px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
`;

const Titles = styled(View)`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled(Text)`
  font-size: 24px;
  color: #000;
  font-weight: bold;
`;

const Description = styled(Text)`
  font-size: 12px;
  color: #000;
`;

const SubContainer = styled(View)`
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 32px;
  margin-top: 32px;
`;

const OnboardingGradient = styled(LinearGradient)`
  width: 100%;
  height: 100%;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  padding: 16px;
`;

const OnboardingButton = styled(TouchableOpacity)`
position: absolute;
  top: -32px;
  margin: 0 32px;
  width: 100%;
  height: 160px;
`;

const OnboardingTitle = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: #000;
  width: 60%;
`;
