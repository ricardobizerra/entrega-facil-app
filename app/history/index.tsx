import React, { useState } from 'react';
import { database } from '@/config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import styled from 'styled-components/native';
import { Text, Button, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

const HistoryContainer = styled(View)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const UpdateHistoryButton = styled(Button)`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  margin-bottom: 20px;
  border: none;
  border-radius: 5px;
`;

interface PackageHistoryItem {
  id: string;
  status: string;
  client_id: string;
}

interface HistoryProps {
  navigation: NavigationProp<any>;
}

export default function History({ navigation }: HistoryProps) {
  const [packageHistory, setPackageHistory] = useState<PackageHistoryItem[]>([]);

  const fetchHistoryFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(database, 'products'));
      const newEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PackageHistoryItem[];
      setPackageHistory([...packageHistory, ...newEntries]);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  return (
    <HistoryContainer>
      <UpdateHistoryButton title="Update History" onPress={fetchHistoryFromFirebase} />
      {packageHistory.map((item, index) => (
        <Text key={index}>{JSON.stringify(item)}</Text>
      ))}
    </HistoryContainer>
  );
}
