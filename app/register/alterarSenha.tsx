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
import { SectionTitle } from '@/components/SectionTitle';
import { NextButton } from '@/components/form/NextButton';

export default function RegisterScreen() {
  const params = useLocalSearchParams()
  const [id, setId] = useState('')
  const [senha_atual, SetSenhaAtual] = useState('')
  const [confirmar_senha_atual, SetConfirmarSenhaAtual] = useState('')
  const [nova_senha, SetSenha] = useState('')
  const [confirmar_senha, SetConfirmarSenha] = useState('')
  const [editable, setVisible] = useState(false);
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
        SetSenhaAtual(newUser.password)
      }
      else {
        console.error("Método não suportado de editar senha")
        setError("Método não suportado de editar senha")
      }
      setVisible(true);
    }
    fetchData();
  }, []);

  async function handleRegister() {
    let my_error = ''
    if (!senha_atual || !nova_senha || !confirmar_senha || !confirmar_senha_atual) {
      my_error += '\n' + 'Por favor, preencha todos os campos';
    }

    if (nova_senha !== confirmar_senha) {
      my_error += '\n' + 'As senhas não coincidem';
    }

    if (confirmar_senha_atual !== senha_atual) {
      my_error += '\n' + 'Senha incorreta';
    }

    if (my_error !== '') {
      console.log(my_error)
      setError(my_error)
      return;
    }

    try {
      await updateDoc(doc(database, "users", id), {
        password: nova_senha
      });

      if (!!params.update) {
        router.back()
      }
      else {
        console.error("Método não suportado de editar senha")
      setError("Método não suportado de editar senha")
      }

      setVisible(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('Erro ao atualizar senha: ' + e.message);
      } else {
        alert('Erro desconhecido ao adicionar usuário');
      }
    }
  }

  return (
    <View style={styles.container}>
      <View>
        <SectionTitle title="Alterar senha" style={{ marginBottom: 32 }} />
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={24} color="black" />
            <TextInput
              style={styles.input}
              placeholder="Senha atual"
              placeholderTextColor="#aaa"
              value={confirmar_senha_atual}
              onChangeText={SetConfirmarSenhaAtual}
              secureTextEntry={true}
              editable={editable}
            />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={24} color="black" />
            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              placeholderTextColor="#aaa"
              value={nova_senha}
              onChangeText={SetSenha}
              secureTextEntry={true}
              editable={editable}
            />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={24} color="black" />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              placeholderTextColor="#aaa"
              value={confirmar_senha}
              onChangeText={SetConfirmarSenha}
              secureTextEntry={true}
              editable={editable}
            />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      <NextButton
        onPress={handleRegister}
        text={!params.update ? "N/A" : "Atualizar"}
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
