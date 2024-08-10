import React, { useState, useEffect } from 'react';
import { Modal, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';
import Back from '@/assets/images/chevron-left.svg';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons'; // Import para ícones

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
  resizeMode: 'cover',
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
  flex-direction: row;
  align-items: center;
`;

const ActionDot = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
`;

const ActionTextContainer = styled(View)`
  margin-left: 10px;
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

const PopupButton = styled(TouchableOpacity)`
  background-color: #4CAF50;
  padding: 10px;
  border-radius: 8px;
  margin-top: 20px;
  align-items: center;
`;

const PopupButtonText = styled(Text)`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const PopupContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const PopupContent = styled(View)`
  width: 80%;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  align-items: center;
`;

const PopupCloseButton = styled(TouchableOpacity)`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #FF5733;
  border-radius: 8px;
`;

const PopupCloseButtonText = styled(Text)`
  color: white;
  font-size: 16px;
`;

const NotificationOption = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 10px;
  margin-bottom: 10px;
  width: 100%;
`;

const OptionText = styled(Text)`
  font-size: 16px;
  margin-left: 10px;
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
  const [isPopupVisible, setIsPopupVisible] = useState(false);

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
        delivery_actions: doc.data().delivery_actions || {}
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
                <OrderDetailText>
                  {item.status === 'received' ? `Finalizado` : `Em andamento`}
                </OrderDetailText>

                <OrderDetailText>
                  {item.status === 'received'
                    ? `Finalizado ${getRelativeDate(item.arrival_date.toDate())}`
                    : `Iniciado ${getRelativeDate(item.creation_date.toDate())}`}
                </OrderDetailText>
              </ActionContainer>
              <OrderTitleText>Dados do pedido</OrderTitleText>
              <StyledImage source={{ uri: item.icon }} style={{ marginTop: 10, marginBottom: 10 }} />
              <ActionContainer>
                <OrderDetailText>{`Enviado para ${item.client_name}`}</OrderDetailText>
              </ActionContainer>
              <ActionContainer>
                <OrderDetailText>{`Endereço: ${item.address}`}</OrderDetailText>
              </ActionContainer>
              <ActionContainer>
                <OrderDetailText>{getWeightText(item.weight)}</OrderDetailText>
              </ActionContainer>
              {item.sensitive && (
                <ActionContainer>
                  <OrderDetailText>{`Conteúdo Sensível`}</OrderDetailText>
                </ActionContainer>
              )}
              <ActionContainer>
                <OrderDetailText>{`Última ação: ${getLastAction(item.delivery_actions).action} em ${getLastAction(item.delivery_actions).timestamp
                  }`}</OrderDetailText>
              </ActionContainer>
            </View>
          </OrderDetailIcon>

          {/* Botão para abrir o Popup */}
          <PopupButton onPress={() => setIsPopupVisible(true)}>
            <PopupButtonText>Notificar Imprevisto</PopupButtonText>
          </PopupButton>

          {/* Mapa */}
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
      ))}

      {/* Modal Popup */}
      <Modal
        visible={isPopupVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPopupVisible(false)}
      >
        <PopupContainer>
          <PopupContent>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Notificar Improvisto
            </Text>
            <Text style={{ marginBottom: 20 }}>
              Nos informe se algo tiver ocorrido ao longo dessa entrega.
            </Text>

            {/* Opções de Notificação */}
            <NotificationOption>
              <FontAwesome name="clock-o" size={24} color="black" />
              <OptionText>Atraso no trânsito</OptionText>
            </NotificationOption>

            <NotificationOption>
              <FontAwesome name="user-times" size={24} color="black" />
              <OptionText>Responsável não encontrado no local de entrega</OptionText>
            </NotificationOption>

            <NotificationOption>
              <FontAwesome name="map-marker" size={24} color="black" />
              <OptionText>Endereço incorreto</OptionText>
            </NotificationOption>

            <NotificationOption>
              <FontAwesome name="car" size={24} color="black" />
              <OptionText>Pedido sofreu acidente no percurso</OptionText>
            </NotificationOption>

            <NotificationOption>
              <FontAwesome name="ambulance" size={24} color="black" />
              <OptionText>Entregador sofreu acidente no percurso</OptionText>
            </NotificationOption>

            <NotificationOption>
              <FontAwesome name="ellipsis-h" size={24} color="black" />
              <OptionText>Outro</OptionText>
            </NotificationOption>

            <PopupCloseButton onPress={() => setIsPopupVisible(false)}>
              <PopupCloseButtonText>Fechar</PopupCloseButtonText>
            </PopupCloseButton>
          </PopupContent>
        </PopupContainer>
      </Modal>
    </OrderDetailContainer>
  );
};

export default OrderDetail;
