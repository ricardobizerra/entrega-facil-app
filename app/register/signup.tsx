import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image, ScrollView } from 'react-native';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/Logo.svg';
import { setCpf2, setPhone2 } from './set_field'
import { ImageInput } from '@/components/form/image/BaseImageInput';
import { uploadImageAsync } from '@/utils/upload-image-firebase';

export default function RegisterScreen() {
  const params = useLocalSearchParams()
  const kind = params.kind
  const [name, setName] = useState('');
  const cpf_default = ''
  const [cpf, setCpf] = useState(cpf_default);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [load, setLoading] = useState('');
  const [fotoRgFrente, setRgFrente] = useState<string | undefined>(undefined);
  const [fotoRgVerso, setRgVerso] = useState<string | undefined>(undefined);
  const numerical = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']


  const router = useRouter();
  if (!kind) {
    router.replace('register/profileSelection')
  }

  async function handleRegister() {
    if (!!load) {
      return
    }

    let my_error = ''
    if (!kind) {
      router.replace('register/profileSelection')
    }

    if (!name || !email || !password || !confirmPassword || !phone || !cpf || cpf===cpf_default || cpf.length < 14) {
      my_error += '\n' + 'Por favor, preencha todos os campos';
    }

    if (password !== confirmPassword) {
      my_error += '\n' + 'As senhas não coincidem';
    }

    const allowedDomains = ['gmail.com', 'hotmail.com'];
    const emailDomain = email.split('@')[1];

    if (!!email && !allowedDomains.includes(emailDomain)) {
      my_error +=  '\n' + 'O email deve ser do domínio gmail.com\nou hotmail.com';
    }

    if (!fotoRgFrente || !fotoRgVerso) {
      my_error +=  '\n' + 'Por favor, adicione as fotos do seu RG';
    }
  
    if (my_error !== '') {
      console.log(my_error)
      setError(my_error)
      return;
    }

    // Verificar se os dados já está em uso
    {
      const usersRef = collection(database, 'users');
      const q = query(usersRef, where('cpf', '==', cpf));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Este cpf já está sendo usado por outro usuário');
        return;
      }
    }

    const usersRef = collection(database, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setError('Este email já está sendo usado por outro usuário');
      return;
    }

    let rgUrlFrente: string | undefined = undefined;
    let rgUrlVerso: string | undefined = undefined;

    try {
      rgUrlFrente = await uploadImageAsync(fotoRgFrente!);
      rgUrlVerso = await uploadImageAsync(fotoRgVerso!);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('Erro ao armazenar foto do RG: ' + e.message);
      } else {
        alert('Erro desconhecido ao adicionar usuário');
      }
    }

    try {
      setLoading('Aguarde enquanto processamos as informações')
      await addDoc(usersRef, {
        name,
        cpf,
        phone,
        email,
        password,
        kind,
        rgUrlFrente,
        rgUrlVerso
      });

      // Fetch the newly created user data
      const newUserQuery = query(usersRef, where('email', '==', email));
      const newUserSnapshot = await getDocs(newUserQuery);
      await AsyncStorage.setItem('userEmail', email);

      if (!newUserSnapshot.empty) {
        const newUser = newUserSnapshot.docs[0].data();
        const id = newUserSnapshot.docs[0].id;
        newUser.id = id
        await AsyncStorage.setItem('phone', newUser.phone);
        await AsyncStorage.setItem('userId', newUser.id);
        await AsyncStorage.setItem('kind', newUser.kind);
        await AsyncStorage.setItem('userName', newUser.name);
        if (!!newUser.pic) {
          await AsyncStorage.setItem('userPic', newUser.pic);
        }
        router.push({
          pathname: '/register/onBoard',
          params: newUser,
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
    setLoading('')
  }

  return (
    <ScrollView>
    <View style={styles.container}>
      <Logo/>
      <Text style={styles.subtitle}>Cadastro</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputContainer} onTouchStart={() => {
        if (cpf === '000.000.000-00') {
          setCpf('')
        }
      }}>
        <FontAwesome name="info" size={14} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Cpf"
          placeholderTextColor="#aaa"
          value={cpf}
          onChangeText={(s) => setCpf2(s, setCpf)}
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome name="phone" size={13} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={(s) => setPhone2(s, setPhone)}
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
          secureTextEntry={true}
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        />
      </View>
      <ImageInput
        value={fotoRgFrente}
        onChange={setRgFrente}
        placeholder="Foto do RG (frente)"
        modalTitle="Envie uma foto da frente do seu RG/CIN"
        modalDescription="Nossa equipe verificará sua identidade para validar seu cadastro em nosso time de colaboradores"
      />
      <ImageInput
        value={fotoRgVerso}
        onChange={setRgVerso}
        placeholder="Foto do RG (verso)"
        modalTitle="Envie uma foto do verso do seu RG/CIN"
        modalDescription="Nossa equipe verificará sua identidade para validar seu cadastro em nosso time de colaboradores"
      />
      {!load && error ? <Text style={styles.errorText}>{error}</Text> : null}
      {load ? <Text style={styles.loadText}>{load}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      <Text style={styles.loginText}>
        Já possui uma conta?{' '}
        <Text style={styles.loginLink} onPress={() => router.push('/')}>
          Faça login
        </Text>
      </Text>
      </View>
    </ScrollView>
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
  loadText: {
    color: 'green',
    marginBottom: 10,
  },
});
