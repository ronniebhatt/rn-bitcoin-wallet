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
import sortTransaction from '../../Helper/sortTransaction';

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
    console.log('usedAndUnusedData', usedAndUnusedData);
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
      const array = regularAddressUtxo.concat(changeAddressUtxo);
      array.map((el) => {
        if (el.status.confirmed) {
          balance += el.value;
        }
        if (!el.status.confirmed) {
          console.log('unconfirmed', el.value);
          unConfirmedBalance += el.value;
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

      const newUnique = unique.sort(function (left, right) {
        return moment.unix(right.time).diff(moment.unix(left.time));
      });

      console.log('newUnique', newUnique);

      setAllTransactions(newUnique);
    }
  }, [regularAddressTransaction, changeAddressTransaction]);

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

            {unconfirmedBalance !== 0 && (
              <Text style={{alignSelf: 'center', marginVertical: 10}}>
                {`Unconfirmed Balance : ${unconfirmedBalance} sats`}
              </Text>
            )}

            {/* CURRENT TESTNET ADDRESS */}
            <Text style={styles.btnAddressText}>
              {storedBitcoinData.address}
            </Text>

            <View style={styles.btnContainer}>
              <View style={{marginVertical: 15}}>
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
