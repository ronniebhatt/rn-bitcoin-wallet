import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import TransactionCard from '../../Components/TransactionCard/TransactionCard';
import styles from './styles';
import Contexts from '../../Contexts/Contexts';
import Spinner from '../../Components/Spinner/Spinner';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {LOGO_URL} from '../../api/bitcoin/constant';
import generateTestnetAddressAndPrivateKey from '../../Helper/generateTestnetAddress';

export default function HomeScreen({navigation}) {
  const [bitcoinData, setBitcoinData] = useState(null);
  const {
    storedBitcoinData,
    setStoredBitcoinData,
    handleGlobalSpinner,
  } = useContext(Contexts);
  const [refreshing, setRefreshing] = useState(false);
  const ref = useRef({currentNo: 10});

  let senderAddress = {};

  // handle pull to refresh
  const onRefresh = () => {
    if (storedBitcoinData) {
      setRefreshing(true);
      getBitcoinData(storedBitcoinData.address);
      setRefreshing(false);
    }
  };

  // validate new address
  const validateAddress = async () => {
    handleGlobalSpinner(true);
    const isUnused = await generateUnusedAddress();
    if (!isUnused) {
      const currentIndex = ref.current.currentNo + 10;
      ref.current.currentNo = currentIndex;
      validateAddress();
    }
  };

  const generateUnusedAddress = async () => {
    const data = await generateTestnetAddressAndPrivateKey(
      ref.current.currentNo,
    );
    if (data) {
      setStoredBitcoinData(data);
      handleGlobalSpinner(false);
      return true;
    }
    if (!data) {
      return false;
    }
  };

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      setBitcoinData(data);
      // if (data.txs.length !== 0) {
      //   setTimeout(() => {
      //     validateAddress();
      //   }, 5000);
      // }
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
