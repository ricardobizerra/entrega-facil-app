import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ArrowLeft from '@/assets/images/ArrowLeft.svg';
import DeliveryProfile from '@/assets/images/register/DeliveryProfile.svg';
import { useRouter, useLocalSearchParams } from "expo-router";

import { updateDoc, collection, query, where, getDocs, doc } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';

export default function ProfileSelection() {
  const router = useRouter();
  const [route, setRoute_] = useState('/register/signup');
  const [setted_route, setSetRoute] = useState(false)
  const params = useLocalSearchParams()

  if (params.cadastrado && !setted_route) {
    setRoute_('/register/onBoard')
    setSetRoute(true)
  }
  
  return (
    <>
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft />
        </TouchableOpacity>
        <Text style={styles.title}>
          Perfil de colaboração
        </Text>
      </View>

      <View style={styles.selectionContainer}>
        <TouchableOpacity style={styles.selection} onPress={() => {
          if (params.cadastrado) {
            // update user
            updateDoc(doc(database, "users", String(params?.id)), { kind: "entregador" })
          }
          params.kind = "entregador"

          router.push({
            pathname: route,
            params: params
          });
        }}>
          <Image source={require('@/assets/images/register/DeliveryPerson.png')} style={styles.selectionImage} />
          <View style={styles.selectionText}>
            <Text style={styles.selectionTitle}>
              Quero ser entregador
            </Text>
            <Text style={styles.selectionDescription}>
              Entregue encomendas para sua comunidade
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.selection} onPress={() => {
          if (params.cadastrado) {
            // update user
            updateDoc(doc(database, "users", String(params?.id)), { kind: "armazenador" })
          }
          params.kind = "armazenador"
          
          router.push({
            pathname: route,
            params: params
          });
        }}>
          <Image source={require('@/assets/images/register/HolderPerson.png')} style={styles.selectionImage} />
          <View style={styles.selectionText}>
            <Text style={styles.selectionTitle}>
              Quero ser armazenador
            </Text>
            <Text style={styles.selectionDescription}>
              Armazene encomendas de sua comunidade em um espaço de sua residência
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.selection} onPress={() => {
          if (params.cadastrado) {
            // update user
            updateDoc(doc(database, "users", String(params?.id)), { kind: "entregador,armazenador" })
          }
          params.kind = "entregador,armazenador"

          router.push({
            pathname: route,
            params: params
          });
        }}>
          <Image source={require('@/assets/images/register/DeliveryHolderPerson.png')} style={styles.selectionImage} />
          <View style={styles.selectionText}>
            <Text style={styles.selectionTitle}>
              Quero ser entregador e armazenador
            </Text>
            <Text style={styles.selectionDescription}>
              Atue nas duas modalidades do Tá Entregue
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 64,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },
  selectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 16,
  },
  selection: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 120,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
  },
  selectionImage: {
    width: '50%',
    height: '100%',
  },
  selectionText: {
    width: '50%',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  selectionDescription: {
    fontSize: 12,
    color: '#000',
  },
});