import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Modal, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import Wave from '@/assets/images/Onda.svg';
import styled from 'styled-components/native';
import { database } from '@/config/firebaseConfig';
import How_use from '@/assets/images/instructions.svg';
import How2_use from '@/assets/images/How2_use.svg';
import Actions from '@/assets/images/feedback_e_dicas_2.svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs, query, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Illustration from '@/assets/images/notification_illustration.svg';
import Exit from '@/assets/images/x.svg';
import ATT from '@/assets/images/atualizações.svg'
import Notification from '@/assets/images/noticias.svg'
import Back from '@/assets/images/back_button.svg'
import Ilustration from '@/assets/images/ilustraçoes.svg'
import Use_background from '@/assets/images/Use_background.svg'
import Use2_background from '@/assets/images/Use2_background.svg'
import Frase_1 from '@/assets/images/frase1.svg'
import Frase_2 from '@/assets/images/frase2.svg'
import Frase_3 from '@/assets/images/frase3.svg'
import Frase_4 from '@/assets/images/frase4.svg'
import Frase_5 from '@/assets/images/frase5.svg'
import Frase_6 from '@/assets/images/frase6.svg'
import Frase_7 from '@/assets/images/frase7.svg'
import WaveStorage from '@/assets/images/wave-storage.svg';

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
;`

const NotificationContainer = styled(View)`
  background-color: #ffffff;
  padding: 25px;
  margin-bottom: 100px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
;`

const ConfirmButton = styled(TouchableOpacity)`
  background-color: #DB3319;
  padding: 20px;
  border-radius: 50px;
  margin-top: 30px;
  width: 70%;
;`

const ConfirmButtonText = styled(Text)`
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
;`

const MapContainer = styled(MapView)`
  width: 100%;
  height: 200px;
  margin-top: 20px;
  overflow: hidden;
  background-color: #fff;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 5;
