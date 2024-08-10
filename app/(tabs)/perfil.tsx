import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/analise.svg';

export default function Perfil() {
  const router = useRouter();
  console.log(useLocalSearchParams())
  const { name, email, phone } = useLocalSearchParams();

  async function handleUpdate() {
    router.push({
      pathname: '/register/update',
      params:  {phone: phone}
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>{email}</Text>
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Atualizar dados</Text>
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
