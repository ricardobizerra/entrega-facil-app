import React, { useState, useEffect } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, Button, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';
import SearchIcon from '@/assets/images/search-icon.svg';

const HistoryContainer = styled(View)`
  flex: 1;
  padding: 10px;
  background-color: #f5f5f5;
`;

const HistoryItem = styled(View)`
  background-color: #ffffff;
  padding: 15px;
  margin-bottom: 20px;
  width: 95%;
  margin-left: 20px;
  border-radius: 20px;
`;

const HistoryText = styled(Text)`
  color: #3a3a3a;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
`;

const HistoryTitleText = styled(Text)`
  color: #3a3a3a;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
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
  justify-content: center; /* Center horizontally */
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'processing':
      return '#FF5733'; // Vermelho
    case 'sent':
      return '#F5A623'; // Amarelo
    case 'received':
      return '#4CAF50'; // Verde
    default:
      return '#000000'; // Cor padrão, caso não haja correspondência
  }
};

interface PackageHistoryItem {
  id: string;
  status: string;
  client_id: string;
  creation_date: Timestamp;
  arrival_date: Timestamp;
  delivery_actions: { [key: string]: { action: string; timestamp: Timestamp } };
}

export default function History() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'Em andamento' | 'Finalizado'>('Em andamento');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<PackageHistoryItem[]>([]);

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
      filterOrdersByStatus(selectedTab, newEntries); // Filter initial orders by selected tab
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

  function handleBack() {
    router.back();
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = packageHistory.filter((item) =>
      item.id.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const filterOrdersByStatus = (
    status: 'Em andamento' | 'Finalizado',
    orders: PackageHistoryItem[]
  ) => {
    const filtered = orders.filter((order) =>
      status === 'Em andamento' ? order.status !== 'received' : order.status === 'received'
    );
    setFilteredOrders(filtered);
  };

  const handleOrderDetail = (item_id: string) => {
    if (clientId) {
      router.push({
        pathname: '/orderDetail',
        params: {
          client_id: clientId,
          product_id: item_id,
        },
      });
    }
  };

  useEffect(() => {
    getClientId();
  }, []);

  useEffect(() => {
    filterOrdersByStatus(selectedTab, packageHistory);
  }, [selectedTab, packageHistory]);

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

  return (
    <HistoryContainer>
      <TabsContainer>
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
            <LogoContainer>
              <StyledLogo />
              <View>
                <HistoryTitleText>Pedido {item.id}</HistoryTitleText>
                <HistoryText>
                  Previsão de chegada:{' '}
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
                  <HistoryText>{getLastAction(item.delivery_actions).action}</HistoryText>
                  <HistoryText>
                    {getLastAction(item.delivery_actions).timestamp}
                  </HistoryText>
                </ActionContainer>
              </View>
            </LogoContainer>
          </HistoryItem>
        </TouchableOpacity>
      ))}
      <Button title="Voltar" onPress={handleBack} />
    </HistoryContainer>
  );
}
