import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import '../../../shim';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import TransactionCard from '../../Components/TransactionCard/TransactionCard';
import styles from './styles';
import Contexts from '../../Contexts/Contexts';
import Spinner from '../../Components/Spinner/Spinner';

export default function HomeScreen({navigation}) {
  const [bitcoinData, setBitcoinData] = useState(null);
  const [outIn, setOutIn] = useState(0);
  const [lastHash, setLastHash] = useState('');
  const {storedBitcoinData} = useContext(Contexts);

  useEffect(() => {
    if (bitcoinData) {
      // setting last hash address
      setLastHash(bitcoinData.address.transactions[0].txid);

      // setting out in
      const outputData = [];
      bitcoinData &&
        bitcoinData.address.transactions &&
        bitcoinData.address.transactions.map((transaction, index) => {
          transaction.outputs.map((output) => {
            if (output.addresses.includes(storedBitcoinData.address)) {
              outputData.push(output);
            }
          });
        });

      setOutIn(outputData[0].n);
    }
  }, [bitcoinData]);

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      setBitcoinData(data);
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
                  uri: 'https://en.bitcoin.it/w/images/en/2/29/BC_Logo_.png',
                }}
              />

              {/* CURRENT BALANCE */}
              <Text style={styles.balanceText}>
                Balance {bitcoinData && bitcoinData.address.total.balance}
              </Text>

              {/* CURRENT TESTNET ADDRESS */}
              <Text style={styles.btnAddressText}>
                {storedBitcoinData.address}
              </Text>

              <View style={styles.btnContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.btn}
                  onPress={() =>
                    navigation.navigate('SendScreen', {
                      outIn,
                      lastHash,
                    })
                  }>
                  <Text style={styles.btnText}>SEND</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* TRANSACTION LIST CONTAINER */}
            <View style={styles.bottomContainer}>
              <Text style={styles.transactionText}>Transactions</Text>
              <FlatList
                keyExtractor={(item, index) => item.txid}
                data={bitcoinData.address.transactions}
                showsVerticalScrollIndicator={false}
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
                  return (
                    <>
                      {/* rendering credited transaction */}
                      {creditedArray.map((credit, index) => {
                        return (
                          <TransactionCard
                            key={index}
                            transactionID={item.txid}
                            amount={credit.value_int}
                            isCredited={true}
                          />
                        );
                      })}

                      {/* rendering debited transaction */}
                      {debitedArray.map((debit, index) => {
                        return (
                          <TransactionCard
                            key={index}
                            transactionID={item.txid}
                            amount={debit.value_int}
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
