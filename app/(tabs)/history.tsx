import React, { useState, useEffect, useRef } from 'react';
import { database } from '@/config/firebaseConfig';
import { onSnapshot, collection, getDocs, query, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, TouchableOpacity, TextInput, Modal, Dimensions, TouchableWithoutFeedback, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, isTomorrow, isYesterday, subDays, addDays, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';
import SearchIcon from '@/assets/images/search-icon.svg';
import OrderDetail from '../orderDetail';
import OrderIcon from '@/assets/images/orderIcon.svg';
import OrderIconStorage from '@/assets/images/orderIconStorage.svg';
import Wave from '@/assets/images/wave.svg';
import WaveStorage from '@/assets/images/wave-storage.svg';
import { Header } from 'react-native/Libraries/NewAppScreen';

const CodeContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;
`;

const CodeBox = styled(View)`
  flex: 1;
  background-color: #f5f5f5;
  height: 70px;
  border-radius: 20px;
  align-items: center;
  margin: 0 2px;
  text-align: center;
  justify-content: center;
`;

const CodeText = styled(Text)`
  font-size: 20px;
  color: #000;
`;

const HiddenTextInput = styled(TextInput)`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  color: transparent;
  background-color: transparent;
  z-index: 10;
`;

const ActionDetails = styled(View)`
  width: 100%;
`;

const WaveContainer = styled(View)`
  align-items: flex-end;
  margin-top: 20px;
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
  margin-left: 40px;
  margin-top: 10px;
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
  kind: string | null;
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
  color: ${({ selected, kind }) => 
    selected 
      ? (kind === 'armazenador' ? '#16488D' : '#FA4A0C') 
      : '#9A9A9D'};
  border-bottom-width: ${({ selected }) => (selected ? '3px' : '0')};
  border-bottom-color: ${({ selected, kind }) => 
    selected 
      ? (kind === 'armazenador' ? '#16488D' : '#FA4A0C') 
      : 'transparent'};
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

interface AcceptProps {
  kind : string | null;
}

const AcceptButton = styled(TouchableOpacity)<AcceptProps>`
  background-color: ${({kind }) => kind === 'armazenador' ? '#16488D' : '#FA4A0C'};
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

interface ConfirmProps {
  kind: string | null;
}

const ConfirmButton = styled(TouchableOpacity)<ConfirmProps>`
  background-color: ${({ kind }) => kind === 'armazenador' ? '#16488D' : '#FA4A0C'};
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
    case 'canceled':
      return '#FF5733';
    default:
      return '#000000';
  }
};

export interface PackageHistoryItem {
  id: string;
  status: string;
  client_id: string[];
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
  stored: boolean;
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
  const [userKind, setUserKind] = useState<string | null>(null);

  useEffect(() => {
    if (userKind === 'armazenador') {
      setSelectedTab('Em andamento');
    }
  }, [userKind]);


