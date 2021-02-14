import React, {useState, useEffect, useContext} from 'react';
import {View, Text, SafeAreaView, Image, FlatList} from 'react-native';
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

  useEffect(() => {
    if (bitcoinData) {
      // setting last hash address
      if (bitcoinData.address.transactions) {
        setLastHash(bitcoinData.address.transactions[0].txid);

        // setting out in
        const outputData = [];
        bitcoinData &&
          bitcoinData.address.transactions &&
          bitcoinData.address.transactions[0].outputs.map((output, index) => {
            if (output.addresses.includes(storedBitcoinData.address)) {
              outputData.push(output);
            }
          });
        if (outputData[0]) {
          setOutIn(outputData[0].n);
        }
      }
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
                <CustomButton
                  handleBtnClick={() =>
                    navigation.navigate('SendScreen', {
                      outIn,
                      lastHash,
                    })
                  }
                  isDisabled={
                    bitcoinData &&
                    bitcoinData.address.total.balance_int === 0 &&
                    true
                  }
                />
              </View>
            </View>

            {/* TRANSACTION LIST CONTAINER */}
            <View style={styles.bottomContainer}>
              <Text style={styles.transactionText}>Transactions</Text>
              <FlatList
                keyExtractor={(item, index) => item.txid}
                data={bitcoinData.address.transactions}
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
