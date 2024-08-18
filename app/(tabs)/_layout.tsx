import { Tabs } from 'expo-router';
import React from 'react';
import styled from 'styled-components/native';
import { View, Text, SafeAreaView } from 'react-native';

import Order from '@/assets/images/delivery_dining-stroke.svg';
import OrderFocused from '@/assets/images/delivery_dining.svg';
import Home from '@/assets/images/home-stroke.svg';
import HomeFocused from '@/assets/images/home.svg';
import Perfil from '@/assets/images/perfil.svg';
import PerfilFocused from '@/assets/images/perfil-focused.svg';
import Focus from '@/assets/images/home-indicator.svg';

const IconContainer = styled(View)`
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 60px;
`;

const FocusBar = styled(Focus)`
  margin-bottom: 10px;
`;

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#8e8e8e',
          headerShown: false,
          tabBarStyle: {
            height: 100,
            backgroundColor: '#FFF',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            borderTopWidth: 0,
            elevation: 10,
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: -4 },
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="HomeScreen"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <IconContainer>
                {focused && <FocusBar />}
                {focused ? <HomeFocused /> : <Home />}
                <Text style={{ color: focused ? '#000' : '#8e8e8e' }}>Início</Text>
              </IconContainer>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <IconContainer>
                {focused && <FocusBar />}
                {focused ? <OrderFocused /> : <Order />}
                <Text style={{ color: focused ? '#000' : '#8e8e8e' }}>Pedidos</Text>
              </IconContainer>
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <IconContainer>
                {focused && <FocusBar />}
                {focused ? <PerfilFocused /> : <Perfil />}
                <Text style={{ color: focused ? '#000' : '#8e8e8e' }}>Perfil</Text>
              </IconContainer>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
