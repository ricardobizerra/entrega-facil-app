import React, { useState, useEffect } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const OrderDetailContainer = styled(View)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
`;

const OrderDetailItem = styled(View)`
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

const OrderDetailText = styled(Text)`
  color: #333333;
  font-size: 14px;
`;

interface PackageOrderDetailItem {
  id: string;
  status: string;
  client_id: string;
  creation_date: Timestamp;
  delivery_actions: { [key: string]: { action: string; timestamp: Timestamp } };
}

export default function OrderDetail() {
  const router = useRouter();
  const { client_id, product_id } = useLocalSearchParams<{ client_id: string, product_id: string }>();

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
      setPackageOrderDetail(newEntries);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  function handleBack() {
    router.back();
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

  return (
    <OrderDetailContainer>
      {packageOrderDetail.map((item, index) => (
        <OrderDetailItem key={index}>
          <OrderDetailText>ID do produto: {item.id}</OrderDetailText>
          <OrderDetailText>Status: {item.status}</OrderDetailText>
          <OrderDetailText>Data de compra: {item.creation_date.toDate().toLocaleString()}</OrderDetailText>
          
          {/* Rendering delivery_actions */}
          <View>
            <Text>Acompanhe seu pedido:</Text>
            {Object.keys(item.delivery_actions).map((key, actionIndex) => (
              <View key={actionIndex}>
                <Text>{item.delivery_actions[key].action}</Text>
                <Text>Data: {item.delivery_actions[key].timestamp.toDate().toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </OrderDetailItem>
      ))}
      <Button title="Voltar" onPress={handleBack} />
    </OrderDetailContainer>
  );
}
