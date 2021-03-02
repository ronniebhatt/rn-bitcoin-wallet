import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import SendScreen from './src/screens/SendScreen/SendScreen';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import {ActivityIndicator, Text, View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import Contexts from './src/Contexts/Contexts';
import ReceiveScreen from './src/screens/ReceiveScreen/ReceiveScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from './src/Components/Spinner/Spinner';
import generateUtxos from './src/Helper/generateUtxos';
import AntDesign from 'react-native-vector-icons/AntDesign';

AntDesign.loadFont();
const Stack = createStackNavigator();

export default function App() {
  const {
    handleGlobalSpinner,
    globalSpinner,
    isLoggedIn,
    setIsLoggedIn,
    setStoredBitcoinData,
    setUtxos,
    setBitcoinBalance,
    setUsedAndUnusedData,
    setChangeAddress,
    setMnemonicRoot,
  } = useContext(Contexts);
  const [loading, setLoading] = useState(false);
  const utxoArray = [];
  let balance = 0;

  // get bitcoin data from async
  const getAsyncBitcoinData = async () => {
    setLoading(true);
    try {
      // get bitcoin address from async
      const data = await AsyncStorage.getItem('bitcoin_async_data');
      const parsedAddress = JSON.parse(data);
      // get usedUnusedAddress object from async
      const usedUnused = await AsyncStorage.getItem('usedUnusedAddress');
      const parsedUsedAndUnused = JSON.parse(usedUnused);
      // get changeAddress from from async
      const changedAddressAsync = await AsyncStorage.getItem('change_address');
      setChangeAddress(changedAddressAsync);
      // set mnemonic root
      const mnemonicRoot = await AsyncStorage.getItem('mnemonic_root');
      setMnemonicRoot(mnemonicRoot);

      //check if has existing bitcoin data on async
      if (data) {
        // get utxos

        await generateUtxos(
          parsedUsedAndUnused,
          setBitcoinBalance,
          setUtxos,
          utxoArray,
          balance,
        );

        // check if all list is used or not
        const usedAddress = [];
        Object.keys(parsedUsedAndUnused).map((el) => {
          if (parsedUsedAndUnused[el].is_used) {
            usedAddress.push(true);
          }
        });

        if (usedAddress.length === Object.keys(parsedUsedAndUnused).length) {
          // has no unused data navigate to login screen
          setIsLoggedIn(false);
          return;
        }
        if (usedAddress.length !== Object.keys(parsedUsedAndUnused).length) {
          // login with the new address (next address)
          if (parsedUsedAndUnused[parsedAddress.address].is_used) {
            // change to next address
            Object.keys(parsedUsedAndUnused).map((el) => {
              if (!parsedUsedAndUnused[el].is_used) {
                setStoredBitcoinData({
                  address: parsedUsedAndUnused[el].address,
                });
                AsyncStorage.setItem(
                  'bitcoin_async_data',
                  JSON.stringify({
                    address: parsedUsedAndUnused[el].address,
                  }),
                );
                setUsedAndUnusedData(parsedUsedAndUnused);
                setIsLoggedIn(true);
                handleGlobalSpinner(false);
              }
            });
          }

          // login with the same address
          if (!parsedUsedAndUnused[parsedAddress.address].is_used) {
            setUsedAndUnusedData(parsedUsedAndUnused);
            setStoredBitcoinData({
              address: parsedAddress.address,
            });
            AsyncStorage.setItem(
              'bitcoin_async_data',
              JSON.stringify({
                address: parsedAddress.address,
              }),
            );
            setIsLoggedIn(true);
            handleGlobalSpinner(false);
          }
        }
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
