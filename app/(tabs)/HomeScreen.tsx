import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Modal } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import Wave from '@/assets/images/wave.svg';
import styled from 'styled-components/native';
import { database } from '@/config/firebaseConfig';
import How_use from '@/assets/images/instructions.svg';
import Actions from '@/assets/images/feedback_e_dicas_2.svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs, query, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Illustration from '@/assets/images/notification_illustration.svg';
import Exit from '@/assets/images/x.svg';

interface User {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  location?: string;
}

const CenteredModalContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NotificationContainer = styled(View)`
  background-color: #ffffff;
  padding: 25px;
  margin-bottom: 20px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
`;

const ConfirmButton = styled(TouchableOpacity)`
  background-color: #DB3319;
  padding: 20px;
  border-radius: 50px;
  margin-top: 30px;
  width: 70%;
`;

const ConfirmButtonText = styled(Text)`
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
`;

const MapContainer = styled(MapView)`
  width: 100%;
  height: 300px;
  margin-top: 20px;
  border-radius: 25px;
  overflow: hidden;
`;

export interface PackageHistoryItem {
  id: string;
  status: string;
  client_id: string;
  creation_date: Timestamp;
  arrival_date: Timestamp;
  delivery_actions: { [key: string]: { action: string; timestamp: Timestamp; notification_action?: string; } };
  accepted?: boolean;
  code: string;
  icon: string;
  address: string;
  client_name: string;
  sensitive: boolean;
  weight: 'light' | 'medium';
  order_name: string;
  storage_code: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const { name } = useLocalSearchParams();
  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notificationSeen, setNotificationSeen] = useState(false);

  const [user] = useState<User | undefined>({
    name: name as string,
  });

  const fetchHistoryFromFirebase = async (clientId: string) => {
    try {
      const q = query(collection(database, 'products'), where('client_id', '==', clientId));
      const querySnapshot = await getDocs(q);
      const newEntries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        delivery_actions: doc.data().delivery_actions || {},
      })) as PackageHistoryItem[];

      // Check if there are any unaccepted packages
      const hasUnacceptedPackages = newEntries.some(item => item.accepted === false);
      setIsModalVisible(hasUnacceptedPackages); // Set modal visibility based on condition

      setPackageHistory(newEntries);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const getClientId = async () => {
    try {
      const clientId = await AsyncStorage.getItem('userEmail');
      if (clientId) {
        setClientId(clientId);
        fetchHistoryFromFirebase(clientId);
      } else {
        console.log('No client ID found');
      }
    } catch (error) {
      console.error('Error retrieving client ID: ', error);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    getClientId();
  }, []);

  type NewThingsModalProps = {
    isVisible: boolean;
  };
  

  const NewThingsModal: React.FC<NewThingsModalProps> = ({ isVisible }) => (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <CenteredModalContainer>
        <NotificationContainer style={{width: Dimensions.get('window').width * 0.8, height: Dimensions.get('window').height * 0.7}}>
        <TouchableOpacity 
          style={{ position: 'absolute', top: 60, right: 70 }} 
          onPress={() => setNotificationSeen(true)}
        >
          <Exit />
        </TouchableOpacity>
          <Illustration />
          <Text style={{ fontSize: 40, marginTop: 20, fontWeight: 900, textAlign: 'center' }}>Você tem novas{'\n'}solicitações de entrega</Text>
          <ConfirmButton onPress={() => router.push('/history')}>
            <ConfirmButtonText>Acessar pedidos</ConfirmButtonText>
          </ConfirmButton>
        </NotificationContainer>
      </CenteredModalContainer>
    </Modal>
  );

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

        <NewThingsModal isVisible={isModalVisible && !notificationSeen} />
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
  margin-top: 12px;
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
  margin-left: 40px;
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
