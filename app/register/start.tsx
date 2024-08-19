import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RegisterStartSvg from '@/assets/images/register/RegisterStart.svg';
import { useRouter } from "expo-router";
import { NextButton } from "@/components/form/NextButton";

export default function RegisterStart() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <RegisterStartSvg />
      
      <View style={styles.description}>
        <Text style={styles.h1}>Venha para nosso time!</Text>
        <Text style={styles.h2}>Trabalhe no Tá Entregue e gere uma renda extra colaborando com as comunidades do Recife</Text>
      </View>

      <NextButton 
        onPress={() => router.push({
          pathname: '/register/profileSelection',
          params: {nao_cadastrado: 'nao_cadastrado'}
        })}
        text="Vamos lá!"
        style={styles.button}
      />

      <Text style={styles.loginText}>
        Já possui uma conta?{' '}
        <Text style={styles.loginLink} onPress={() => router.push('/')}>
          Faça login
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 32,
    paddingHorizontal: 32,
    paddingVertical: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  description: {
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },
  h2: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    color: '#3A3A3A',
  },
  button: {
    marginTop: 64,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loginText: {
    color: '#000',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFA500',
    fontWeight: 'bold',
    textDecorationColor: '#FFA500',
    textDecorationLine: 'underline',
  },
});