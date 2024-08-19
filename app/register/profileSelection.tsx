import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ArrowLeft from '@/assets/images/ArrowLeft.svg';
import DeliveryProfile from '@/assets/images/register/DeliveryProfile.svg';
import { useRouter, useLocalSearchParams } from "expo-router";

import { updateDoc, collection, query, where, getDocs, doc } from 'firebase/firestore';
import { database } from '@/config/firebaseConfig';
import { SectionTitle } from '@/components/SectionTitle';
import { NextButton } from '@/components/form/NextButton';

type ProfileEnum = 'entregador' | 'armazenador';

export default function ProfileSelection() {
  const router = useRouter();
  const [route, setRoute_] = useState('/register/signup');
  const [setted_route, setSetRoute] = useState(false)
  const params = useLocalSearchParams()

  if (params.cadastrado && !setted_route) {
    setRoute_('/register/onBoard')
    setSetRoute(true)
  }
  
  const [selection, setSelection] = useState<ProfileEnum | undefined>(undefined);

  const handleSelection = (selection: ProfileEnum) => {
    setSelection(selection);
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleAndSelectionContainer}>
        <SectionTitle title="Perfil de colaboração" />

        <View style={styles.selectionContainer}>
          <TouchableOpacity
            style={[styles.selection, selection === 'entregador' && styles.selectionActive]}
            onPress={() => handleSelection('entregador')}
          >
            <Image source={require('@/assets/images/register/DeliveryPerson.png')} style={styles.selectionImage} />
            <View style={styles.selectionText}>
              <Text style={styles.selectionTitle}>
                Quero ser{" "}
                <Text style={styles.selectionTitleBold}>
                  entregador
                </Text>
              </Text>
              <Text style={styles.selectionDescription}>
                Entregue encomendas para sua comunidade
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selection, selection === 'armazenador' && styles.selectionActive]}
            onPress={() => handleSelection('armazenador')}
          >
            <Image source={require('@/assets/images/register/HolderPerson.png')} style={styles.selectionImage} />
            <View style={styles.selectionText}>
              <Text style={styles.selectionTitle}>
                Quero ser{" "}
                <Text style={styles.selectionTitleBold}>
                  armazenador
                </Text>
              </Text>
              <Text style={styles.selectionDescription}>
                Armazene encomendas de sua comunidade em um espaço de sua residência
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <NextButton
          onPress={() => {
            if (!selection) return;
            if (params.cadastrado) {
              // update user
              updateDoc(doc(database, "users", String(params?.id)), { kind: selection })
            }
            params.kind = selection
              router.push({
                pathname: route,
                params: params
              });
            }}
          disabled={!selection}
          text={!selection ? 'Selecione um perfil' : 'Próximo'}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 64,
    justifyContent: 'space-between',    
    backgroundColor: '#f5f5f5',
  },
  selectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 16,
    marginVertical: 16,
  },
  selection: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f2f2f2',
    height: 120,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectionActive: {
    borderColor: '#ffa500',
  },
  selectionImage: {
    width: '40%',
    height: '100%',
  },
  selectionText: {
    width: '56%',
    justifyContent: 'center',
    marginVertical: '2%',
  },
  selectionTitle: {
    fontSize: 16,
    color: '#000',
  },
  selectionTitleBold: {
    fontWeight: 'bold',
  },
  selectionDescription: {
    fontSize: 12,
    color: '#000',
  },
  nextButton: {
    backgroundColor: '#ffa500',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    width: 'auto',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  titleAndSelectionContainer: {
    flex: 1,
    gap: 32,
  },
});