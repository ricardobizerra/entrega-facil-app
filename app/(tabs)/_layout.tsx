import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import Order from '@/assets/images/delivery_dining.svg'; // Import the custom tab bar icon component
import OrderFocused from '@/assets/images/delivery_dining_focused.svg'; // Import the custom tab bar icon component
import styled from 'styled-components';

const OrderIcon = styled (Order)`

`;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, focused }) => (
            <OrderFocused/>
          ),
        }}
      />
    </Tabs>
  );
}
