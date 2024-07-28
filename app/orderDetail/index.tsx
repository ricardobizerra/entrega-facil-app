import React, { useState, useEffect } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/assets/images/logo-no-text.svg';

const OrderDetailContainer = styled(View)`
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 10px;
  background-color: #ffffff;
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

const ActionDot = styled(View)<{ isLastDot?: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 7px;
  background-color: ${props => (props.isLastDot ? '#000' : '#3ACB48')}; /* Black if last dot, green otherwise */
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
  margin-right: 50px
`;

interface PackageOrderDetailItem {
  id: string;
  status: string;
  client_id: string;
  creation_date: Timestamp;
  arrival_date: Timestamp;
  delivery_actions: { [key: string]: { action: string; timestamp: Timestamp } };
  address: string; // Add the address attribute
}

interface OrderDetailProps {
  client_id: string | null; // Define client_id as a prop
  product_id: string;
  closeModal: () => void; // Add closeModal prop
}

const OrderDetail: React.FC<OrderDetailProps> = ({ client_id, product_id, closeModal }) => {
  const router = useRouter();
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
        <View key={index}>
          <OrderDetailIcon>
            <LogoImage/>
            <View>
              <OrderTitleText>Status do pedido</OrderTitleText>
              <OrderTitleText>Produto {item.id}</OrderTitleText>
              <OrderDetailText>Previsão de entrega:{' '}
                {format(item.arrival_date.toDate(), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </OrderDetailText>
              <OrderDetailText>Endereço: {item.address}</OrderDetailText>
            </View>
          </OrderDetailIcon>
          <View>          
            {/* Rendering delivery_actions */}
            {Object.keys(item.delivery_actions).map((key, actionIndex) => (
              <OrderDetailItem key={actionIndex}>
                <ActionDot isLastDot={actionIndex === Object.keys(item.delivery_actions).length - 1 && item.status === 'sent'} />
                <ActionTextContainer>
                  <Text>{item.delivery_actions[key].action}</Text>
                  <Text>{format(item.delivery_actions[key].timestamp.toDate(), "dd/MM/yyyy HH:mm")}</Text>
                </ActionTextContainer>
              </OrderDetailItem>
            ))}
          </View>
        </View>
      ))}
    </OrderDetailContainer>
  );
}

export default OrderDetail;
