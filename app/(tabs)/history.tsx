import React, { useState, useEffect, useRef } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, TouchableOpacity, TextInput, Modal, Dimensions, TouchableWithoutFeedback, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, isTomorrow, isYesterday, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';
import SearchIcon from '@/assets/images/search-icon.svg';
import OrderDetail from '../orderDetail';
import Wave from '@/assets/images/wave.svg';
import { Header } from 'react-native/Libraries/NewAppScreen';

const ActionDetails = styled(View)`
  width: 100%;
`;

const WaveContainer = styled(View)`
  align-items: flex-end;
  margin-top: 20;
`;

const HeaderContainer = styled(View)`
  width: 100%;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
`;

const HeaderText = styled(Text)`
  color: #F2F2F2;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin-left: 40;
  margin-top: 10;
  flex: 1;
`;

const HistoryContainerBackground = styled(View)`
  flex: 1;
  background-color: #3A3A3A;
`;

const HistoryContainer = styled(View)`
  flex: 1;
  padding: 10px;
  background-color: #f5f5f5;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
`;

const HistoryItem = styled(View)`
  background-color: #ffffff;
  padding: 25px;
  margin-bottom: 20px;
  border-radius: 20px;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start; /* Ensure alignment to the top */
`;



const HistoryText = styled(Text)`
  color: #3a3a3a;
  font-size: 14px;
  font-weight: 400;
  margin-right: 10px;
`;

const ExtraText = styled(Text)`
  color: #3a3a3a;
  font-size: 12px;
  font-weight: 400;
  margin-right: 10px;
  margin-top: 5px;
`;

const HistoryTitleText = styled(Text)`
  color: #3a3a3a;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const LogoContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const StyledLogo = styled(Logo)`
  width: 60px;
  height: 60px;
  margin-right: 10px;
`;

const ActionDot = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
`;

const ActionContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const TabsContainer = styled(View)`
  flex-direction: row;
  margin-left: 30px;
  margin-bottom: 10px;
  margin-top: 20px;
`;

interface TabTextProps {
  selected: boolean;
}

const StyledImage = styled(Image).attrs({
  resizeMode: 'cover'
})`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  margin-right: 10px;
`;

const StyledButtonContainer = styled(View)`
  width: 100%;
  margin-right: 10px;
`;

const TabText = styled(Text)<TabTextProps>`
  font-size: 16px;
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  margin-right: 20px;
  color: ${({ selected }) => (selected ? '#FA4A0C' : '#9A9A9D')};
  border-bottom-width: ${({ selected }) => (selected ? '3px' : '0')};
  border-bottom-color: ${({ selected }) => (selected ? '#FA4A0C' : 'transparent')}; 
`;

const SearchContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const SearchInput = styled(TextInput)`
  background-color: #EFEEEE;
  padding: 10px;
  border-radius: 10px;
  width: 90%;
`;

const SearchIconContainer = styled(View)`
  margin-right: 10px;
`;

const AcceptButton = styled(TouchableOpacity)`
  background-color: #DB3319;
  padding: 10px;
  border-radius: 25px;
  margin-top: 10px;
`;

const RejectButton = styled(TouchableOpacity)`
  background-color: #3A3A3A;
  padding: 10px;
  border-radius: 25px;
  margin-top: 10px;
`;

const AcceptButtonText = styled(Text)`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
`;

const ConfirmButton = styled(TouchableOpacity)`
  background-color: #DB3319;
  padding: 10px;
  border-radius: 25px;
  margin-top: 10px;
`;

