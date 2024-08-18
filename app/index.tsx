import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/logo/LogoLogin.svg';
import { NextButton } from '@/components/form/NextButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin() {
    try {
      const q = query(collection(database, 'users'), where('email', '==', email), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let userData = querySnapshot.docs[0].data();
        const userId = querySnapshot.docs[0].id;
        userData.id = userId

        // Save the user email to AsyncStorage
        await AsyncStorage.multiRemove(['userPic', 'kind'])
        await AsyncStorage.setItem('userEmail', userData.email);
        await AsyncStorage.setItem('phone', userData.phone);
        await AsyncStorage.setItem('userId', userData.id);
        await AsyncStorage.setItem('userName', userData.name);
        if (!!userData.pic) {
          await AsyncStorage.setItem('userPic', userData.pic);
        }

        if (!userData.kind) {
          userData.cadastrado = 'cadastrado'
          router.push({
            pathname: '/register/profileSelection',
            params: userData,
          });
          return
        }

        await AsyncStorage.setItem('kind', userData.kind)

        if (!userData.confirmed) {
          router.push({
            pathname: '/register/onBoard',
            params: {kind: userData.kind},
          });
          return
        }

        router.push({
          pathname: '/(tabs)/HomeScreen',
          params: {
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            kind: userData.kind
          },
        });
      } else {
        Alert.alert('Usuário não encontrado ou senha incorreta');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro ao fazer login: ' + error.message);
      } else {
        Alert.alert('Erro desconhecido ao fazer login');
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>Ei! Tá Entregue!</Text>
        <Text style={styles.subtitle}>Faça a diferença na sua comunidade</Text>
      </View>
      <View style={styles.section}>
        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <NextButton
          onPress={handleLogin}
          text="Login"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.registerText}>
          Não possui conta?{' '}
          <Text style={styles.registerLink} onPress={() => router.push('/register/start')}>
            Faça seu cadastro
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 64,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  section: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    marginBottom: 32, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'regular',
    color: '#000',
    marginTop: 8,
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
    width: '100%',
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
