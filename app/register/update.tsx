import React, { useState, useEffect  } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { addDoc, collection, query, where, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/assets/images/Logo.svg';
import { setCpf2 } from './set_field'

import { ImageInputModal } from '../../components/form/image/ImageInputModal';
import { uploadImageAsync } from '@/utils/upload-image-firebase';

export default function RegisterScreen() {
  const [edit_file_url, _]= useState('https://firebasestorage.googleapis.com/v0/b/entrega-facil-cbb50.appspot.com/o/images%2Fdefault_pic?alt=media&token=362df6a1-25e8-4abb-9f5b-34759ce6f43d')
  const default_pic = 'https://firebasestorage.googleapis.com/v0/b/entrega-facil-cbb50.appspot.com/o/images%2Fdefault_pic?alt=media&token=11b19c9c-2818-4c6b-8784-12e295b53ec0'
  const [profile_pic_url, setPic] = useState(default_pic)
  const params = useLocalSearchParams()
  const [phone, setPhone] = useState('');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [kind, setKind] = useState('')
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [show_pic_editor, showPicEditor] = useState(false);
  const [pic_uri, setPicUri] = useState<string | undefined>(undefined);

  async function setPicUri2(value) {
    setPicUri(value)
    if (!value) {
      setPic(default_pic)
      return
    }

    let picUrl: string | undefined = undefined;

    try {
     picUrl = await uploadImageAsync(value!);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('Erro ao armazenar foto do RG: ' + e.message);
      } else {
        alert('Erro desconhecido ao adicionar usuário');
      }
    }
    setPic(picUrl!)
  }

  useEffect(() => {
    async function fetchData() { 
      setPhone(String(await AsyncStorage.getItem('phone')))
      setId(String(await AsyncStorage.getItem('userId')))
      setEmail(String(await AsyncStorage.getItem('userEmail')))
      setKind(String(await AsyncStorage.getItem('kind')))
      let pic = await AsyncStorage.getItem('userPic')
      if (!!pic) {
        setPic(String(pic))
      }
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
      if (profile_pic_url != default_pic) {
        await updateDoc(doc(database, "users", id), {
          phone: phone,
          pic: profile_pic_url
        });
      }
      else {
        await updateDoc(doc(database, "users", id), {
          phone: phone,
          pic: deleteField()
        });
      }

      // Fetch the newly created user data
      const usersRef = collection(database, 'users');
      const newUserQuery = query(usersRef, where('email', '==', email));
      const newUserSnapshot = (await getDocs(newUserQuery)).docs;
      await AsyncStorage.setItem('userEmail', newUserSnapshot[0].data().email);
      await AsyncStorage.setItem('phone', newUserSnapshot[0].data().phone);
      if (!!newUserSnapshot[0].data().pic) {
        await AsyncStorage.setItem('userPic', newUserSnapshot[0].data().pic);
      }
      else {
        await AsyncStorage.removeItem('userPic')
      }

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
      <Image style={styles.circle} resizeMode='cover' src={profile_pic_url} />
      <>
      <TouchableOpacity onPressIn={() => showPicEditor(true)}>
        <Image style={styles.circle2} resizeMode='cover' src={edit_file_url} />
      </TouchableOpacity>
      <ImageInputModal
        visible={show_pic_editor}
        setVisible={showPicEditor}
        onChange={(s) => setPicUri2(s)}
        title={"Envie sua nova foto de perfil"}
        description={""}
        />
      </>
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
      
      {(kind == 'entregador' || kind == 'entregador,armazenador') && <TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: "register/setDadosEntregador",
          params: { update: 'true' }
        })
      }}>
        <Text style={styles.buttonText2}>Informações de entregador</Text>
      </TouchableOpacity>}
      {(kind == 'armazenador' || kind == 'entregador,armazenador') && <TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: "register/setLocalArmazem",
          params: { update: 'true' }
        })
      }}>
        <Text style={styles.buttonText2}>Informações de armazém</Text>
      </TouchableOpacity>}
      <TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: "register/setDadosBancarios",
          params: {update: 'true'}
        })
      }}>
        <Text style={styles.buttonText2}>Informações de pagamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button2} onPress={() => {
        router.push({
          pathname: '/register/alterarSenha',
          params: {update: 'update'}
        })
      }}>
        <Text style={styles.buttonText2}>Alterar senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 110,
    height: 110,
    borderWidth: 2,
    borderRadius: 75,
    marginBottom: 30,
  },
  circle2: {
    width: 30,
    height: 30,
    borderEndWidth: 10,
    borderRadius: 75,
    marginBottom: -10,
    bottom: 50,
    left: 40,
    backgroundColor: '#FFA500',
    borderColor: '#FFA500',
  },
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
    width: '87%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  button2: {
    backgroundColor: '#E3E3E3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 0,
    borderRadius: 100,
    marginVertical: 10,
    width: '82%',
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
