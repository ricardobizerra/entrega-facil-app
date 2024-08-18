import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/Logo.svg';
import { uploadImageAsync } from '@/utils/upload-image-firebase';
import { ImageInput } from '@/components/form/image/BaseImageInput';
import { SectionTitle } from '@/components/SectionTitle';
import { NextButton } from '@/components/form/NextButton';

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const kind = params.kind
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [comunidade, setComunidade] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [fotoCnh, setCnh] = useState<string | undefined>(undefined);
  const [cnhUrl, setCnhUrl] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(false);
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
          const newUserSnapshot = await getDocs(newUserQuery);
          const newUser = newUserSnapshot.docs[0].data();
          setComunidade(newUser.endereço.comunidade)
          setVeiculo(newUser.entregador.veiculo)
          setModelo(newUser.entregador.modelo)
          setPlaca(newUser.entregador.placa)
          setCnhUrl(newUser.entregador.cnhUrl)
        }
        setVisible(true)
      }
      fetchData();
    }, []);

  const router = useRouter();

  async function handleRegister() {
    if (!comunidade ||  !veiculo || !modelo || (veiculo.toLowerCase() !== 'bicicleta' && !placa)) {
      setError('Por favor, preencha todos os campos\nVeículos que não são bicicleta requerem placa e foto da cnh');
      return;
    }

    if (!params.update) {
      if (veiculo.toLowerCase() !== 'bicicleta' && !fotoCnh) {
        setError('Por favor, adicione uma foto da CNH\nVeículos que não são bicicleta requerem foto da cnh');
        return;
      }
      else if (!!fotoCnh) {
        try {
          setCnhUrl(await uploadImageAsync(fotoCnh));
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
      }
    }

    try {
      if (!!cnhUrl) {
        await updateDoc(doc(database, "users", id), {
          entregador: {
            comunidade,
            veiculo,
            modelo,
            placa,
            cnhUrl,
          }
        });
      }
      else {
        await updateDoc(doc(database, "users", id), {
          entregador: {
            comunidade,
            veiculo,
            modelo,
            placa,
          }
        });
      }

      if (!params.update) {
        router.push({
          pathname: '/register/setDadosBancarios',
          params: {  kind: kind, _screen: 2 },
        });
      }
      else {
        router.back()
      }
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
        <SectionTitle title="Dados do entregador" style={{ marginBottom: 32 }} />
        <View style={styles.inputContainer}>
        <FontAwesome name="users" size={24} color="black" />
        {visible && <TextInput
          style={styles.input}
          placeholder="Comunidade de Atuação"
          placeholderTextColor="#aaa"
          value={comunidade}
          onChangeText={setComunidade}
        />}
      </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="bicycle" size={24} color="black" />
          {visible && <TextInput
            style={styles.input}
            placeholder="Tipo de veículo"
            placeholderTextColor="#aaa"
            value={veiculo}
            onChangeText={setVeiculo}
          />}
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="modx" size={13} color="black" />
          {visible && <TextInput
            style={styles.input}
            placeholder="Modelo do veículo"
            placeholderTextColor="#aaa"
            value={modelo}
            onChangeText={setModelo}
          />}
        </View>
        <View style={styles.inputContainer}>
          {visible && <TextInput
            style={styles.input}
            placeholder="Placa do veículo"
            placeholderTextColor="#aaa"
            value={placa}
            onChangeText={setPlaca}
          />}
        </View>
        {!params.update && <ImageInput
          value={fotoCnh}
          onChange={setCnh}
          placeholder="Foto da CNH"
          modalTitle="Envie uma foto da frente de sua CNH"
          modalDescription="Nossa equipe verificará sua habilitação para validar seu cadastro em nosso time de colaboradores"
        />}
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