  const fetchHistoryFromFirebase = async (clientId: string) => {
    try {
      const q = query(collection(database, 'products'), where('client_id', 'array-contains', clientId));

      const querySnapshot = await getDocs(q);
      const newEntries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        stored: doc.data().stored,
        ...doc.data(),
        delivery_actions: doc.data().delivery_actions || {},
      })) as PackageHistoryItem[];
      setPackageHistory(newEntries);
      filterOrdersByStatus(selectedTab, newEntries); 

    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };


  const fetchUserKind = async (clientId: string) => {
    try {
      const q = query(collection(database, 'users'), where('clientId', 'array-contains', clientId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const kind = userData.kind;

        if (kind === 'entregador' || kind === 'armazenador') {
          setUserKind(kind);
          console.log(`User kind is: ${kind}`);
        } else {
          console.log('User kind is neither entregador nor armazenador');
        }
      } else {
        console.log('No user found with the provided clientId');
      }
    } catch (error) {
      console.error('Error fetching user data: ', error);
    }
  };

  useEffect(() => {
    if (clientId) {
      const q = query(collection(database, 'products'), where('client_id', 'array-contains', clientId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newEntries = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          stored: doc.data().stored,
          ...doc.data(),
          delivery_actions: doc.data().delivery_actions || {},
        })) as PackageHistoryItem[];
        setPackageHistory(newEntries);
        filterOrdersByStatus(selectedTab, newEntries); 
      });

      // Cleanup listener on component unmount
      return () => unsubscribe();
    }
  }, [clientId, selectedTab]);

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

    if (userKind === 'entregador') {
      switch (status) {
        case 'Pendentes':
          filtered = orders.filter(order => !order.accepted && order.stored === true);
          break;
        case 'Em andamento':
          filtered = orders.filter(order => order.accepted && order.status !== 'received' && order.status !== 'canceled' && order.stored === true);
          break;
        case 'Finalizados':
          filtered = orders.filter(order => order.status === 'received' && order.stored === true || order.status === 'canceled' && order.stored === true);
          break;
      }
      setFilteredOrders(filtered);
    } else {
      switch (status) {
        case 'Pendentes':
          filtered = orders.filter(order => order.stored === false || order.stored === true);
          break;
        case 'Em andamento':
          filtered = orders.filter(order => order.status !== 'received' && order.status !== 'canceled');
          break;
        case 'Finalizados':
          filtered = orders.filter(order => order.status === 'received' || order.status === 'canceled');
          break;
      }
      setFilteredOrders(filtered);
    }
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
    if (actions.length === 0) return { action: 'A caminho do centro de armazenamento', timestamp: Timestamp.now() };

    actions.sort(
      (a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
    );
    const lastAction = actions[0];
    return {
      action: lastAction.action,
      timestamp: lastAction.timestamp
    };
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const now = Timestamp.now();
      const orderRef = doc(database, 'products', orderId);
      await updateDoc(orderRef, { accepted: true, delivery_actions: {
        ...packageHistory.find(order => order.id === orderId)?.delivery_actions,
        [now.toMillis()]: { action: 'Esperando retirada do entregador', timestamp: now }
      } });

      const updatedHistory = packageHistory.map(order =>
        order.id === orderId ? { ...order, accepted: true, delivery_actions: {
          ...packageHistory.find(order => order.id === orderId)?.delivery_actions,
          [now.toMillis()]: { action: 'Esperando retirada do entregador', timestamp: now }
        } } : order
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
      
      // Get the current timestamp
      const now = Timestamp.now();
  
      // Update the delivery actions with the new "Entrega cancelada" action
      await updateDoc(orderRef, {
        accepted: true,
        status: 'canceled',
        delivery_actions: {
          ...packageHistory.find(order => order.id === orderId)?.delivery_actions,
          [now.toMillis()]: { action: 'Entrega cancelada', timestamp: now }
        }
      });
  
      // Update the local state
      const updatedHistory = packageHistory.map(order =>
        order.id === orderId ? {
          ...order,
          accepted: true,
          status: 'canceled',
          delivery_actions: {
            ...order.delivery_actions,
            [now.toMillis()]: { action: 'Entrega cancelada', timestamp: now }
          }
        } : order
      );
  
      setPackageHistory(updatedHistory);
      filterOrdersByStatus(selectedTab, updatedHistory);
    } catch (error) {
      console.error('Error accepting order: ', error);
    }
  };

  const storeOrder = async (orderId: string) => {
    try {
      const orderRef = doc(database, 'products', orderId);
      
      // Get the current timestamp
      const now = Timestamp.now();
  
      // Update the delivery actions with the new "Entrega cancelada" action
      await updateDoc(orderRef, {
        stored: true,
        status: 'processing',
        delivery_actions: {
          ...packageHistory.find(order => order.id === orderId)?.delivery_actions,
          [now.toMillis()]: { action: 'Pacote armazenado', timestamp: now }
        }
      });
  
      // Update the local state
      const updatedHistory = packageHistory.map(order =>
        order.id === orderId ? {
          ...order,
          stored: true,
          status: 'processing',
          delivery_actions: {
            ...packageHistory.find(order => order.id === orderId)?.delivery_actions,
            [now.toMillis()]: { action: 'Pacote armazenado', timestamp: now }
          }
        } : order
      );
  
      setPackageHistory(updatedHistory);
      filterOrdersByStatus(selectedTab, updatedHistory);
    } catch (error) {
      console.error('Error accepting order: ', error);
    }
  };

  const sendOrder = async (orderId: string) => {
    try {
      const orderRef = doc(database, 'products', orderId);
      
      // Get the current timestamp
      const now = Timestamp.now();
  
      // Update the delivery actions with the new "Entrega cancelada" action
      await updateDoc(orderRef, {
        stored: true,
        status: 'sent',
        delivery_actions: {
          ...packageHistory.find(order => order.id === orderId)?.delivery_actions,
          [now.toMillis()]: { action: 'Saiu para entrega', timestamp: now }
        }
      });
  
      const updatedHistory = packageHistory.map(order =>
        order.id === orderId ? {
          ...order,
          stored: true,
          status: 'sent',
          delivery_actions: {
            ...packageHistory.find(order => order.id === orderId)?.delivery_actions,
            [now.toMillis()]: { action: 'Saiu para entrega', timestamp: now }
          }
        } : order
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
        const now = Timestamp.now();

        await updateDoc(orderRef, {
          stored: true,
          status: 'received',
          delivery_actions: {
            ...packageHistory.find(order => order.id === selectedProductId)?.delivery_actions,
            [now.toMillis()]: { action: 'Pedido entregue', timestamp: now }
          }
        });
    
        const updatedHistory = packageHistory.map(order =>
          order.id === selectedProductId ? {
            ...order,
            stored: true,
            status: 'received',
            delivery_actions: {
              ...packageHistory.find(order => order.id === selectedProductId)?.delivery_actions,
              [now.toMillis()]: { action: 'Pedido entregue', timestamp: now }
            }
          } : order
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
      alert('Código inválido');
    }
  };


  useEffect(() => {
    getClientId();
    const intervalId = setInterval(() => {
      if (clientId) {
        fetchHistoryFromFirebase(clientId);
      }
    }, 5000); 
    return () => clearInterval(intervalId);
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


  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 13; i++) {
      boxes.push(
        <CodeBox key={i}>
          <CodeText>{enteredCode[i] || ''}</CodeText>
        </CodeBox>
      );
    }
    return boxes;
  };

  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, []);

  return (
    <HistoryContainerBackground>
      <HeaderContainer>
        <HeaderText>Pedidos</HeaderText>
        <WaveContainer>
            {userKind === 'armazenador' ? <WaveStorage /> : <Wave />}
        </WaveContainer>
      </HeaderContainer>

      <HistoryContainer>
      <ScrollView>

        <TabsContainer>
        {userKind !== 'armazenador' && (
          <TouchableOpacity onPress={() => setSelectedTab('Pendentes')}>
            <TabText selected={selectedTab === 'Pendentes'} kind={userKind}>Pendentes</TabText>
          </TouchableOpacity>
        )}
          <TouchableOpacity onPress={() => setSelectedTab('Em andamento')}>
            <TabText selected={selectedTab === 'Em andamento'} kind={userKind}>Em andamento</TabText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Finalizados')}>
            <TabText selected={selectedTab === 'Finalizados'} kind={userKind}>Finalizados</TabText>
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
              {userKind === 'armazenador' ? <OrderIconStorage style={{marginRight: 20}}/> : <OrderIcon style={{marginRight: 20}}/>}
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
                  <ActionDot
                    style={{
                      backgroundColor: getStatusColor(item.status.toLowerCase()),
                    }}
                  />
                  <HistoryText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1 }}
                  >
                    
                    {getLastAction(item.delivery_actions).action}
                  </HistoryText>
                  <HistoryText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1 }}
                  >
                      {getRelativeDate(getLastAction(item.delivery_actions).timestamp.toDate())}
                  </HistoryText>
                </ActionContainer>
                {selectedTab === 'Pendentes' && (
                  <AcceptButton onPress={() => acceptOrder(item.id)} kind={userKind}>
                    <AcceptButtonText>Aceitar</AcceptButtonText>
                  </AcceptButton>
                )}
                {selectedTab === 'Pendentes' && (
                  <RejectButton onPress={() => rejectOrder(item.id)}>
                    <AcceptButtonText>Rejeitar</AcceptButtonText>
                  </RejectButton>
                )}
                {selectedTab === 'Em andamento' && item.status.toLowerCase() === 'sent' && userKind === 'entregador' && (
                  <ConfirmButton onPress={() => confirmDelivery(item.id)} kind={userKind}>
                    <ConfirmButtonText>Marcar como entregue</ConfirmButtonText>
                  </ConfirmButton>
                )}

                {selectedTab === 'Em andamento' && item.status.toLowerCase() === 'processing' && userKind === 'entregador' && (
                  <ConfirmButton onPress={() => confirmStorage(item.id)} kind={userKind}>
                    <ConfirmButtonText>Autenticar com armazenador</ConfirmButtonText>
                  </ConfirmButton>
                )}

                {selectedTab === 'Em andamento' && item.stored === false && (
                  <ConfirmButton onPress={() => storeOrder(item.id)} kind={userKind}>
                    <ConfirmButtonText>Marcar como armazenado</ConfirmButtonText>
                  </ConfirmButton>
                )}

                {selectedTab === 'Em andamento' && item.stored === true && item.accepted === false && userKind === 'armazenador' && (
                  <ConfirmButton kind={userKind} style={{backgroundColor: '#3A3A3A'}}>
                    <ConfirmButtonText>Marcar como armazenado</ConfirmButtonText>
                  </ConfirmButton>
                )}

                {selectedTab === 'Em andamento' && item.stored === true && item.accepted === true && item.status !== 'sent' && userKind === 'armazenador' && (
                  <ConfirmButton kind={userKind} style={{backgroundColor: '#3A3A3A'}}>
                    <ConfirmButtonText>Confirmar entregador</ConfirmButtonText>
                  </ConfirmButton>
                )}

                {selectedTab === 'Em andamento' && item.stored === true && item.accepted === true && item.status === 'sent' && userKind === 'armazenador' && (
                  <ConfirmButton onPress={() => sendOrder(item.id)} kind={userKind}>
                    <ConfirmButtonText>Confirmar entregador</ConfirmButtonText>
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
                  backgroundColor: '#f5f5f5',
                  borderRadius: 30,
                  padding: 20,
                  position: 'absolute',
                  top: 20          
                }}
              >
                <OrderDetail
                  client_id={clientId}
                  kind={userKind}
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
                  padding: 40,
                  paddingTop: 70,
                  borderRadius: 30,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '900', marginBottom: 2 }}>
                  {packageHistory.find(order => order.id === selectedProductId)?.status.toLowerCase() === 'sent' ? 'Digite o código de confirmação de entrega' : 'Digite o código de rastreamento do produto'}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '400', marginBottom: 8 }}>{packageHistory.find(order => order.id === selectedProductId)?.status.toLowerCase() === 'sent' ? 'Digite o código fornecido ao cliente para confirmar a entrega' : 'Ele será usado para autenticar o pedido com o armazenador'}</Text>
                <TouchableWithoutFeedback>
                  <View>
                  <CodeContainer>
                    {renderCodeBoxes()}
                  </CodeContainer>
                  <HiddenTextInput
                    ref={codeInputRef}
                    value={enteredCode}
                    onChangeText={setEnteredCode}
                    maxLength={13}
                  />
                  </View>
                </TouchableWithoutFeedback>
                {packageHistory.find(order => order.id === selectedProductId)?.status.toLowerCase() === 'sent' ? (<ConfirmButton onPress={verifyAndConfirmDelivery} kind={userKind}>
                  <ConfirmButtonText>Confirmar entrega</ConfirmButtonText>
                </ConfirmButton>) : (<ConfirmButton onPress={verifyAndConfirmStorage} kind={userKind}>
                  <ConfirmButtonText>Autenticar com armazenador</ConfirmButtonText>
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
