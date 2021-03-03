import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  FlatList,
  RefreshControl,
  TouchableOpacity,
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
    tx,
    usedAndUnusedChangeData,
    setUsedAndUnusedData,
  } = useContext(Contexts);
  const [refreshing, setRefreshing] = useState(false);
  const utxoArray = [];
  let balance = 0;

  let senderAddress = {};

  // handle pull to refresh
  const onRefresh = async () => {
    if (storedBitcoinData) {
      setRefreshing(true);
      getBitcoinData(storedBitcoinData.address);
      await generateUtxos(
        usedAndUnusedData,
        setBitcoinBalance,
        setUtxos,
        utxoArray,
        balance,
      );
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

  const handleLogout = async () => {
    setBitcoinBalance(0);
    setUtxos([]);
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const callFunction = async () => {
      console.log('normal----', usedAndUnusedData);
      console.log('usedAndUnusedChangeData----', usedAndUnusedChangeData);

      if (usedAndUnusedData) {
        await generateUtxos(
          usedAndUnusedData,
          setBitcoinBalance,
          setUtxos,
          utxoArray,
          balance,
        );
      }
    };
    callFunction();
  }, [usedAndUnusedData, usedAndUnusedChangeData]);

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

  return (
    <>
      {!bitcoinData && <Spinner />}
      {bitcoinData && (
        <View style={styles.container}>
          <SafeAreaView>
            <View style={styles.topContainer}>
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
                style={{position: 'absolute', right: 15, top: 15}}>
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
            </View>

            {/* TRANSACTION LIST CONTAINER */}
            <View style={styles.bottomContainer}>
              <Text style={styles.transactionText}>Transactions</Text>
              <Text style={{color: '#fff', textAlign: 'center', fontSize: 12}}>
                Pull to refresh
              </Text>

              <FlatList
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                data={tx}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyTransactionContainer}>
                    <Text style={{color: '#fff'}}>No Transactions</Text>
                  </View>
                )}
                contentContainerStyle={{paddingBottom: 750}}
                renderItem={({item}) => {
                  const debitedArray = [];
                  const creditedArray = [];

                  // setting debited transaction to debitedArray
                  item.inputs.map((input) => {
                    debitedArray.push(input);
                  });

                  // setting credited transaction to creditedArray
                  item.outputs.map((output) => {
                    creditedArray.push(output);
                  });

                  // setting sender transaction to creditedArray
                  item.outputs.map((output) => {
                    senderAddress[item.hash] = output;
                  });
                  return (
                    <>
                      {/* rendering credited transaction */}
                      {creditedArray.map((credit, index) => {
                        return (
                          <TransactionCard
                            key={index}
                            transactionID={item.hash}
                            amount={credit.value}
                            isCredited={true}
                            confirmations={item.confirmations}
                          />
                        );
                      })}

                      {/* rendering debited transaction */}
                      {debitedArray.map((debit, index) => {
                        let totalDeducted = 0;
                        if (senderAddress[item.hash]) {
                          totalDeducted = senderAddress[item.hash].value;
                        } else {
                          totalDeducted = debit.output_value;
                        }

                        return (
                          <TransactionCard
                            key={index}
                            transactionID={item.hash}
                            amount={totalDeducted}
                            isCredited={false}
                            confirmations={item.confirmations}
                          />
                        );
                      })}
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
