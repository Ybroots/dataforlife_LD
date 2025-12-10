import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ContactsScreen from './src/screens/ContactsScreen';
import MapScreen from './src/screens/MapScreen';
import CommuneDetailScreen from './src/screens/CommuneDetailScreen';
import { 
  importCommunes,
  importContacts,
  importAll
} from './src/scripts';
import { Commune } from './src/models';

export type RootStackParamList = {
  ContactsList: undefined;
  CommuneDetail: { communeInfo: Commune };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const MapStack = createNativeStackNavigator();

// Màu chủ đạo của app
const PRIMARY_COLOR = '#dc3545';

// ===========================
// Contacts Stack (header nhỏ)
// ===========================
function ContactsStack() {
  const [importModalVisible, setImportModalVisible] = React.useState(false);

  const handleImport = async (type: string) => {
    setImportModalVisible(false);
    
    try {
      switch (type) {
        case 'contacts':
          await importContacts();
          Alert.alert('Thành công', 'Đã import contacts lên Firebase!');
          break;
        case 'communes':
          await importCommunes();
          Alert.alert('Thành công', 'Đã import communes lên Firebase!');
          break;
        case 'all':
          await importAll();
          Alert.alert('Thành công', 'Đã import tất cả dữ liệu lên Firebase!');
          break;
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể import dữ liệu');
    }
  };

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
          title: 'Công an tỉnh Lâm Đồng',
          headerRight: () => (
            <>
              {/* <TouchableOpacity
                style={styles.importButton}
                onPress={() => setImportModalVisible(true)}
              >
                <Text style={styles.importButtonText}>Import Test Data</Text>
              </TouchableOpacity> */}

              <Modal
                animationType="fade"
                transparent={true}
                visible={importModalVisible}
                onRequestClose={() => setImportModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Import dữ liệu</Text>
                    <Text style={styles.modalSubtitle}>Chọn nguồn dữ liệu để import:</Text>

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => handleImport('contacts')}
                    >
                      <Text style={styles.modalButtonText}>Import Contacts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => handleImport('communes')}
                    >
                      <Text style={styles.modalButtonText}>Import Communes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => handleImport('all')}
                    >
                      <Text style={styles.modalButtonText}>Import Tất cả</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setImportModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          ),
        })}
      />

      <Stack.Screen
        name="CommuneDetail"
        component={CommuneDetailScreen}
        options={({ route }) => ({
          title: `Chi tiết ${route.params?.communeInfo?.ten_xa || ''}`,
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
        options={{
          title: 'Bản đồ Công an tỉnh Lâm Đồng',
        }}
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
            tabBarIcon: ({ color, size }) => {
              if (route.name === 'Danh bạ') {
                return <AntDesign name="contacts" size={size} color={color} />;
              } else if (route.name === 'Bản đồ') {
                return <FontAwesome name="map-o" size={size} color={color} />;
              }
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


const styles = StyleSheet.create({
  importButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
    marginRight: 10,
  },
  importButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginTop: 5,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
});
