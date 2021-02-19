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

export default function HomeScreen({navigation}) {
  const [bitcoinData, setBitcoinData] = useState(null);
  const [outIn, setOutIn] = useState(0);
  const [lastHash, setLastHash] = useState('');
  const {storedBitcoinData} = useContext(Contexts);
  const [refreshing, setRefreshing] = useState(false);

  let senderAddress = {};

  const onRefresh = () => {
    if (storedBitcoinData) {
      setRefreshing(true);
      console.log('called 2');
      getBitcoinData(storedBitcoinData.address);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (bitcoinData) {
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

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      console.log('new bit', data);
      setBitcoinData(data);
    } catch (error) {
      console.log(error);
    }
  };

  // initial load
  useEffect(() => {
    if (storedBitcoinData) {
      console.log('called 2');

      getBitcoinData(storedBitcoinData.address);
    }
  }, [storedBitcoinData]);

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
                  uri: 'https://en.bitcoin.it/w/images/en/2/29/BC_Logo_.png',
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
                <CustomButton
                  handleBtnClick={() =>
                    navigation.navigate('SendScreen', {
                      outIn,
                      lastHash,
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
