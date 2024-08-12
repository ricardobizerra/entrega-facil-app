import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import Order from '@/assets/images/delivery_dining-stroke.svg'; // Import the custom tab bar icon component
import OrderFocused from '@/assets/images/delivery_dining.svg'; // Import the custom tab bar icon component
import Home from '@/assets/images/home-stroke.svg'; // Import the custom tab bar icon component
import HomeFocused from '@/assets/images/home.svg'; // Import the custom tab bar icon component
import Perfil from '@/assets/images/perfil.svg'; // Import the custom tab bar icon component
import PerfilFocused from '@/assets/images/perfil-focused.svg'; // Import the custom tab bar icon component
import styled from 'styled-components';
import { View, Text } from 'react-native';
import Focus from '@/assets/images/home-indicator.svg'; // Import the custom tab bar icon component

const IconContainer = styled(View)`
  align-items: center;
  justify-content: center;
  height: 60x;
  width: 60px;
`;

const FocusBar = styled(Focus)`
  margin-bottom: 10px;
`;


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        headerShown: false,
        tabBarStyle: {
          height: 150,
          backgroundColor: '#fff',
          borderTopStartRadius: 30,
          borderTopEndRadius: 30,}
      }}>
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: '',
          tabBarIcon: ({focused} : { focused: boolean}) => {
            return(
              <IconContainer>
                {focused? <FocusBar/> : ''}
                {focused? <HomeFocused/> : <Home/>}
                <Text>Início</Text>
              </IconContainer>
            )},
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '',
          tabBarIcon: ({focused} : { focused: boolean}) => {
            return(
              <IconContainer>
                {focused? <FocusBar/> : ''}
                {focused? <OrderFocused/> : <Order/>}
                <Text>Pedidos</Text>
              </IconContainer>
            )},
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: '',
          tabBarIcon: ({focused} : { focused: boolean}) => {
            return(
              <IconContainer>
                {focused? <FocusBar/> : ''}
                {focused? <PerfilFocused/> : <Perfil/>}
                <Text>Perfil</Text>
              </IconContainer>
            )},
        }}
      />
    </Tabs>
  );
}
