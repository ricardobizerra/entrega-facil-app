import React, { useState, useEffect } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';
import Back from '@/assets/images/chevron-left.svg';
import MapView, { Marker } from 'react-native-maps';

const MapContainer = styled(MapView)`
  width: 100%;
  height: 300px;
  margin-top: 20px;
  border-radius: 25px;
  overflow: hidden;
`;

const HorizontalContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const LabelText = styled(Text)`
  font-weight: bold;
  margin-right: 10px;
`;

const ValueText = styled(Text)`
  flex: 1;
`;


const OrderDetailContainer = styled(View)`
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 10px;
  background-color: #ffffff;
`;

const BackButtonContainer = styled(View)`
  padding: 10px;
  align-items: flex-start;
`;

const ActionContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'processing':
      return '#FF5733';
    case 'sent':
      return '#F5A623';
    case 'received':
      return '#4CAF50';
    default:
      return '#000000';
  }
};

const StyledImage = styled(Image).attrs({
  resizeMode: 'cover', // This ensures the image won't stretch and keeps its aspect ratio
  width: Dimensions.get('window').width * 0.9
})`
  height: 200px;
  border-radius: 12px;
  margin-right: 10px;
`;

const OrderDetailIcon = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: left;
  margin-left: 10px;
  margin-top: 10px;
`;

const LogoImage = styled(Logo)`
  width: 40px;
  height: 40px;
  margin-right: 10px;
`;

const OrderDetailItem = styled(View)`
  padding: 21px;
  flex-direction: row; /* Ensure items are aligned horizontally */
  align-items: center; /* Center items vertically */
`;

const ActionDot = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
`;

const ActionTextContainer = styled(View)`
  margin-left: 10px; /* Adjust as needed */
`;

const OrderTitleText = styled(Text)`
  color: #3a3a3a;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  margin-right: 80px;
`;

const OrderDetailText = styled(Text)`
  color: #333333;
  font-size: 14px;
  margin-right: 50px;
`;

interface PackageOrderDetailItem {
  id: string;
  status: string;
  client_id: string;
  creation_date: Timestamp;
  arrival_date: Timestamp;
  delivery_actions: { [key: string]: { action: string; timestamp: Timestamp } };
  address: string;
  icon: string;
  order_name: string;
  weight: 'light' | 'medium';
  sensitive: boolean;
  client_name: string;
  location: { latitude: number; longitude: number };
}

interface OrderDetailProps {
  client_id: string | null;
  product_id: string;
  closeModal: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ client_id, product_id, closeModal }) => {
  const [packageOrderDetail, setPackageOrderDetail] = useState<PackageOrderDetailItem[]>([]);

  const fetchOrderDetailFromFirebase = async () => {
    try {
      const q = query(
        collection(database, 'products'),
        where('client_id', '==', client_id)
      );
      const querySnapshot = await getDocs(q);
      const newEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        delivery_actions: doc.data().delivery_actions || {} // Default to empty object if delivery_actions doesn't exist
      })) as PackageOrderDetailItem[];
      setPackageOrderDetail(newEntries.filter(entry => entry.id === product_id));
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  function handleBack() {
    closeModal();
  }

  useEffect(() => {
    fetchOrderDetailFromFirebase();
  }, [client_id, product_id]);

  if (packageOrderDetail.length === 0) {
    return (
      <OrderDetailContainer>
        <OrderDetailText>Loading...</OrderDetailText>
      </OrderDetailContainer>
    );
  }

  const getLastAction = (delivery_actions: {
    [key: string]: { action: string; timestamp: Timestamp };
  }) => {
    const actions = Object.values(delivery_actions);
    if (actions.length === 0) return { action: 'Nenhuma ação disponível', timestamp: '' };

    actions.sort(
      (a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
    );
    const lastAction = actions[0];
    return {
      action: lastAction.action,
      timestamp: format(lastAction.timestamp.toDate(), "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      }),
    };
  };

  const getWeightText = (weight: 'light' | 'medium') => {
    switch (weight) {
      case 'medium':
        return 'Peso moderado (5-10kg)';
      case 'light':
        return 'Peso leve (1-5kg)';
      default:
        return '';
    }
  };

  const getRelativeDate = (date: Date) => {
    const now = new Date();
  
    if (isToday(date)) {
      return format(date, "'hoje às' HH:mm", { locale: ptBR });
    } else if (isTomorrow(date)) {
      return format(date, "'amanhã às' HH:mm", { locale: ptBR });
    } else if (isYesterday(date)) {
      return format(date, "'ontem às' HH:mm", { locale: ptBR });
    } else {
      return format(date, "'em' dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  return (
    <OrderDetailContainer>
      <BackButtonContainer>
        <TouchableOpacity onPress={handleBack}>
          <Back />
        </TouchableOpacity>
      </BackButtonContainer>

      {packageOrderDetail.map((item, index) => (
        <View key={index}>
          <OrderDetailIcon>
            <View>
              <OrderTitleText>Pedido {item.order_name}</OrderTitleText>
              <ActionContainer>
                  <ActionDot
                    style={{
                      backgroundColor: getStatusColor(item.status.toLowerCase()),
                    }}
                  />
                  <OrderDetailText> {item.status === 'received'
                      ? `Finalizado`
                      : `Em andamento`
                  } </OrderDetailText>

                  <OrderDetailText>
                    {item.status === 'received'
                        ? `Finalizado ${getRelativeDate(item.arrival_date.toDate())}`
                        : `Iniciado ${getRelativeDate(item.creation_date.toDate())}`
                    }                   
                  </OrderDetailText>
              </ActionContainer>
              <OrderTitleText>Dados do pedido</OrderTitleText>
              <StyledImage source={{ uri: item.icon }} style={{marginBottom: 20}} />

              <OrderDetailText>
                  {getWeightText(item.weight)}                </OrderDetailText>
              <OrderDetailText>
                  Objeto sensível? {item.sensitive ? 'Sim' : 'Não'}
              </OrderDetailText>
              <View style={{marginTop: 10}}>
              <HorizontalContainer>
                <LabelText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.status === 'received'
                      ? `Pedido entregue`
                      : `Prazo de entrega`
                    }
                  </LabelText>
                  <ValueText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                      {getRelativeDate(item.arrival_date.toDate())}
                  </ValueText>
                  </HorizontalContainer>
                  <HorizontalContainer>
                <LabelText>Entregar para</LabelText>
                <ValueText>{item.client_name}</ValueText>
              </HorizontalContainer>
              </View>              
              <OrderDetailText style={{ fontWeight: 'bold', marginTop: 20 }}>Endereço de entrega</OrderDetailText>
                <OrderDetailText>{item.address}</OrderDetailText>
                <MapContainer
                  initialRegion={{
                    latitude: item.location.latitude,
                    longitude: item.location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker
                    coordinate={{ latitude: item.location.latitude, longitude: item.location.longitude }}
                  />
                </MapContainer>

            </View>
          </OrderDetailIcon>
        </View>
      ))}
    </OrderDetailContainer>
  );
}

export default OrderDetail;
