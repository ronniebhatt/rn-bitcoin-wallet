import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import SendScreen from './src/screens/SendScreen/SendScreen';
import MnemonicScreen from './src/screens/LoginScreen/MnemonicScreen';
import {ActivityIndicator, Text, View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import Contexts from './src/Contexts/Contexts';
import ReceiveScreen from './src/screens/ReceiveScreen/ReceiveScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from './src/Components/Spinner/Spinner';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';

AntDesign.loadFont();
Feather.loadFont();
const Stack = createStackNavigator();

export default function App() {
  const {
    handleGlobalSpinner,
    globalSpinner,
    isLoggedIn,
    setIsLoggedIn,
    setStoredBitcoinData,
    setUsedAndUnusedData,
    setChangeAddress,
    setMnemonicRoot,
    setUsedAndUnusedChangeData,
  } = useContext(Contexts);
  const [loading, setLoading] = useState(false);

  // get bitcoin data from async
  const getAsyncBitcoinData = async () => {
    setLoading(true);
    try {
      // get bitcoin address from async
      const data = await AsyncStorage.getItem('bitcoin_async_data');
      const parsedAddress = JSON.parse(data);
      // get usedUnusedAddress object from async
      const usedUnused = await AsyncStorage.getItem('usedUnusedAddress');
      setUsedAndUnusedData(JSON.parse(usedUnused));

      // get used unused change object from async
      const usedUnusedChange = await AsyncStorage.getItem(
        'usedUnusedChangeAddress',
      );
      setUsedAndUnusedChangeData(JSON.parse(usedUnusedChange));
      // get changeAddress from from async
      const changedAddressAsync = await AsyncStorage.getItem('change_address');
      const parsedChangedAddressAsync = JSON.parse(changedAddressAsync);

      setChangeAddress(parsedChangedAddressAsync);
      // set mnemonic root
      const mnemonicRoot = await AsyncStorage.getItem('mnemonic_root');
      setMnemonicRoot(mnemonicRoot);

      //check if has existing bitcoin data on async
      if (data) {
        setStoredBitcoinData({
          address: parsedAddress.address,
        });
        setIsLoggedIn(true);
        handleGlobalSpinner(false);
      }

      //check if it don't have existing bitcoin data on async
      if (!data) {
        setIsLoggedIn(false);
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

  // Loader
  const renderGlobalLoader = () => (
    <Modal
      onRequestClose={() => handleGlobalSpinner(false)}
      supportedOrientations={['landscape', 'portrait']}
      transparent
      visible={globalSpinner}
      statusBarTranslucent
      style={{marginHorizontal: 0, marginVertical: 0}}>
      <View style={styles.loaderOuterContainer}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: '#fff', fontSize: 18, marginTop: 10}}>
            Loading...
          </Text>
        </View>
      </View>
    </Modal>
  );

  const loadLoginNavigator = () => (
    <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MnemonicScreen" component={MnemonicScreen} />
    </>
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

const styles = StyleSheet.create({
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4272B6',
    width: 140,
    height: 110,
    borderRadius: 10,
  },
  loaderOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