;`


interface NewThingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}



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
  const [address, setAddress] = useState<string>('Carregando localização...');
  const [clientId, setClientId] = useState<string | null>(null);
  const { name } = useLocalSearchParams();
  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notificationSeen, setNotificationSeen] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isHowUseVisible, setIsHowUseVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userKind, setUserKind] = useState<string | null>(null);

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
      const userKind = await AsyncStorage.getItem('kind');
      if (clientId) {
        setClientId(clientId);
        setUserKind(userKind);
        fetchHistoryFromFirebase(clientId);
      } else {
        console.log('No client ID found');
      }
    } catch (error) {
      console.error('Error retrieving client ID: ', error);
    }
  };

  const searchAddress = async () => {
    if (searchText) {
      try {
        const geocode = await Location.geocodeAsync(searchText);
        if (geocode.length > 0) {
          const { latitude, longitude } = geocode[0];
          setLocation({
            coords: {
              latitude,
              longitude,
              altitude: 0, // You might need to get actual values or set defaults
              accuracy: 0, // Same here
              altitudeAccuracy: 0,
              heading: 0,
              speed: 0,
            },
            timestamp: Date.now(),
            mocked: false,
          });
          setAddress(searchText);
        } else {
          console.log('Endereço não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar endereço: ', error);
      }
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
      if (location) {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const currentAddress = geocode[0];
        setAddress(
          `${currentAddress.street}, ${currentAddress.streetNumber}, ${currentAddress.district}`
        );
      }
    })();
  }, []);

  useEffect(() => {
    getClientId();
  }, []);

  const slides = userKind === 'armazenador' ? [
    { background: <Use2_background />, frase: <Frase_5 /> },
    { background: <Use2_background />, frase: <Frase_6 /> },
    { background: <Use2_background />, frase: <Frase_7 /> },
  ] : [
    { background: <Use_background />, frase: <Frase_1 /> },
    { background: <Use_background />, frase: <Frase_2 /> },
    { background: <Use_background />, frase: <Frase_3 /> },
    { background: <Use_background />, frase: <Frase_4 /> },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <ScrollView>
      <HomeScreenContainer>
        {/* Cabeçalho */}
        <HeaderContainer>
        <Alltext>
          {userKind === 'armazenador' ? (
            <>
              <HeaderText>
                Olá, <UserName style={{ color: '#16488D' }}>{user?.name?.split(' ')[0] || ''}</UserName>
              </HeaderText>
              <SubtitleText>Essa é Sua Homepage de Armazenador</SubtitleText>
            </>
          ) : userKind === 'entregador' ? (
            <>
              <HeaderText>
                Olá, <UserName>{user?.name?.split(' ')[0] || ''}</UserName>
              </HeaderText>
              <SubtitleText>Essa é Sua Homepage de Entregador</SubtitleText>
            </>
          ) : null}
        </Alltext>
          <WaveContainer>
            {userKind === 'armazenador' ? <WaveStorage /> : <Wave />}
          </WaveContainer>
        </HeaderContainer>

        <Container>
          {/* Seção de Localização */}
          <LocationSection>
            <LocationText>Você está aqui</LocationText>
            <LocationAddress>{address}</LocationAddress>
            <StyledTextInput
              placeholder="Buscar localidade"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              onSubmitEditing={searchAddress}
            />
            {location && (
              <MapContainer
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                />
              </MapContainer>
            )}
          </LocationSection>

          {/* Seção de Ação */}
          <TouchableOpacity 
              onPress={() => setIsHowUseVisible(true)}
              activeOpacity={1}>
              <HowUseContainer>
              {userKind === 'armazenador' ? <How2_use /> : <How_use />}
              </HowUseContainer>
          </TouchableOpacity>

          <ActionsText>Notícias e atualizações</ActionsText>
          {/* Ações */}
          <ActionsSection>
            <Notification />
            <Ilustration />
            {/* Adicione mais imagens conforme necessário */}
          </ActionsSection>
        </Container>
      </HomeScreenContainer>
      <Modal
        visible={isHowUseVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHowUseVisible(false)}
      >
        <ModalContainer>
          <ModalContent>
            <CloseButton onPress={() => setIsHowUseVisible(false)}>
              <Back />
            </CloseButton>

            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Como usar o Tá Entregue</Text>
            {slides[currentSlide].background}
            {slides[currentSlide].frase}

            <ButtonContainer>
              <NavigationButton userKind={userKind} onPress={handlePrevious} disabled={currentSlide === 0}>
                <NavigationButtonText>Anterior</NavigationButtonText>
              </NavigationButton>
              <NavigationButton userKind={userKind} onPress={handleNext} disabled={currentSlide === slides.length - 1}>
                <NavigationButtonText>Próximo</NavigationButtonText>
              </NavigationButton>
            </ButtonContainer>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </ScrollView>
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
  margin-bottom: -15px;
`;

const HeaderText = styled(Text)`
  color: #f2f2f2;
  font-size: 28px;
  font-weight: 700;
  margin-top: 15px;
`;

const SubtitleText = styled(Text)`
  font-size: 10px;
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
  color: #3a3a3a;
  margin-bottom: 10px;
`;

const StyledTextInput = styled(TextInput)`
  height: 40px;
  border-radius: 20px;
  padding-left: 15px;
  margin-bottom: 15px;
  background-color: #f0f0f0;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 5;
`;

const ActionsText = styled(Text)`
  font-size: 20px;
  color: black;
  margin-top: 20px;
  font-weight: bold;
`;

const ActionsSection = styled(ScrollView).attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 10,
  },
})
 ` margin-top: 30px;
  flex-direction: row;
`;

const Alltext = styled(View)`
  margin: 17px;
  text-align: left;
  margin-left: 40px;
  flex: 1;
;`

const HowUseContainer = styled(View)`
  width: 329px;
  height: 127px;
  border-radius: 20px;
  overflow: hidden; 
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  background-color: #f5f5f5;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 5;
;`

const ModalContainer = styled(View)`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled(View)`
  width: 100%;
  background-color: #ffffff;
  padding: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  align-items: center;
  margin-top: 10px;
`;

const CloseButton = styled(TouchableOpacity)`
  align-self: flex-start;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const ButtonContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%;
`;

const NavigationButton = styled(TouchableOpacity)<{ userKind: string | null }>`
  background-color: ${({ userKind }) => (userKind === 'armazenador' ? '#16488D' : '#DB3319')};
  padding: 15px;
  border-radius: 50px;
  width: 25%;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const NavigationButtonText = styled(Text)`
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
`;