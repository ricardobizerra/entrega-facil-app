import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/Logo.svg';
import { setCep2 } from './set_field'
import { SectionTitle } from '@/components/SectionTitle';
import { NextButton } from '@/components/form/NextButton';

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const kind = params.kind;
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [comunidade, setComunidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const cep_default = ''
  const [cep, setCep] = useState(cep_default);
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [editable, setVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() { 
      setVisible(false)
      let id = String(await AsyncStorage.getItem('userId'))
      setId(id)
      setEmail(String(await AsyncStorage.getItem('userEmail')))
      if (!!params.update) {
        // Fetch user data
        const usersRef = collection(database, 'users');
        const newUserQuery = query(usersRef, where('__name__', '==', id));

        try {
          const newUserSnapshot = await getDocs(newUserQuery);
          const newUser = newUserSnapshot.docs[0].data();
          setComunidade(newUser.armazem.comunidade)
          // setBairro(newUser.armazem.bairro)
          // setCapacidade(newUser.armazem.capacidade)
          setCep(newUser.armazem.cep)
          setLogradouro(newUser.armazem.logradouro)
          setNumero(newUser.armazem.numero)
          setComplemento(newUser.armazem.complemento)
        }
        catch (e: unknown) {
          if (e instanceof Error) {
            alert('Erro ao carregar os dados: ' + e.message);
          } else {
            alert('Erro desconhecido ao carregar os dados');
          }
        }
      }
      setVisible(true)
    }
    fetchData();
  }, []);

  const numerical = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']


  const router = useRouter();

  async function handleRegister() {
    if (!comunidade /*|| !bairro*/ || !cep || !logradouro || !numero || cep===cep_default || cep.length != 9) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await updateDoc(doc(database, "users", id), {
        armazem: {
          comunidade,
          // bairro,
          // capacidade,
          cep,
          logradouro,
          numero,
          complemento
        }
      });


      if (!!params.update) {
        router.back()
      }
      else {
        router.push({
          pathname: '/register/setDadosBancarios',
          params: {  kind: kind, _screen: 3 },
        });
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
      <View>
        <SectionTitle title="Dados do armazenador" style={{ marginBottom: 32 }} />
        <View style={styles.inputContainer}>
          <FontAwesome name="users" size={24} color="black" />
          {<TextInput
            style={styles.input}
            placeholder="Comunidade de Atuação"
            placeholderTextColor="#aaa"
            value={comunidade}
            onChangeText={setComunidade}
            editable={editable}
          />}
        </View>
        {/* <View style={styles.inputContainer}>
          <FontAwesome name="users" size={24} color="black" />
          {visible && <TextInput
            style={styles.input}
            placeholder="Bairro"
            placeholderTextColor="#aaa"
            value={bairro}
            onChangeText={setBairro}
          />}
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="users" size={24} color="black" />
          {visible && <TextInput
            style={styles.input}
            placeholder="Capacidade"
            placeholderTextColor="#aaa"
            value={capacidade}
            onChangeText={setCapacidade}
          />}
        </View> */}
        <View style={styles.inputContainer} onTouchStart={() => {
            if (cep === cep_default && !params.update) {
              setCep('')
            }
          }}>
          <FontAwesome name="info" size={14} color="black" />
          {<TextInput
            style={styles.input}
            placeholder="CEP"
            placeholderTextColor="#aaa"
            value={cep}
            onChangeText={(s) => setCep2(s, setCep)}
            editable={editable}
          />}
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="address-book" size={13} color="black" />
          {<TextInput
            style={styles.input}
            placeholder="Logradouro"
            placeholderTextColor="#aaa"
            value={logradouro}
            onChangeText={setLogradouro}
            editable={editable}
          />}
        </View>
        <View style={styles.twoInput}>
          <View style={styles.twoInputContainer}>
            {<TextInput
              style={styles.input}
              placeholder="Número"
              placeholderTextColor="#aaa"
              value={numero}
              onChangeText={setNumero}
              editable={editable}
            />}
          </View>
          <View style={styles.twoInputContainer}>
            {<TextInput
              style={styles.input}
              placeholder="Complemento"
              placeholderTextColor="#aaa"
              value={complemento}
              onChangeText={setComplemento}
              editable={editable}
            />}
          </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      <NextButton
        onPress={handleRegister}
        text={!params.update ? "Próximo" : "Atualizar"}
      />
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
  twoInput: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  twoInputContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    height: 40,
    width: '49%',
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
    width: '100%',
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
