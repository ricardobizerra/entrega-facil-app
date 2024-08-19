import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  kind?: string;
  location?: string;
}

export default function OnBoardScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [screen, setScreen] = useState(1);

  const {kind, _screen } = useLocalSearchParams();
  if (_screen != null && Number(_screen) != screen) {
    setScreen(Number(_screen))
  }
  
  const _kind: string[] = String(kind!).split(',')!

  if (screen === 1 && !_kind.includes('entregador')) {
    setScreen(2)
  }
  else if (screen === 2 && !_kind.includes('armazenador') || screen === 3) {
    router.replace({
      pathname: '/register/setDadosBancarios',
      params: {  kind: kind, _screen: screen },
    });
  }

  return (
    <View style={styles.container}>
      {screen === 1 && _kind.includes('entregador') && (
        <>
          <Image source={require('@/assets/images/tela_cadastro.png')} style={styles.image} />
          <Text style={styles.text}>Cadastre o seu local de entrega e dados de entregador</Text>
          <Text style={styles.subtext}>Para utilizar o Tá Entregue, é preciso primeiro ter um local de entrega cadastrado</Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => {
            router.push({
              pathname: '/register/setLocalEntrega',
              params: { kind: kind, _screen: screen },
            });
          }}>
            <Text style={styles.buttonText}>Avançar</Text>
          </TouchableOpacity>
        </>
      )}
      {screen === 2 && _kind.includes('armazenador') && (
        <>
          <Image source={require('@/assets/images/tela_cadastro2.png')} style={styles.image} />
          <Text style={styles.text}>Cadastre o local do armazém e dados de armazenador</Text>
          <Text style={styles.subtext}>Para utilizar o Tá Entregue, é preciso primeiro ter um local de armazém cadastrado</Text>
          {(
            <TouchableOpacity style={styles.locationButton} onPress={() => {
              router.push({
                pathname: '/register/setLocalArmazem',
                params: { kind: kind, _screen: screen},
              });
            }}>
              <Text style={styles.buttonText}>Avançar</Text>
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
