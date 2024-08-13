import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/analise.svg';

export default function LoginScreen() {

  const [id, setId] = useState('')
  const router = useRouter();
  useEffect(() => {
    async function fetchData() { 
      setId(String(await AsyncStorage.getItem('userId')))
    }
    fetchData();
  }, []);
  async function handleLogin() {
    try {
      await updateDoc(doc(database, "users", id), {
        confirmed: true
      });
      
      router.push({
          pathname: '/'
      });
      } catch (e: unknown) {
      if (e instanceof Error) {
        alert('Erro ao adicionar usuário: ' + e.message);
      } else {
        alert('Erro desconhecido ao adicionar usuário');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Logo/>
      <Text style={styles.title}>Nossa equipe analisará seu cadastro</Text>
      <Text style={styles.subtitle}>Você receberá o resultado de sua análise em seu email cadastrado em até 1 dia útil</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ir para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 210, 
    height: 270, 
    marginBottom: 30, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'regular',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    width: '80%',
    height: 40,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    color: '#000',
    fontSize: 14,
  },
  registerLink: {
    color: '#FFA500',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textDecorationColor: '#FFA500',
  },
  entregadorText: {
    color: '#000',
    position: 'absolute',
    bottom: 10,
    fontSize: 14,
  },
  entregadorLink: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
});
