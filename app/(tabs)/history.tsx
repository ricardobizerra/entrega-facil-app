import React, { useState, useEffect } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, TouchableOpacity, TextInput, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';
import SearchIcon from '@/assets/images/search-icon.svg';
import OrderDetail from '../orderDetail';

const HistoryContainer = styled(View)`
  flex: 1;
  padding: 10px;
  background-color: #f5f5f5;
`;

const HistoryItem = styled(View)`
  background-color: #ffffff;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
`;

const HistoryText = styled(Text)`
  color: #3a3a3a;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
  margin-bottom: 4px;
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
  background-color: #ffffff;
  padding: 10px;
  border-radius: 10px;
  width: 90%;
`;

const SearchIconContainer = styled(View)`
  margin-right: 10px;
`;

const AcceptButton = styled(TouchableOpacity)`
  background-color: #4CAF50;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
`;

const AcceptButtonText = styled(Text)`
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
}

export default function History() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'Novos' | 'Em andamento' | 'Finalizado'>('Novos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<PackageHistoryItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(''); 

  const [modalVisible, setModalVisible] = useState(false);

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
      item.id.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOrders(filtered);

    if (query === '') {
      filterOrdersByStatus(selectedTab, packageHistory);
    }
  };

  const filterOrdersByStatus = (
    status: 'Novos' | 'Em andamento' | 'Finalizado',
    orders: PackageHistoryItem[]
  ) => {
    let filtered: PackageHistoryItem[];
    switch (status) {
      case 'Novos':
        filtered = orders.filter(order => !order.accepted);
        break;
      case 'Em andamento':
        filtered = orders.filter(order => order.accepted && order.status !== 'received');
        break;
      case 'Finalizado':
        filtered = orders.filter(order => order.status === 'received');
        break;
    }
    setFilteredOrders(filtered);
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

  useEffect(() => {
    getClientId();
  }, []);

  useEffect(() => {
    filterOrdersByStatus(selectedTab, packageHistory);
  }, [selectedTab, packageHistory]);

  return (
    <HistoryContainer>
      <TabsContainer>
        <TouchableOpacity onPress={() => setSelectedTab('Novos')}>
          <TabText selected={selectedTab === 'Novos'}>Novos</TabText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Em andamento')}>
          <TabText selected={selectedTab === 'Em andamento'}>Em andamento</TabText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Finalizado')}>
          <TabText selected={selectedTab === 'Finalizado'}>Finalizado</TabText>
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
            <StyledLogo />
            <View style={{ flex: 1 }}>
              <HistoryTitleText>Pedido {item.id}</HistoryTitleText>
              <HistoryText>
                Previsão de entrega:{' '}
                {format(item.arrival_date.toDate(), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </HistoryText>
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
                  {getLastAction(item.delivery_actions).timestamp}
                </HistoryText>
              </ActionContainer>
              {selectedTab === 'Novos' && (
                <AcceptButton onPress={() => acceptOrder(item.id)}>
                  <AcceptButtonText>Aceitar</AcceptButtonText>
                </AcceptButton>
              )}
            </View>
          </HistoryItem>
        </TouchableOpacity>
      ))}

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                width: Dimensions.get('window').width * 0.9,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
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
    </HistoryContainer>
  );
}
