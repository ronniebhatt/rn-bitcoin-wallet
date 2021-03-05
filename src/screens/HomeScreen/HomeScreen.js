import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import TransactionCard from '../../Components/TransactionCard/TransactionCard';
import styles from './styles';
import Contexts from '../../Contexts/Contexts';
import Spinner from '../../Components/Spinner/Spinner';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {LOGO_URL} from '../../api/bitcoin/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import generateUtxos from '../../Helper/generateUtxos';
import {FlatList} from 'react-native-gesture-handler';

export default function HomeScreen({navigation}) {
  const [bitcoinData, setBitcoinData] = useState(null);
  const {
    storedBitcoinData,
    setStoredBitcoinData,
    setIsLoggedIn,
    bitcoinBalance,
    setBitcoinBalance,
    setUtxos,
    usedAndUnusedData,
    usedAndUnusedChangeData,
    setUsedAndUnusedData,
    setRegularAddressUtxo,
    setChangeAddressUtxo,
    regularAddressUtxo,
    changeAddressUtxo,
    utxos,
  } = useContext(Contexts);
  const [refreshing, setRefreshing] = useState(false);
  const utxoArray = [];
  const changeUtxoArray = [];
  let balance = 0;

  // handle pull to refresh
  const onRefresh = async () => {
    console.log('on refresh');
    if (storedBitcoinData) {
      setRefreshing(true);
      getBitcoinData(storedBitcoinData.address);
      getAllUtoxos();
      setRefreshing(false);
    }
  };

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      setBitcoinData(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  // initial load
  useEffect(() => {
    if (storedBitcoinData) {
      getBitcoinData(storedBitcoinData.address);
    }
  }, [storedBitcoinData]);

  const getAsyncBitcoinData = async () => {
    try {
      const data = await AsyncStorage.getItem('bitcoin_async_data');
      if (data) {
        const newData = await JSON.parse(data);
        setStoredBitcoinData(newData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAsyncBitcoinData();
  }, []);

  useEffect(() => {
    getAllUtoxos();
    console.log('usedAndUnusedChangeData', usedAndUnusedChangeData);
  }, [usedAndUnusedData, usedAndUnusedChangeData]);

  const handleLogout = async () => {
    setBitcoinBalance(0);
    setUtxos([]);
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  useEffect(() => {
    console.log('bitcoinData----', bitcoinData, usedAndUnusedData);

    if (bitcoinData && bitcoinData.txs.length !== 0) {
      // change to next unused addresss
      console.log('change to next unused addresss', usedAndUnusedData);

      const newUsedAndUnusedData = {...usedAndUnusedData};
      console.log('newUsedAndUnusedData', newUsedAndUnusedData);
      newUsedAndUnusedData[bitcoinData.address].is_used = true;
      setUsedAndUnusedData(newUsedAndUnusedData);
      AsyncStorage.setItem(
        'usedUnusedAddress',
        JSON.stringify(newUsedAndUnusedData),
      );

      const usedAddress = [];
      Object.keys(usedAndUnusedData).map((el) => {
        if (usedAndUnusedData[el].is_used) {
          usedAddress.push(true);
        }
      });
      if (usedAddress.length === Object.keys(usedAndUnusedData).length) {
        // has no unused data navigate to login screen
        setIsLoggedIn(false);
        return;
      }

      if (usedAddress.length !== Object.keys(usedAndUnusedData).length) {
        // login with the new address (next address)
        // change to next address
        Object.keys(usedAndUnusedData).map((el) => {
          if (!usedAndUnusedData[el].is_used) {
            setStoredBitcoinData({
              address: usedAndUnusedData[el].address,
            });
            AsyncStorage.setItem(
              'bitcoin_async_data',
              JSON.stringify({
                address: usedAndUnusedData[el].address,
              }),
            );
          }
        });
      }
    }
  }, [bitcoinData]);

  const getAllUtoxos = async () => {
    await generateUtxos(usedAndUnusedData, setRegularAddressUtxo, utxoArray);
    await generateUtxos(
      usedAndUnusedChangeData,
      setChangeAddressUtxo,
      changeUtxoArray,
    );
  };

  useEffect(() => {
    if (regularAddressUtxo && changeAddressUtxo) {
      const array = regularAddressUtxo.concat(changeAddressUtxo);
      array.map((el) => {
        balance += el.value;
      });
      setBitcoinBalance(balance);
      setUtxos(regularAddressUtxo.concat(changeAddressUtxo));
      console.log('---l--', regularAddressUtxo.concat(changeAddressUtxo));
    }
  }, [regularAddressUtxo, changeAddressUtxo]);

  return (
    <>
      {!bitcoinData && <Spinner />}
      {bitcoinData && (
        <View style={styles.container}>
          <SafeAreaView>
            <ScrollView
              style={styles.topContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              <View
                style={{
                  backgroundColor: '#265C7E',
                  paddingVertical: 10,
                }}>
                <Text
                  style={{color: '#fff', textAlign: 'center', fontSize: 12}}>
                  Pull to refresh
                </Text>
              </View>
              {/* TOP LOGO */}
              <Image
                style={styles.logo}
                resizeMode="contain"
                source={{
                  uri: LOGO_URL,
                }}
              />

              <TouchableOpacity
                onPress={handleLogout}
                style={{position: 'absolute', right: 15, top: 45}}>
                <AntDesign name="logout" size={30} />
              </TouchableOpacity>

              {/* CURRENT BALANCE */}
              <Text style={styles.balanceText}>Balance {bitcoinBalance}</Text>

              {/* CURRENT TESTNET ADDRESS */}
              <Text style={styles.btnAddressText}>
                {storedBitcoinData.address}
              </Text>

              <View style={styles.btnContainer}>
                <View style={{marginVertical: 20}}>
                  <CustomButton
                    text="SEND"
                    handleBtnClick={() => navigation.navigate('SendScreen')}
                  />
                </View>
                <CustomButton
                  text="RECEIVE"
                  handleBtnClick={() =>
                    navigation.navigate('ReceiveScreen', {
                      bitcoinData,
                    })
                  }
                />
              </View>
            </ScrollView>

            {/* TRANSACTION LIST CONTAINER */}
            <View style={styles.bottomContainer}>
              <Text style={styles.transactionText}>Unsigned Transactions</Text>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={utxos}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyTransactionContainer}>
                    <Text style={{color: '#fff'}}>No Transactions</Text>
                  </View>
                )}
                renderItem={({item}) => {
                  return (
                    <>
                      {/* rendering credited transaction */}
                      <TransactionCard
                        transactionID={item.txid}
                        amount={item.value}
                        isCredited={true}
                        confirmed={item.status.confirmed}
                      />
                    </>
                  );
                }}
              />
            </View>
          </SafeAreaView>
        </View>
      )}
    </>
  );
}
