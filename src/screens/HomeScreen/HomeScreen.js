import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import '../../../shim';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import TransactionCard from '../../Components/TransactionCard/TransactionCard';
import styles from './styles';
import Contexts from '../../Contexts/Contexts';
import Spinner from '../../Components/Spinner/Spinner';
import CustomButton from '../../Components/CustomButton/CustomButton';
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LOGO_URL} from '../../api/constant';

export default function HomeScreen({navigation}) {
  const [bitcoinData, setBitcoinData] = useState(null);
  const [outIn, setOutIn] = useState(0);
  const [lastHash, setLastHash] = useState('');
  const {storedBitcoinData, setStoredBitcoinData} = useContext(Contexts);
  const [refreshing, setRefreshing] = useState(false);
  const [currentNo, setCurrentNo] = useState(23);
  let arr = [];

  let senderAddress = {};

  const onRefresh = () => {
    if (storedBitcoinData) {
      setRefreshing(true);
      getBitcoinData(storedBitcoinData.address);
      setRefreshing(false);
    }
  };

  function getAddress(node) {
    return {
      address: bitcoin.payments.p2pkh({
        pubkey: node.publicKey,
        network: bitcoin.networks.testnet,
      }).address,
      privateKey: node.toWIF(),
    };
  }

  const generateRandomAndStoreData = async (data) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem('bitcoin', jsonValue);
      setStoredBitcoinData(data);
    } catch (e) {
      console.log(e);
    }
  };

  const generate = async () => {
    const seed = bip39.mnemonicToSeedSync(
      'relief ask nest obvious analyst useful champion spell fly letter simple senior',
    );
    console.log('seed', seed);
    const root = bitcoin.bip32.fromSeed(seed, bitcoin.networks.testnet);
    console.log('root', root);
    // const branch = root.deriveHardened(0).derive(0).derive(0);
    const branch = root
      .deriveHardened(44)
      .deriveHardened(1)
      .deriveHardened(0)
      .derive(0);

    for (let i = 0; i < currentNo; ++i) {
      arr.push(getAddress(branch.derive(i)));
    }
    console.log(arr);
    const lastArray = arr.slice(-1).pop();
    console.log('here11', lastArray.address);
    const data = await getBitcoinDatatwo(lastArray.address);
    console.log('data', data);
    if (data.txs.length === 0) {
      console.log('unused', lastArray.address);
      generateRandomAndStoreData({
        address: lastArray.address,
        privateKey: lastArray.privateKey,
      });
      return true;
    } else {
      console.log('used', lastArray.address);
      return false;
    }
  };

  useEffect(() => {
    if (bitcoinData) {
      console.log('bitcoinData', bitcoinData);
      // setting last hash address
      if (bitcoinData.txs.length !== 0) {
        setLastHash(bitcoinData.txs[0].hash);

        // setting out in
        const outputData = [];
        let currentIndex = 0;
        bitcoinData &&
          bitcoinData.txs &&
          bitcoinData.txs[0].outputs.map((output, index) => {
            if (output.addresses.includes(storedBitcoinData.address)) {
              outputData.push(output);
              currentIndex = index;
            }
          });
        if (outputData[0]) {
          setOutIn(currentIndex);
        }
      }
    }
  }, [bitcoinData]);

  const callFun = async () => {
    const isUnused = await generate();
    console.log('isUnused', isUnused);
    if (!isUnused) {
      setCurrentNo(currentNo + 20);
      callFun();
    }
  };

  // useEffect(() => {
  // const callFun = async () => {
  //   const isUnused = await generate();
  //   console.log('isUnused', isUnused);
  //   if (!isUnused) {
  //     setCurrentNo(currentNo + 10);
  //     generate();
  //   }
  // };
  //   callFun();
  // }, [currentNo]);

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      console.log('new bit', data);
      setBitcoinData(data);
      if (data.txs.length !== 0) {
        callFun();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getBitcoinDatatwo = async (address) => {
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
    const calla = async () => {
      if (storedBitcoinData) {
        console.log('called 2');
        getBitcoinDatatwo(storedBitcoinData.address);
      } else {
        console.log('here');
        const asyncData = await getAsyncData();
        // if data exist already
        // set data to context
        if (asyncData) {
          setStoredBitcoinData(asyncData);
        }
      }
    };

    calla();
  }, [storedBitcoinData]);

  // temp
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

              {/* CURRENT BALANCE */}
              <Text style={styles.balanceText}>
                Balance {bitcoinData && bitcoinData.balance}
              </Text>

              {/* CURRENT TESTNET ADDRESS */}
              <Text style={styles.btnAddressText}>
                {storedBitcoinData.address}
              </Text>

              <View style={styles.btnContainer}>
                <View style={{marginVertical: 20}}>
                  <CustomButton
                    text="SEND"
                    handleBtnClick={() =>
                      navigation.navigate('SendScreen', {
                        outIn,
                        lastHash,
                        bitcoinData,
                      })
                    }
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
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                data={bitcoinData.txs}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyTransactionContainer}>
                    <Text style={{color: '#fff'}}>No Transactions</Text>
                  </View>
                )}
                renderItem={({item}) => {
                  const debitedArray = [];
                  const creditedArray = [];

                  // setting debited transaction to debitedArray
                  item.inputs.map((input) => {
                    if (input.addresses.includes(storedBitcoinData.address)) {
                      debitedArray.push(input);
                    }
                  });

                  // setting credited transaction to creditedArray
                  item.outputs.map((output) => {
                    if (output.addresses.includes(storedBitcoinData.address)) {
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
                            amount={credit.value}
                            isCredited={true}
                          />
                        );
                      })}

                      {/* rendering debited transaction */}
                      {debitedArray.map((debit, index) => {
                        let totalDeducted = 0;
                        if (senderAddress[item.hash]) {
                          totalDeducted = senderAddress[item.hash].value + 1000;
                        } else {
                          totalDeducted = debit.output_value;
                        }

                        return (
                          <TransactionCard
                            key={index}
                            transactionID={item.hash}
                            amount={totalDeducted}
                            isCredited={false}
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
