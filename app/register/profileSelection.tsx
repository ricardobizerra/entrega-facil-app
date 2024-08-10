import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ArrowLeft from '@/assets/images/ArrowLeft.svg';
import DeliveryProfile from '@/assets/images/register/DeliveryProfile.svg';
import { useRouter } from "expo-router";
import { useState } from "react";

type ProfileEnum = 'entregador' | 'armazenador' | 'entregador-armazenador';

export default function ProfileSelection() {
  const router = useRouter();

  const [selection, setSelection] = useState<ProfileEnum | undefined>(undefined);

  const handleSelection = (selection: ProfileEnum) => {
    setSelection(selection);
  }

  return (
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

        <TouchableOpacity
          style={[styles.selection, selection === 'entregador-armazenador' && styles.selectionActive]}
          onPress={() => handleSelection('entregador-armazenador')}
        >
          <Image source={require('@/assets/images/register/DeliveryHolderPerson.png')} style={styles.selectionImage} />
          <View style={styles.selectionText}>
            <Text style={styles.selectionTitle}>
              Quero ser{" "}
              <Text style={styles.selectionTitleBold}>
                entregador
              </Text>
              {" e "}
              <Text style={styles.selectionTitleBold}>
                armazenador
              </Text>
            </Text>
            <Text style={styles.selectionDescription}>
              Atue nas duas modalidades do Tá Entregue
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          onPress={() => {
            if (!selection) return;
            
            router.push({ 
              pathname: '/register/info',
              params: { kind: selection === 'entregador-armazenador' ? ['entregador', 'armazenador'] : [selection] }
            });
          }}
          style={[styles.nextButton, !selection && styles.nextButtonDisabled]}
          disabled={!selection}
        >
          <Text style={styles.nextButtonText}>
            {!selection ? 'Selecione um perfil' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
});