import React, {useState, useEffect, useContext} from 'react';
import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import TransactionCard from '../../Components/TransactionCard/TransactionCard';
import styles from './styles';
import Contexts from '../../Contexts/Contexts';
import Spinner from '../../Components/Spinner/Spinner';
import CustomButton from '../../Components/CustomButton/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import generateUtxos from '../../Helper/generateUtxos';
import {FlatList} from 'react-native-gesture-handler';
import generateTransaction from '../../Helper/generateTransaction';
import moment from 'moment';
import sortTransaction from '../../Helper/sortTransaction';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function HomeScreen({navigation}) {
  const [bitcoinData, setBitcoinData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unconfirmedBalance, setUnconfirmedBalance] = useState(0);
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
    allTransactions,
    setAllTransactions,
    regularAddressTransaction,
    setRegularAddressTransaction,
    changeAddressTransaction,
    setChangeAddressTransaction,
  } = useContext(Contexts);

  const utxoArray = [];
  const changeUtxoArray = [];
  const regularTransactionArray = [];
  const changeTransactionArray = [];
  let balance = 0;
  let unConfirmedBalance = 0;

  // handle pull to refresh
  const onRefresh = async () => {
    if (storedBitcoinData) {
      setRefreshing(true);
      getBitcoinData(storedBitcoinData.address);
      getAllUtxos();
      getAllTransactions();
      setRefreshing(false);
    }
  };

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      setBitcoinData(data.address);
      return data.address;
    } catch (error) {
      console.log(error);
    }
  };

  // -----------initial load----------
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

  // -----------initial load----------

  // --------- get all utxos and all address transactions

  useEffect(() => {
    getAllUtxos();
    getAllTransactions();
  }, [usedAndUnusedData, usedAndUnusedChangeData]);

  // --------- get all utxos and all address transactions

  // ---- handle logout----
  const handleLogout = async () => {
    setBitcoinBalance(0);
    setUtxos([]);
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };
  // ---- handle logout----

  // ---- handle change address if address is used----
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
        const nextAddress = Object.keys(sortTransaction(usedAndUnusedData))[
          currentBitcoinIndex + 1
        ];
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

  // ------- get utxos function ---------
  const getAllUtxos = async () => {
    await generateUtxos(usedAndUnusedData, setRegularAddressUtxo, utxoArray);
    await generateUtxos(
      usedAndUnusedChangeData,
      setChangeAddressUtxo,
      changeUtxoArray,
    );
  };

  // ------- get transaction function ---------
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

  // ---- get confirmed and unconfirmed balance
  useEffect(() => {
    if (regularAddressUtxo && changeAddressUtxo) {
      const unsignedTransaction = regularAddressUtxo.concat(changeAddressUtxo);
      unsignedTransaction.map((transaction) => {
        if (transaction.status.confirmed) {
          balance += transaction.value;
        }
        if (!transaction.status.confirmed) {
          unConfirmedBalance += transaction.value;
        }
      });
      setUnconfirmedBalance(unConfirmedBalance);
      setBitcoinBalance(balance);
      setUtxos(regularAddressUtxo.concat(changeAddressUtxo));
    }
  }, [regularAddressUtxo, changeAddressUtxo]);

  // ---- sort transaction lists -----
  useEffect(() => {
    if (regularAddressTransaction || changeAddressTransaction) {
      const concatedArray = regularAddressTransaction.concat(
        changeAddressTransaction,
      );
      const unique = [];

      concatedArray.map((x) =>
        unique.filter((a) => a.txid === x.txid).length > 0
          ? null
          : unique.push(x),
      );

      // temporary adding current time
      unique.forEach(function (el) {
        if (!el.time) {
          el.time = Date.now();
        }
      });

      // sorting by time
      const newUnique = unique.sort(function (left, right) {
        return moment.unix(right.time).diff(moment.unix(left.time));
      });

      setAllTransactions(newUnique);
    }
  }, [regularAddressTransaction, changeAddressTransaction]);

  return (
    <>
      {!bitcoinData && <Spinner />}
      {bitcoinData && (
        <SafeAreaView style={styles.container}>
          {/* header container */}
          <View style={styles.headerContainer}>
            <Ionicons name="reorder-three-outline" color="#000" size={40} />
            <Text style={styles.headerText}>Bitcoin Wallet</Text>
          </View>

          {/* bitcoin balance card */}
          <View style={styles.bitcoinBalanceCard}>
            <Text style={styles.balanceText}>{bitcoinBalance} SATS</Text>
            {unconfirmedBalance !== 0 && (
              <Text style={{alignSelf: 'center', marginVertical: 10}}>
                {`Unconfirmed Balance : ${unconfirmedBalance} sats`}
              </Text>
            )}
            <View style={styles.bottomTextContainer}>
              <FontAwesome5 name="bitcoin" size={30} />
              <Text style={styles.bottomText}>Bitcoin Wallet</Text>
            </View>
          </View>

          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={{
                height: 60,
                width: '50%',
                backgroundColor: '#fff',
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,

                elevation: 5,
              }}
              onPress={() => navigation.navigate('SendScreen')}>
              <Text>SEND</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 60,
                width: '50%',
                backgroundColor: '#fff',
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,

                elevation: 5,
                borderLeftWidth: 1,
                borderColor: 'rgba(0,0,0,0)',
              }}
              onPress={() =>
                navigation.navigate('ReceiveScreen', {
                  bitcoinData,
                })
              }>
              <Text>RECEIVE</Text>
            </TouchableOpacity>
          </View>

          {/* TRANSACTION LIST CONTAINER */}
          <View style={styles.bottomContainer}>
            <Text style={styles.transactionText}>Transactions</Text>

            <View style={styles.tabContainer}>
              <View style={styles.tabs}>
                <Text style={styles.tabsText}>All</Text>
              </View>
              <View style={styles.tabs}>
                <Text style={styles.tabsText}>Send</Text>
              </View>
              <View style={styles.tabs}>
                <Text style={styles.tabsText}>Received</Text>
              </View>
            </View>

            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={allTransactions}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyTransactionContainer}>
                  <Entypo name="wallet" size={80} color={'rgba(0,0,0,0.45)'} />
                  <Text style={{color: 'rgba(0,0,0,0.45)', fontSize: 22}}>
                    No Transactions
                  </Text>
                </View>
              )}
              renderItem={({item}) => {
                const debitedArray = [];
                const creditedArray = [];

                // setting debited transaction to debitedArray
                item.inputs.map((input) => {
                  if (
                    Object.keys(sortTransaction(usedAndUnusedData)).some((i) =>
                      input.addresses.includes(i),
                    )
                  ) {
                    debitedArray.push(input);
                  }
                  if (
                    Object.keys(
                      sortTransaction(usedAndUnusedChangeData),
                    ).some((i) => input.addresses.includes(i))
                  ) {
                    debitedArray.push(input);
                  }
                });

                // setting credited transaction to creditedArray
                item.outputs.map((output) => {
                  if (
                    Object.keys(sortTransaction(usedAndUnusedData)).some((i) =>
                      output.addresses.includes(i),
                    )
                  ) {
                    creditedArray.push(output);
                  }
                  if (
                    Object.keys(
                      sortTransaction(usedAndUnusedChangeData),
                    ).some((i) => output.addresses.includes(i))
                  ) {
                    creditedArray.push(output);
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
                        if (
                          Object.keys(
                            sortTransaction(usedAndUnusedData),
                          ).some((i) => output.addresses.includes(i))
                        ) {
                          finalValue = debit.value_int - output.value_int;
                        } else {
                          finalValue = debit.value_int;
                        }
                        if (
                          Object.keys(
                            sortTransaction(usedAndUnusedChangeData),
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