const ConfirmButtonText = styled(Text)`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
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

export default function History() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'Pendentes' | 'Em andamento' | 'Finalizados'>('Pendentes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<PackageHistoryItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const codeInputRef = useRef<TextInput>(null);


  const fetchHistoryFromFirebase = async (clientId: string) => {
    try {
      const q = query(collection(database, 'products'), where('client_id', '==', clientId));
      const querySnapshot = await getDocs(q);
      const newEntries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        delivery_actions: doc.data().delivery_actions || {},
      })) as PackageHistoryItem[];
      setPackageHistory(newEntries);
      filterOrdersByStatus(selectedTab, newEntries); 
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = filteredOrders.filter((item) =>
      item.order_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOrders(filtered);

    if (query === '') {
      filterOrdersByStatus(selectedTab, packageHistory);
    }
  };

  const filterOrdersByStatus = (
    status: 'Pendentes' | 'Em andamento' | 'Finalizados',
    orders: PackageHistoryItem[]
  ) => {
    let filtered: PackageHistoryItem[];
    switch (status) {
      case 'Pendentes':
        filtered = orders.filter(order => !order.accepted);
        break;
      case 'Em andamento':
        filtered = orders.filter(order => order.accepted && order.status !== 'received' && order.status !== 'canceled');
        break;
      case 'Finalizados':
        filtered = orders.filter(order => order.status === 'received' || order.status === 'canceled');
        break;
    }
    setFilteredOrders(filtered);
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

  const handleOrderDetail = (item_id: string) => {
    setSelectedProductId(item_id);
    setModalVisible(true);
  };

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

  const acceptOrder = async (orderId: string) => {
    try {
      const orderRef = doc(database, 'products', orderId);
      await updateDoc(orderRef, { accepted: true });

      const updatedHistory = packageHistory.map(order =>
        order.id === orderId ? { ...order, accepted: true } : order
      );

      setPackageHistory(updatedHistory);
      filterOrdersByStatus(selectedTab, updatedHistory);
    } catch (error) {
      console.error('Error accepting order: ', error);
    }
  };

  const rejectOrder = async (orderId: string) => {
    try {
      const orderRef = doc(database, 'products', orderId);
      await updateDoc(orderRef, { accepted: true, status: 'canceled' });

      const updatedHistory = packageHistory.map(order =>
        order.id === orderId ? { ...order, accepted: true } : order
      );

      setPackageHistory(updatedHistory);
      filterOrdersByStatus(selectedTab, updatedHistory);
    } catch (error) {
      console.error('Error accepting order: ', error);
    }
  };


  const confirmDelivery = async (orderId: string) => {
    setSelectedProductId(orderId);
    setConfirmModalVisible(true);
  };
  const verifyAndConfirmDelivery = async () => {
    const orderDetails = packageHistory.find(order => order.id === selectedProductId);

    if (orderDetails && enteredCode === orderDetails.code) { // Assuming orderDetails.code exists
      try {
        const orderRef = doc(database, 'products', selectedProductId);
        await updateDoc(orderRef, { status: 'received' });

        const updatedHistory = packageHistory.map(order =>
          order.id === selectedProductId ? { ...order, status: 'received' } : order
        );

        setPackageHistory(updatedHistory);
        filterOrdersByStatus(selectedTab, updatedHistory);
        setConfirmModalVisible(false);
      } catch (error) {
        console.error('Error confirming delivery: ', error);
      }
    } else {
      alert('Invalid code. Please try again.');
    }
  };

  const confirmStorage = async (orderId: string) => {
    setSelectedProductId(orderId);
    setConfirmModalVisible(true);
  };
  const verifyAndConfirmStorage = async () => {
    const orderDetails = packageHistory.find(order => order.id === selectedProductId);

    if (orderDetails && enteredCode === orderDetails.storage_code) { // Assuming orderDetails.code exists
      try {
        const orderRef = doc(database, 'products', selectedProductId);
        await updateDoc(orderRef, { status: 'sent' });

        const updatedHistory = packageHistory.map(order =>
          order.id === selectedProductId ? { ...order, status: 'sent' } : order
        );

        setPackageHistory(updatedHistory);
        filterOrdersByStatus(selectedTab, updatedHistory);
        setConfirmModalVisible(false);
      } catch (error) {
        console.error('Error confirming delivery: ', error);
      }
    } else {
      alert('Invalid code. Please try again.');
    }
  };


  useEffect(() => {
    getClientId();
  }, []);

  useEffect(() => {
    filterOrdersByStatus(selectedTab, packageHistory);
  }, [selectedTab, packageHistory]);


  useEffect(() => {
    if (confirmModalVisible && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [confirmModalVisible]);

  const getRelativeDate = (date: Date) => {
    const now = new Date();
  
    if (isToday(date)) {
      return format(date, "'Hoje às' HH:mm", { locale: ptBR });
    } else if (isTomorrow(date)) {
      return format(date, "'Amanhã às' HH:mm", { locale: ptBR });
    } else if (isYesterday(date)) {
      return format(date, "'Ontem às' HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  return (
    <HistoryContainerBackground>
      <HeaderContainer>
        <HeaderText>Pedidos</HeaderText>
        <WaveContainer>
          <Wave />
        </WaveContainer>
      </HeaderContainer>

      <HistoryContainer>
      <ScrollView>

        <TabsContainer>
          <TouchableOpacity onPress={() => setSelectedTab('Pendentes')}>
            <TabText selected={selectedTab === 'Pendentes'}>Pendentes</TabText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Em andamento')}>
            <TabText selected={selectedTab === 'Em andamento'}>Em andamento</TabText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Finalizados')}>
            <TabText selected={selectedTab === 'Finalizados'}>Finalizados</TabText>
          </TouchableOpacity>
        </TabsContainer>

        <SearchContainer>
          <SearchIconContainer>
            <SearchIcon />
          </SearchIconContainer>
          <SearchInput
            placeholder="Pesquise por um pedido"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </SearchContainer>

        {filteredOrders.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => handleOrderDetail(item.id)}>
            <HistoryItem>
              <StyledImage source={{ uri: item.icon }} />
              <View style={{ flex: 1 }}>
                <HistoryTitleText>Pedido {item.order_name}</HistoryTitleText>
                <HistoryText>
                  {item.status === 'received'
                      ? `Entregue em ${item.address}`
                      : `Entregar em ${item.address}`
                  }
                  </HistoryText>
                  <HistoryText>
                  Ao responsável {item.client_name}
                </HistoryText>
                <ExtraText>
                  {getWeightText(item.weight)}</ExtraText>
                  <ExtraText>
                  Objeto sensível? {item.sensitive ? 'Sim' : 'Não'}
                </ExtraText>
              </View>
              <ActionDetails>
                <ActionContainer>
                {item.accepted === true && (
                  <ActionDot
                    style={{
                      backgroundColor: getStatusColor(item.status.toLowerCase()),
                    }}
                  />)}
                  {item.accepted === true && (
                  <HistoryText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1 }}
                  >
                    
                    {item.status === 'received'
                      ? `Pedido entregue`
                      : item.status === 'canceled' ? `Entrega cancelada` : `Prazo de entrega`
                    }
                  </HistoryText>)}
                  {item.accepted === true && (
                  <HistoryText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1 }}
                  >
                      {getRelativeDate(item.arrival_date.toDate())}
                  </HistoryText>)}
                </ActionContainer>
                {selectedTab === 'Pendentes' && (
                  <AcceptButton onPress={() => acceptOrder(item.id)}>
                    <AcceptButtonText>Aceitar</AcceptButtonText>
                  </AcceptButton>
                )}
                {selectedTab === 'Pendentes' && (
                  <RejectButton onPress={() => rejectOrder(item.id)}>
                    <AcceptButtonText>Rejeitar</AcceptButtonText>
                  </RejectButton>
                )}
                {selectedTab === 'Em andamento' && item.status.toLowerCase() === 'sent' && (
                  <ConfirmButton onPress={() => confirmDelivery(item.id)}>
                    <ConfirmButtonText>Marcar como entregue</ConfirmButtonText>
                  </ConfirmButton>
                )}

                {selectedTab === 'Em andamento' && item.status.toLowerCase() === 'processing' && (
                  <ConfirmButton onPress={() => confirmStorage(item.id)}>
                    <ConfirmButtonText>Autenticar com armazenador</ConfirmButtonText>
                  </ConfirmButton>
                )}

                </ActionDetails>

            </HistoryItem>
          </TouchableOpacity>
        ))}

        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: Dimensions.get('window').width * 1,
                  height: Dimensions.get('window').height * 0.8,
                  backgroundColor: 'white',
                  borderRadius: 30,
                  padding: 20,
                  position: 'absolute',
                  top: 20          
                }}
              >
                <OrderDetail
                  client_id={clientId}
                  product_id={selectedProductId}
                  closeModal={() => setModalVisible(false)}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal visible={confirmModalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setConfirmModalVisible(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <View
                style={{
                  width: Dimensions.get('window').width - 40,
                  backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 20 }}>Confirmar Entrega</Text>
                <TouchableWithoutFeedback>
                  <View>
                    <TextInput
                      ref={codeInputRef}
                      style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        marginBottom: 20,
                        paddingLeft: 10,
                      }}
                      placeholder="Digite o código"
                      value={enteredCode}
                      onChangeText={setEnteredCode}
                    />
                  </View>
                </TouchableWithoutFeedback>
                {packageHistory.find(order => order.id === selectedProductId)?.status.toLowerCase() === 'sent' ? (<ConfirmButton onPress={verifyAndConfirmDelivery}>
                  <ConfirmButtonText>Confirmar</ConfirmButtonText>
                </ConfirmButton>) : (<ConfirmButton onPress={verifyAndConfirmStorage}>
                  <ConfirmButtonText>Confirmar</ConfirmButtonText>
                </ConfirmButton>)}
                
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>

      </HistoryContainer>
    </HistoryContainerBackground>
  );
}
