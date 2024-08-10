import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/Logo.svg';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '@/utils/upload-image-firebase';

export default function RegisterScreen() {
  const params = useLocalSearchParams()
  const email: string = String(params.email)
  const [veiculo, setVeiculo] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [fotoCnh, setCnh] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  async function handleRegister() {
    if (!veiculo || !modelo || (veiculo.toLowerCase() !== 'bicicleta' && !placa) || (veiculo.toLowerCase() !== 'bicicleta' && !fotoCnh)) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!fotoCnh) {
      setError('Por favor, adicione uma foto da CNH');
      return;
    }

    let cnhUrl: string | undefined = undefined;

    try {
      cnhUrl = await uploadImageAsync(fotoCnh);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('Erro ao armazenar foto da CNH: ' + e.message);
      } else {
        alert('Erro desconhecido ao adicionar usuário');
      }
    }

    if (!cnhUrl) {
      return;
    }

    try {
      await updateDoc(doc(database, "users", String(params.id)), {
        entregador: {
          veiculo,
          modelo,
          placa,
          cnhUrl,
        }
      });

      // Fetch the newly created user data
      const usersRef = collection(database, 'users');
      const newUserQuery = query(usersRef, where('email', '==', email));
      const newUserSnapshot = await getDocs(newUserQuery);
      await AsyncStorage.setItem('userEmail', email);

      if (newUserSnapshot.empty) {
        router.back()
      }
      
      const newUser = newUserSnapshot.docs[0].data();
      newUser._screen = 2
      newUser.id = newUserSnapshot.docs[0].id
      router.push({
        pathname: '/register/onBoard',
        params: newUser,
      });

      setVisible(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('Erro ao adicionar usuário: ' + e.message);
      } else {
        alert('Erro desconhecido ao adicionar usuário');
      }
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCnh(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Informações de entrega</Text>
      <Text style={styles.subsubtitle}>Informações do entregador</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="bicycle" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Tipo de veículo"
          placeholderTextColor="#aaa"
          value={veiculo}
          onChangeText={setVeiculo}
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome name="modx" size={13} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Modelo do veículo"
          placeholderTextColor="#aaa"
          value={modelo}
          onChangeText={setModelo}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Placa do veículo"
          placeholderTextColor="#aaa"
          value={placa}
          onChangeText={setPlaca}
        />
      </View>
      <TouchableOpacity style={styles.inputContainer} onPress={pickImage}>
        <TextInput
          style={styles.input}
          placeholder="Foto da CNH"
          placeholderTextColor="#aaa"
          value={fotoCnh}
          editable={false}
        />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Avançar</Text>
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
