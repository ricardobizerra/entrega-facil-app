import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location'; // Importando o tipo LocationObject
import Wave from '@/assets/images/wave.svg';
import styled from 'styled-components/native';
import How_use from '@/assets/images/instructions.svg';
import Actions from '@/assets/images/feedback_e_dicas_2.svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity } from 'react-native'; // Importe TouchableOpacity

interface User {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  location?: string;
}

import MapView, { Marker } from 'react-native-maps';

const MapContainer = styled(MapView)`
  width: 100%;
  height: 300px;
  margin-top: 20px;
  border-radius: 25px;
  overflow: hidden;
`;

export default function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationObject | null>(null); // Tipagem ajustada

  const { name } = useLocalSearchParams();

  const [user] = useState<User | undefined>({
    name: name as string,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location); // Agora aceita o tipo LocationObject
    })();
  }, []);

  return (
    <HomeScreenContainer>
      {/* Cabeçalho */}
      <HeaderContainer>
        <Alltext>
          <HeaderText>
            Olá, <UserName>{user?.name?.split(' ')[0] || ''}</UserName>
          </HeaderText>
          <SubtitleText>Essa é sua homepage de entregador.</SubtitleText>
        </Alltext>
        <WaveContainer>
          <Wave />
        </WaveContainer>
      </HeaderContainer>

      <Container>
        {/* Seção de Localização */}
        <LocationSection>
          <LocationText>Você está aqui</LocationText>
          <LocationAddress>Parque Treze de Maio, Boa Vista, Recife</LocationAddress>
          <StyledTextInput placeholder="Buscar localidade" />
          <MapContainer
                  initialRegion={{
                    latitude: -8,
                    longitude: -30,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker
                    coordinate={{ latitude: -8, longitude: -30 }}
                  />
                </MapContainer>
        </LocationSection>

        {/* Seção de Ação */}
        <TouchableOpacity onPress={() => router.push('/how_use.tsx')}>
          <HowUseContainer>
            <How_use />
          </HowUseContainer>
        </TouchableOpacity>

        {/* Ações */}
        <ActionsSection>
          <ActionsText>Ações</ActionsText>
        </ActionsSection>
      </Container>
    </HomeScreenContainer>
  );
}

// Styled-components para estilização
const HomeScreenContainer = styled(View)`
  flex: 1;
  background-color: #3a3a3a;
`;

const HeaderContainer = styled(View)`
  width: 100%;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
`;

const HeaderText = styled(Text)`
  color: #f2f2f2;
  font-size: 36px;
  font-weight: 700;
`;

const SubtitleText = styled(Text)`
  font-size: 14px;
  color: #ccc;
  margin-bottom: 10px;
`;

const UserName = styled(Text)`
  color: #DB3319;
`;

const WaveContainer = styled(View)`
  align-items: flex-end;
  margin-top: 12;
`;

const Container = styled(View)`
  flex: 1;
  padding: 30px;
  background-color: #f5f5f5;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  margin-top: -7px;
`;

const LocationSection = styled(View)`
  margin-top: 10px;
`;

const LocationText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: #000;
`;

const LocationAddress = styled(Text)`
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 200px;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const StyledTextInput = styled(TextInput)`
  height: 40px;
  border-radius: 20px;
  padding-left: 15px;
  margin-bottom: 15px;
  background-color: #f0f0f0;
`;

const ActionsText = styled(Text)`
  font-size: 20px;
  color: black;
  margin-bottom: 20px;
  font-weight: bold;
`;

const ActionsSection = styled(View)`
  margin-top: 30px;
`;

const Alltext = styled(View)`
  margin: 17px;
  text-align: left;
  margin-left: 40;
  flex: 1;
`;

const HowUseContainer = styled(View)`
  width: 329px;
  height: 127px;
  border-radius: 20px;
  overflow: hidden; 
  align-items: center;
  justify-content: center;
`;
