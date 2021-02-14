import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import SendScreen from './src/screens/SendScreen/SendScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Contexts from './src/Contexts/Contexts';
import generateRandomTestnet from './src/Helper/generateRandomTestnet';

const Stack = createStackNavigator();

export default function App() {
  const {setStoredBitcoinData} = useContext(Contexts);

  // bitcoin data from asyncStorage
  const getAsyncData = async () => {
    try {
      const data = await AsyncStorage.getItem('bitcoin');
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (error) {
      console.log(error);
    }
  };

  // generate random address
  // store bitcoin address , wif and private key to AsyncStorage
  const generateRandomAndStoreData = async () => {
    const data = generateRandomTestnet();
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem('bitcoin', jsonValue);
      setStoredBitcoinData(data);
    } catch (e) {
      console.log(e);
    }
  };

  // first load
  useEffect(() => {
    const getData = async () => {
      const asyncData = await getAsyncData();
      // if data exist already
      // set data to context
      if (asyncData) {
        setStoredBitcoinData(asyncData);
      }

      // if dosen't already
      // create random and store data

      if (!asyncData) {
        generateRandomAndStoreData();
      }
    };
    getData();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SendScreen" component={SendScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
