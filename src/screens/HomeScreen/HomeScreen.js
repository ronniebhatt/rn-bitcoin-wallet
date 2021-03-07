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
import generateTransaction from '../../Helper/generateTransaction';
import moment from 'moment';

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
    allTransactions,
    setAllTransactions,
    regularAddressTransaction,
    setRegularAddressTransaction,
    changeAddressTransaction,
    setChangeAddressTransaction,
  } = useContext(Contexts);
  const [refreshing, setRefreshing] = useState(false);
  const utxoArray = [];
  const changeUtxoArray = [];
  const regularTransactionArray = [];
  const changeTransactionArray = [];
  let balance = 0;
  let senderAddress = {};

  // handle pull to refresh
  const onRefresh = async () => {
    if (storedBitcoinData) {
      setRefreshing(true);
      getBitcoinData(storedBitcoinData.address);
      getAllUtoxos();
      getAllTransactions();
      setRefreshing(false);
    }
  };

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      setBitcoinData(data.address);
      console.log('bitcoin', data.address);
      return data.address;
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
    getAllTransactions();
    console.log('usedAndUnusedData', usedAndUnusedData);
  }, [usedAndUnusedData, usedAndUnusedChangeData]);

  const handleLogout = async () => {
    setBitcoinBalance(0);
    setUtxos([]);
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };
  const sortKeys = (obj) => {
    return Object.assign(
      ...Object.entries(obj)
        .sort(function (a, b) {
          return obj[a[0]].index - obj[b[0]].index;
        })
        .map(([key, value]) => {
          return {
            [key]: value,
          };
        }),
    );
  };

  useEffect(() => {
    if (
      bitcoinData &&
      bitcoinData.transactions &&
      bitcoinData.transactions.length !== 0
    ) {
      // change to next unused addresss

      const newUsedAndUnusedData = {...usedAndUnusedData};
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
        handleLogout();
      }

      if (usedAddress.length !== Object.keys(usedAndUnusedData).length) {
        // login with the new address (next address)
        // change to next address

        const currentBitcoinIndex =
          usedAndUnusedData[bitcoinData.address].index;
        console.log('currentBitcoinIndex', currentBitcoinIndex);
        const nextAddress = Object.keys(sortKeys(usedAndUnusedData))[
          currentBitcoinIndex + 1
        ];
        console.log('currentBitcoinIndex', currentBitcoinIndex);

        setStoredBitcoinData({
          address: nextAddress,
        });
        AsyncStorage.setItem(
          'bitcoin_async_data',
          JSON.stringify({
            address: nextAddress,
          }),
        );
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
  const getAllTransactions = async () => {
    await generateTransaction(
      usedAndUnusedData,
      setRegularAddressTransaction,
      regularTransactionArray,
    );
    await generateTransaction(
      usedAndUnusedChangeData,
      setChangeAddressTransaction,
      changeTransactionArray,
    );
  };

  useEffect(() => {
    if (regularAddressUtxo && changeAddressUtxo) {
      const array = regularAddressUtxo.concat(changeAddressUtxo);
      array.map((el) => {
        if (el.status.confirmed) {
          balance += el.value;
        }
      });
      setBitcoinBalance(balance);
      setUtxos(regularAddressUtxo.concat(changeAddressUtxo));
    }
  }, [regularAddressUtxo, changeAddressUtxo]);

  useEffect(() => {
    if (regularAddressTransaction || changeAddressTransaction) {
      const concatedArray = regularAddressTransaction.concat(
        changeAddressTransaction,
      );
      const unique = [];

      concatedArray.map((x) =>
        unique.filter((a) => a.txid == x.txid).length > 0
          ? null
          : unique.push(x),
      );

      const newUnique = unique.sort(function (left, right) {
        return moment.unix(right.time).diff(moment.unix(left.time));
      });
      setAllTransactions(newUnique);
    }
  }, [regularAddressTransaction, changeAddressTransaction]);

  useEffect(() => {
    console.log('---allTransactions--', allTransactions);
  }, [allTransactions]);

  return (
    <>
      {!bitcoinData && <Spinner />}
      {bitcoinData && (
        <SafeAreaView style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.topContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View
              style={{
                backgroundColor: '#265C7E',
                paddingVertical: 10,
              }}>
              <Text style={{color: '#fff', textAlign: 'center', fontSize: 12}}>
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
            <Text style={styles.balanceText}>
              Balance {bitcoinBalance} sats
            </Text>

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
              <View style={{marginVertical: 10}}>
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
          </ScrollView>

          {/* TRANSACTION LIST CONTAINER */}
          <View style={styles.bottomContainer}>
            <Text style={styles.transactionText}>Transactions</Text>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={allTransactions}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyTransactionContainer}>
                  <Text>No Transactions</Text>
                </View>
              )}
              renderItem={({item}) => {
                const debitedArray = [];
                const creditedArray = [];

                // setting debited transaction to debitedArray
                item.inputs.map((input) => {
                  if (
                    Object.keys(sortKeys(usedAndUnusedData)).some((i) =>
                      input.addresses.includes(i),
                    )
                  ) {
                    debitedArray.push(input);
                  }
                  if (
                    Object.keys(sortKeys(usedAndUnusedChangeData)).some((i) =>
                      input.addresses.includes(i),
                    )
                  ) {
                    debitedArray.push(input);
                  }
                });

                // setting credited transaction to creditedArray
                item.outputs.map((output) => {
                  if (
                    Object.keys(sortKeys(usedAndUnusedData)).some((i) =>
                      output.addresses.includes(i),
                    )
                  ) {
                    creditedArray.push(output);
                  }
                  if (
                    Object.keys(sortKeys(usedAndUnusedChangeData)).some((i) =>
                      output.addresses.includes(i),
                    )
                  ) {
                    creditedArray.push(output);
                  }
                });

                // setting sender transaction to creditedArray
                item.outputs.map((output) => {
                  if (!output.addresses.includes(storedBitcoinData.address)) {
                    senderAddress[item.hash] = output;
                  }
                });

                return (
                  <>
                    {/* rendering credited transaction */}
                    {creditedArray.map((credit, index) => {
                      return (
                        <TransactionCard
                          key={index}
                          transactionID={item.hash}
                          amount={credit.value_int}
                          isCredited={true}
                          confirmations={item.confirmations}
                          date={item.time}
                        />
                      );
                    })}
                    {/* rendering debited transaction */}
                    {debitedArray.map((debit, index) => {
                      let finalValue = 0;
                      item.outputs.map((output) => {
                        console.log('output', output);
                        console.log('debit', debit);
                        if (
                          Object.keys(sortKeys(usedAndUnusedData)).some((i) =>
                            output.addresses.includes(i),
                          )
                        ) {
                          finalValue = debit.value_int - output.value_int;
                        } else {
                          finalValue = debit.value_int;
                        }
                        if (
                          Object.keys(
                            sortKeys(usedAndUnusedChangeData),
                          ).some((i) => output.addresses.includes(i))
                        ) {
                          finalValue = debit.value_int - output.value_int;
                        } else {
                          finalValue = debit.value_int;
                        }
                      });

                      return (
                        <TransactionCard
                          key={index}
                          transactionID={item.hash}
                          amount={finalValue}
                          isCredited={false}
                          confirmations={item.confirmations}
                          date={item.time}
                        />
                      );
                    })}
                  </>
                );
              }}
            />
          </View>
        </SafeAreaView>
      )}
    </>
  );
}
