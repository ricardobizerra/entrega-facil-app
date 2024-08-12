import React, { useState, useEffect  } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/Logo.svg';
import { setCpf2 } from './set_field'

export default function RegisterScreen() {
  const params = useLocalSearchParams()
  const [phone, setPhone] = useState('');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [kind, setKind] = useState('')
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() { 
      setPhone(String(await AsyncStorage.getItem('phone')))
      setId(String(await AsyncStorage.getItem('userId')))
      setEmail(String(await AsyncStorage.getItem('userEmail')))
      setKind(String(await AsyncStorage.getItem('kind')))
    }
    fetchData();
  }, []);

  const numerical = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  async function setPhone2(phone: string) {
    const last = phone[phone.length - 1]
    if (!numerical.includes(last) || phone.length > 17) {
      phone = phone.substring(0, phone.length-1)
    }
    setPhone(phone)
  }
    
  const router = useRouter();

  async function handleUpdate() {
    if (!phone) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await updateDoc(doc(database, "users", id), {
        phone: phone
      });

      // Fetch the newly created user data
      const usersRef = collection(database, 'users');
      const newUserQuery = query(usersRef, where('email', '==', email));
      const newUserSnapshot = (await getDocs(newUserQuery)).docs;
      await AsyncStorage.setItem('userEmail', newUserSnapshot[0].data().email);
      await AsyncStorage.setItem('phone', newUserSnapshot[0].data().phone);

      router.back()

      setVisible(true);
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
      <Text style={styles.subtitle}>Atualizar Dados</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="phone" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={setPhone2}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {(kind == 'entregador' || kind=='entregador,armazenador') &&<TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: "register/setLocalEntrega",
          params: { update: 'true' }
        })
      }}>
        <Text style={styles.buttonText2}>&lt; Comunidade de entrega</Text>
      </TouchableOpacity>}
      {(kind == 'entregador' || kind == 'entregador,armazenador') && <TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: "register/setDadosEntregador",
          params: { update: 'true' }
        })
      }}>
        <Text style={styles.buttonText2}>&lt; Informações de entregador</Text>
      </TouchableOpacity>}
      {(kind == 'armazenador' || kind == 'entregador,armazenador') && <TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: "register/setLocalArmazem",
          params: { update: 'true' }
        })
      }}>
        <Text style={styles.buttonText2}>&lt; Informações de armazém</Text>
      </TouchableOpacity>}
      <TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: "register/setDadosBancarios",
          params: {update: 'true'}
        })
      }}>
        <Text style={styles.buttonText2}>&lt; Informações de pagamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Atualizar</Text>
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
    color: '#FFA500',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  subsubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  button2: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000',
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%'
  },
  buttonText2: {
    textAlign: 'left',
    color: '#000',
    fontSize: 18,
  },
  loginText: {
    color: '#000',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  snackbar: {
    backgroundColor: 'green',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
