import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { email, name, phone } = useLocalSearchParams();

  function handleLogout() {
    // Lógica para logout (pode incluir Firebase Auth signOut se necessário)
    router.push('/LoginScreen'); // Redirecionar para a tela de login após logout
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bem-vindo à Home!</Text>
      <Text style={styles.userInfo}>Email: {email}</Text>
      <Text style={styles.userInfo}>Nome: {name}</Text>
      <Text style={styles.userInfo}>Celular: {phone}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 10,
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
