import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import SendScreen from './src/screens/SendScreen/SendScreen';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import {ActivityIndicator, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import Contexts from './src/Contexts/Contexts';
import ReceiveScreen from './src/screens/ReceiveScreen/ReceiveScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from './src/Components/Spinner/Spinner';

const Stack = createStackNavigator();

export default function App() {
  const {
    handleGlobalSpinner,
    globalSpinner,
    isLoggedIn,
    setIsLoggedIn,
    setStoredBitcoinData,
  } = useContext(Contexts);
  const [loading, setLoading] = useState(false);

  const getAsyncBitcoinData = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem('bitcoin_async_data');
      if (data) {
        setIsLoggedIn(true);
        const newData = await JSON.parse(data);
        setStoredBitcoinData(newData);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAsyncBitcoinData();
  }, [isLoggedIn]);

  const renderGlobalLoader = () => (
    <Modal
      onRequestClose={() => handleGlobalSpinner(false)}
      supportedOrientations={['landscape', 'portrait']}
      transparent
      visible={globalSpinner}
      statusBarTranslucent
      style={{marginHorizontal: 0, marginVertical: 0}}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4272B6',
            width: 140,
            height: 110,
            borderRadius: 10,
          }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: '#fff', fontSize: 18, marginTop: 10}}>
            Loading...
          </Text>
        </View>
      </View>
    </Modal>
  );

  const loadLoginNavigator = () => (
    <Stack.Screen name="Login" component={LoginScreen} />
  );

  const loadLoggedInNavigator = () => (
    <>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SendScreen" component={SendScreen} />
      <Stack.Screen name="ReceiveScreen" component={ReceiveScreen} />
    </>
  );
  return loading ? (
    <Spinner />
  ) : (
    <>
      {renderGlobalLoader()}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isLoggedIn ? loadLoggedInNavigator() : loadLoginNavigator()}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
