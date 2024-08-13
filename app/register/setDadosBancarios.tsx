import React, { useState, useEffect } from 'react';
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
  const [id, setId] = useState('')
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [n_conta, setNConta] = useState('');
  const [titular_conta, setTitular] = useState('');
  const [cpf_titular, setCpfTitular] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  useEffect(() => {
    async function fetchData() { 
      setVisible(false);
      let id = String(await AsyncStorage.getItem('userId'))
      setId(id)
      if (!!params.update) {
        // Fetch user data
        const usersRef = collection(database, 'users');
        const newUserQuery = query(usersRef, where('__name__', '==', id));
        const newUserSnapshot = await getDocs(newUserQuery);
        const newUser = newUserSnapshot.docs[0].data();
        setBanco(newUser.dados_bancarios.banco)
        setNConta(newUser.dados_bancarios.n_conta)
        setAgencia(newUser.dados_bancarios.agencia)
        setTitular(newUser.dados_bancarios.titular_conta)
        setCpf2(newUser.dados_bancarios.cpf_titular, setCpfTitular)
      }
      setVisible(true);
    }
    fetchData();
  }, []);

  async function handleRegister() {
    if (!banco || !agencia || !n_conta || !titular_conta || !cpf_titular) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await updateDoc(doc(database, "users", id), {
        dados_bancarios: {
          banco,
          agencia,
          n_conta,
          titular_conta,
          cpf_titular
        }
      });

      if (!!params.update) {
        router.back()
      }
      else {
        router.push({ pathname: '/register/analise' })
      }

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
      <Text style={styles.subtitle}>Dados Bancários</Text>
      <View style={styles.inputContainer}>
        <FontAwesome size={24} color="black" />
        {visible && <TextInput
          style={styles.input}
          placeholder="Banco"
          placeholderTextColor="#aaa"
          value={banco}
          onChangeText={setBanco}
        />}
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome size={13} color="black" />
        {visible && <TextInput
          style={styles.input}
          placeholder="Agência"
          placeholderTextColor="#aaa"
          value={agencia}
          onChangeText={setAgencia}
        />}
      </View>
      <View style={styles.inputContainer}>
        {visible && <TextInput
          style={styles.input}
          placeholder="Número da conta"
          placeholderTextColor="#aaa"
          value={n_conta}
          onChangeText={setNConta}
        />}
      </View>
      <View style={styles.inputContainer}>
        {visible && <TextInput
          style={styles.input}
          placeholder="Titular da conta"
          placeholderTextColor="#aaa"
          value={titular_conta}
          onChangeText={setTitular}
        />}
      </View>
      <View style={styles.inputContainer}>
        {visible && <TextInput
          style={styles.input}
          placeholder="CPF do titular"
          placeholderTextColor="#aaa"
          value={cpf_titular}
          onChangeText={(s) => setCpf2(s, setCpfTitular)}
        />}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        {!params.update && <Text style={styles.buttonText}>Cadastrar</Text>}
        {!!params.update && <Text style={styles.buttonText}>Atualizar</Text>}
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
