import React, { useState, useEffect } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, Button, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg'; // Importando o SVG como componente

const HistoryContainer = styled(View)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0px;
  padding: 10px;
  background-color: #f5f5f5;
  height: 100%;
`;

const HistoryItem = styled(View)`
  background-color: #ffffff;
  padding: 20px;
  margin-vertical: 10px;
  border-radius: 20px;
  width: 700px;
  flex-direction: row;
  align-items: center;
`;

const HistoryText = styled(Text)`
  color: #3A3A3A;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 1px;
  display: block;
  margin-right: 10px;
`;

const HistoryTitleText = styled(Text)`
  color: #3A3A3A;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
`;

interface SelectionTextProps {
  isSelected: boolean;
}

const SelectionText = styled(Text)<SelectionTextProps>`
    margin-top: 20px;
    color: ${({ isSelected }) => (isSelected ? '#FA4A0C' : '#9A9A9D')};
    font-size: 14px;
    text-decoration: none;
    padding-bottom: 16px;
    border-bottom-width: ${({ isSelected }) => (isSelected ? '3px' : '0')};
    border-bottom-color: ${({ isSelected }) => (isSelected ? '#FA4A0C' : 'transparent')}; 
    margin-right: 20px;
`;

const LogoContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const StyledLogo = styled(Logo)`
  width: 100px;
  height: 100px;
  margin-right: 10px;
`;

const ActionDot = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
`;

const ActionContainer = styled(View)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between; /* Adiciona espaço entre os itens */
`;

interface ActionDotProps {
  status: string;
}

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

interface DeliveryAction {
  action: string;
  timestamp: Timestamp;
}

interface PackageHistoryItem {
  id: string;
  status: string;
  client_id: string;
  creation_date: Timestamp;
  delivery_actions: { [key: string]: DeliveryAction };
}

export default function History() {
  const router = useRouter();
  const { client_id } = useLocalSearchParams<{ client_id: string }>();

  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'Em andamento' | 'Finalizado'>('Em andamento');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fetchHistoryFromFirebase = async () => {
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
      })) as PackageHistoryItem[];
      setPackageHistory(newEntries);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  function handleBack() {
    router.back(); 
  }

  const filteredOrders = packageHistory.filter(order =>
    selectedTab === 'Em andamento' ? order.status !== 'recebido' : order.status === 'recebido'
  );

  function handleOrderDetail(item_id: string) {
    router.push({
      pathname: '/orderDetail',
      params: {
        client_id: client_id,
        product_id: item_id,
      },
    });
  }

  useEffect(() => {
    fetchHistoryFromFirebase();
  }, []);

  const getLastAction = (delivery_actions: { [key: string]: DeliveryAction }) => {
    const actions = Object.values(delivery_actions);
    if (actions.length === 0) return { action: 'Nenhuma ação disponível', timestamp: '' };

    actions.sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime());
    const lastAction = actions[0];
    return {
      action: lastAction.action,
      timestamp: format(lastAction.timestamp.toDate(), "dd/MM/yyyy HH:mm", { locale: ptBR })
    };
  };

  return (
    <HistoryContainer>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => setSelectedTab('Em andamento')}>
          <SelectionText isSelected={selectedTab === 'Em andamento'}>Em andamento</SelectionText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Finalizado')}>
          <SelectionText isSelected={selectedTab === 'Finalizado'}>Finalizado</SelectionText>
        </TouchableOpacity>
      </View>

      {filteredOrders.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => handleOrderDetail(item.id)}>
          <HistoryItem>
            <LogoContainer>
              <StyledLogo />
              <View>
                <HistoryTitleText>Pedido {item.id}</HistoryTitleText>
                <HistoryText>Previsão de chegada: {format(item.creation_date.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</HistoryText>
                <ActionContainer>
                  <ActionDot style={{ backgroundColor: getStatusColor(item.status.toLowerCase()) }} />
                  <HistoryText>
                      {getLastAction(item.delivery_actions).action}
                  </HistoryText>
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
