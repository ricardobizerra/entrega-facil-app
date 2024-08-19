import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Image, ScrollView } from 'react-native';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
import { faHeadset } from '@fortawesome/free-solid-svg-icons/faHeadset';
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload';

import Logo from '@/assets/images/logo/LogoLogin.svg';


export default function Perfil() {
  const default_pic = 'https://firebasestorage.googleapis.com/v0/b/entrega-facil-cbb50.appspot.com/o/images%2Fdefault_pic?alt=media&token=11b19c9c-2818-4c6b-8784-12e295b53ec0'
  const [profile_pic_url, setPic] = useState(default_pic)
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')

  useFocusEffect(() => {
    async function fetchData() { 
      let id = String(await AsyncStorage.getItem('userId'))
      setId(id)
      setEmail(String(await AsyncStorage.getItem('userEmail')))
      setName(String(await AsyncStorage.getItem('userName')))
      setPhone(String(await AsyncStorage.getItem('phone')))
      setCpf(String(await AsyncStorage.getItem('userCpf')))
      let pic = await AsyncStorage.getItem('userPic')
      if (!!pic) {
        setPic(String(pic))
      }
      else {
        setPic(default_pic)
      }
    }
    fetchData();
  });

  async function handleUpdate() {
    router.push({
      pathname: '/register/update',
      params:  {phone: phone}
    });
  }

  async function handleLogout() {
    try {
      await AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('Erro ao deslogar usuário: ' + e.message);
      } else {
        alert('Erro desconhecido ao deslogar usuário');
      }
    }
    router.dismissAll()
  }

  async function handleSuporte() {
    router.push({
      pathname: '/suporte/suportPage',
      params:  {}
    });
  }


  function PerfilData() {
    return (
      <View style={{paddingTop: 20}}>
        <View style={{display:'flex', flexDirection:'row', gap: 20}}>
          <Image style={styles.circle} resizeMode='cover' src={profile_pic_url} />
          <View style={{paddingTop: 15}}>
            <View>
              <Text style={styles.entry}>Nome</Text>
              <Text style={styles.title}>{name}</Text>
            </View>
            <View style={{paddingTop: 7}}>
              <Text style={styles.entry}>Email</Text>
              <Text style={styles.subtitle}>{email}</Text>
            </View>
          </View>
        </View>
        <View style={{display:'flex', flexDirection:'row', gap: 30, paddingTop: 15, paddingBottom: 10}}>
          <View>
            <Text style={styles.entry}>CPF</Text>
            <Text style={styles.subtitle}>{cpf}</Text>
          </View>
          <View>
            <Text style={styles.entry}>Telefone</Text>
            <Text style={styles.subtitle}>{phone}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pagetitle}>Seu Perfil</Text>
      <PerfilData/>
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <FontAwesomeIcon icon={faUpload} size={20}/>
        <Text style={styles.buttonText}>Atualizar dados</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSuporte}>
        <FontAwesomeIcon icon={faHeadset} size={20}/>
        <Text style={styles.buttonText}>Suporte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <FontAwesomeIcon icon={faRightFromBracket} size={20}/>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderRadius: 75
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 210, 
    height: 270, 
    marginBottom: 30, 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    wordWrap: 'breakWord',
    width: 160,
  },
  pagetitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
  },
  entry: {
    color: '#888'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'regular',
    color: '#000',
    wordWrap: 'breakWord',
    width: 140,
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
    backgroundColor: '#E3E3E3',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderWidth: 0,
    borderRadius: 100,
    marginVertical: 10,
    width: '90%',
    display: 'flex',
    flexDirection: 'row',
    gap: 10
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
