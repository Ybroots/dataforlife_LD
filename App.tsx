import * as React from 'react';
import { Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar, View, Text, Image, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ContactsScreen from './src/screens/ContactsScreen';
import MapScreen from './src/screens/MapScreen';
import CommuneDetailScreen from './src/screens/CommuneDetailScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import { Commune } from './src/models';

export type RootStackParamList = {
  ContactsList: undefined;
  CommuneDetail: { communeInfo: Commune };
  PrivacyPolicy: undefined;
  MapMain: undefined;
};

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 2;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const MapStack = createNativeStackNavigator<RootStackParamList>();

// Màu chủ đạo của app
const PRIMARY_COLOR = '#dc3545';

// ===========================
// Contacts Stack (header nhỏ)
// ===========================
function ContactsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: PRIMARY_COLOR,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="ContactsList"
        component={ContactsScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('./assets/images/logo.png')}
                style={{ width: 30, height: 30, marginRight: 8, borderRadius: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                Công an tỉnh Lâm Đồng
              </Text>
            </View>
          ),
          headerTitleAlign: 'left',
          // headerRight: () => (
          //   <Pressable 
          //     onPress={() => navigation.navigate('PrivacyPolicy')} 
          //     style={{ padding: 8 }}
          //   >
          //     <AntDesign name="info-circle" size={22} color="#fff" />
          //   </Pressable>
          // ),
        })}
      />

      <Stack.Screen
        name="CommuneDetail"
        component={CommuneDetailScreen}
        options={({ route, navigation }) => ({
          title: `Chi tiết ${route.params?.communeInfo?.ten_xa || ''}`,
          headerBackVisible: false,

          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ paddingRight: 20 }}
            >
              <AntDesign name="arrow-left" size={24} color="#fff" />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={({ navigation }) => ({
          title: 'Chính sách quyền riêng tư',
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ paddingRight: 20 }}
            >
              <AntDesign name="arrow-left" size={24} color="#fff" />
            </Pressable>
          ),
        })}
      />
    </Stack.Navigator>
  );
}


// ===========================
// Map Stack (header nhỏ)
// ===========================
function MapStackScreen() {
  return (
    <MapStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: PRIMARY_COLOR,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20,
        },
      }}
    >
      <MapStack.Screen
        name="MapMain"
        component={MapScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('./assets/images/logo.png')}
                style={{ width: 30, height: 30, marginRight: 8, borderRadius: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                Công an tỉnh Lâm Đồng
              </Text>
            </View>
          ),
          headerTitleAlign: 'left',
          // headerRight: () => (
          //   <Pressable 
          //     onPress={() => navigation.navigate('PrivacyPolicy')} 
          //     style={{ padding: 8 }}
          //   >
          //     <AntDesign name="info-circle" size={22} color="#fff" />
          //   </Pressable>
          // ),
        })}
      />

      <MapStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={({ navigation }) => ({
          title: 'Chính sách quyền riêng tư',
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ paddingRight: 20 }}
            >
              <AntDesign name="arrow-left" size={24} color="#fff" />
            </Pressable>
          ),
        })}
      />
    </MapStack.Navigator>
  );
}


// ===========================
// App chính
// ===========================
export default function App() {
  return (
    <SafeAreaProvider>

      {/* Header màu đỏ đúng chuẩn */}
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />

      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: PRIMARY_COLOR,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              height: 80,
              paddingBottom: 15,
              paddingTop: 0,
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              backgroundColor: '#fff',
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 5,
            },
            tabBarIcon: ({ color, size, focused }) => {
              let icon;
              if (route.name === 'Danh bạ') {
                icon = <AntDesign name="contacts" size={size} color={color} />;
              } else if (route.name === 'Bản đồ') {
                icon = <FontAwesome name="map-o" size={size} color={color} />;
              }

              return (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: TAB_WIDTH,
                  height: '100%',
                }}>
                  {focused && (
                    <View style={{
                      position: 'absolute',
                      top: -6,
                      height: 3,
                      width: '100%',
                      backgroundColor: PRIMARY_COLOR,
                    }} />
                  )}
                  {icon}
                </View>
              );
            },
          })}
        >
          <Tab.Screen name="Danh bạ" component={ContactsStack} />
          <Tab.Screen name="Bản đồ" component={MapStackScreen} />
        </Tab.Navigator>
      </NavigationContainer>

    </SafeAreaProvider>
  );
}
