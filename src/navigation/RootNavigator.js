import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TodayScreen from '../screens/TodayScreen';
import KazaScreen from '../screens/KazaScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import AddCustomItemScreen from '../screens/AddCustomItemScreen';
import BackupScreen from '../screens/BackupScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const TAB_ICONS = { Bugün: '✅', Geçmiş: '🕰️', Kategoriler: '📚', İstatistik: '📊', Ayarlar: '⚙️' };

function icon(routeName) {
  return ({ color }) => <Text style={{ fontSize: 18, color }}>{TAB_ICONS[routeName]}</Text>;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: icon(route.name),
      })}
    >
      <Tab.Screen name="Bugün" component={TodayScreen} />
      <Tab.Screen name="Geçmiş" component={KazaScreen} />
      <Tab.Screen name="Kategoriler" component={CategoriesScreen} />
      <Tab.Screen name="İstatistik" component={StatsScreen} />
      <Tab.Screen name="Ayarlar" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'İbadet Detayı' }} />
        <Stack.Screen name="AddCustomItem" component={AddCustomItemScreen} options={{ title: 'İlave İbadet Ekle' }} />
        <Stack.Screen name="Backup" component={BackupScreen} options={{ title: 'Yedekle / Geri Yükle' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
