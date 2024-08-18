import React, { useState, useEffect } from 'react';
import { Modal, Text, View, Image, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';
import Back from '@/assets/images/chevron-left.svg';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';

const MapContainer = styled(MapView)`
  width: 100%;
  height: 200px;
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

const IncidentFormContainer = styled(View)`
  width: 100%;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  align-items: center;
`;

const IncidentFormInput = styled(TextInput)`
  height: 100px;
  border-width: 1px;
  border-color: #cccccc;
  border-radius: 8px;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
`;

const IncidentFormButton = styled(TouchableOpacity)`
  background-color: #FF5733;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
  width: 100%;
`;

const IncidentFormButtonText = styled(Text)`
  color: white;
  font-size: 16px;
  font-weight: bold;
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
  const [isIncidentFormVisible, setIsIncidentFormVisible] = useState(false);
  const [incidentDescription, setIncidentDescription] = useState('');

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
    } else if (date.getFullYear() === now.getFullYear()) {
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } else {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <OrderDetailContainer>
      <BackButtonContainer>
        <TouchableOpacity onPress={handleBack}>
          <Back width={24} height={24} />
        </TouchableOpacity>
      </BackButtonContainer>
      <ActionContainer
              style={{
                position: 'absolute',
                top: 24,
                left: 5,
                zIndex: 1, // Garante que o botão fique acima de outros elementos
                margin: 10, // Ajusta o espaço do botão em relação às bordas da tela
              }}
            >
              <PopupButton onPress={() => setIsPopupVisible(true)}>
              <FontAwesome name="exclamation-circle" size={24} color="#3A3A3A" />
              
              </PopupButton>
            </ActionContainer>

      {packageOrderDetail.map((order, index) => (
        <OrderDetailItem key={order.id}>
          <View>
            <OrderDetailIcon>
              <StyledImage source={{ uri: order.icon }} />
              <OrderDetailText>
                {order.order_name}{"\n"}{order.client_name}
              </OrderDetailText>
            </OrderDetailIcon>

            <OrderDetailIcon>
              <LabelText>Endereço:</LabelText>
              <ValueText>{order.address}</ValueText>
            </OrderDetailIcon>

            <OrderDetailIcon>
              <LabelText>Peso:</LabelText>
              <ValueText>{getWeightText(order.weight)}</ValueText>
            </OrderDetailIcon>

            <OrderDetailIcon>
              <LabelText>Última Ação:</LabelText>
              <ValueText>{getLastAction(order.delivery_actions).action}</ValueText>
            </OrderDetailIcon>

            <OrderDetailIcon>
              <LabelText>Data:</LabelText>
              <ValueText>{getRelativeDate(order.arrival_date.toDate())}</ValueText>
            </OrderDetailIcon>

            <MapContainer
              initialRegion={{
                latitude: order.location.latitude,
                longitude: order.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker
                coordinate={{
                  latitude: order.location.latitude,
                  longitude: order.location.longitude,
                }}
                title="Localização da Entrega"
                description={order.address}
              />
            </MapContainer>

            <ActionContainer
              style={{
                position: 'absolute',
                top: 24,
                left: 5,
                zIndex: 1, // Garante que o botão fique acima de outros elementos
                margin: 10, // Ajusta o espaço do botão em relação às bordas da tela
              }}
            >
              <PopupButton onPress={() => setIsPopupVisible(true)}>
              <FontAwesome name="exclamation-circle" size={24} color="#3A3A3A" />
              
              </PopupButton>
            </ActionContainer>
          </View>

          <Modal visible={isPopupVisible} transparent={true} animationType="fade">
            <PopupContainer>
              <PopupContent>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Relatar Problema
                </Text>
                <TouchableOpacity 
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1,
                  }}
                  onPress={() => setIsPopupVisible(false)}
                >
                  <FontAwesome name="times" size={24} color="#3A3A3A" />
                </TouchableOpacity>
                <NotificationOption onPress={() => setIsIncidentFormVisible(true)}>
                  <FontAwesome name="clock-o" size={24} color="#3A3A3A" />
                  <OptionText>Atraso no Trânsito</OptionText>
                </NotificationOption>

                <NotificationOption onPress={() => setIsIncidentFormVisible(true)}>
                  <FontAwesome name="user-times" size={24} color="#3A3A3A" />
                  <OptionText>Responsável não encontrado no local de entrega</OptionText>
                </NotificationOption>

                <NotificationOption onPress={() => setIsIncidentFormVisible(true)}>
                  <FontAwesome name="map-marker" size={24} color="#3A3A3A" />
                  <OptionText>Endereço incorreto</OptionText>
                </NotificationOption>

                <NotificationOption onPress={() => setIsIncidentFormVisible(true)}>
                  <FontAwesome name="umbrella" size={24} color="#3A3A3A" />
                  <OptionText>Pedido sofreu acidente no percurso</OptionText>
                </NotificationOption>

                <NotificationOption onPress={() => setIsIncidentFormVisible(true)}>
                  <FontAwesome name="exclamation-triangle" size={24} color="#3A3A3A" />
                  <OptionText>Entregador sofreu acidente no percurso</OptionText>
                </NotificationOption>

                <NotificationOption onPress={() => setIsIncidentFormVisible(true)}>
                  <FontAwesome name="times-circle" size={24} color="#3A3A3A" />
                  <OptionText>Outro</OptionText>
                </NotificationOption>
              </PopupContent>
            </PopupContainer>
          </Modal>

          <Modal visible={isIncidentFormVisible} transparent={true} animationType="fade">
            <PopupContainer>
              <IncidentFormContainer>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Nos conte mais sobre o imprevisto
                </Text>

                <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
                  Nos informe se algo tiver ocorrido ao longo dessa entrega.
                </Text>

                <IncidentFormInput
                  multiline
                  maxLength={500}
                  placeholder="Descreva o imprevisto aqui..."
                  value={incidentDescription}
                  onChangeText={setIncidentDescription}
                />

                <Text style={{ alignSelf: 'flex-end', marginBottom: 10 }}>
                  {incidentDescription.length}/500 caracteres
                </Text>

                <IncidentFormButton onPress={() => { /* Adicionar lógica para enviar o formulário */ }}>
                  <IncidentFormButtonText>Enviar</IncidentFormButtonText>
                </IncidentFormButton>

                <PopupCloseButton onPress={() => setIsIncidentFormVisible(false)}>
                  <PopupCloseButtonText>Fechar</PopupCloseButtonText>
                </PopupCloseButton>
              </IncidentFormContainer>
            </PopupContainer>
          </Modal>
        </OrderDetailItem>
      ))}
    </OrderDetailContainer>
  );
};

export default OrderDetail;
