import React, { useState, useEffect } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';


const HistoryContainer = styled(View)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
`;

const HistoryItem = styled(View)`
  background-color: #ffffff;
  padding: 15px;
  margin-vertical: 10px;
  border-radius: 8px;
  width: 90%;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const HistoryText = styled(Text)`
  color: #333333;
  font-size: 14px;
`;

interface PackageHistoryItem {
  id: string;
  status: string;
  client_id: string;
  creation_date: Timestamp;
}

export default function History() {
  const router = useRouter();
  const { client_id } = useLocalSearchParams<{ client_id: string }>();

  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);
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
      })) as PackageHistoryItem[];
      setPackageHistory(newEntries);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  function handleBack() {
    router.back(); 
  }

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

  return (
    <HistoryContainer>
      {packageHistory.map((item, index) => (
          <HistoryItem key={index}>
            <HistoryText>ID do produto: {item.id}</HistoryText>
            <HistoryText>Status: {item.status}</HistoryText>
            <HistoryText>Data de compra: {item.creation_date.toDate().toLocaleString()}</HistoryText>
            <Button title="Acompanhar" onPress={() => handleOrderDetail(item.id)} />
          </HistoryItem>
      ))}
      <Button title="Voltar" onPress={handleBack} />
    </HistoryContainer>
  );
}
