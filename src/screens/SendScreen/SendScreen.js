import React, {useState, useContext} from 'react';
import {View, Text, SafeAreaView, TextInput, Image, Alert} from 'react-native';
import styles from './styles';
import Contexts from '../../Contexts/Contexts';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import broadcastTransaction from '../../api/bitcoin/broadcastTransaction';
import Spinner from '../../Components/Spinner/Spinner';
import CustomButton from '../../Components/CustomButton/CustomButton';
const bitcoin = require('bitcoinjs-lib');

export default function SendScreen({route}) {
  const {outIn, lastHash, bitcoinData} = route.params;
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const {storedBitcoinData} = useContext(Contexts);
  const [loading, setLoading] = useState(false);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  console.log('nn', outIn, lastHash, bitcoinData);
  console.log('storedBitcoinData', storedBitcoinData);

  // check if receiver testnet address is valid or not
  const checkTestAddress = async (testnetAddress) => {
    try {
      const data = await getBitcoinDetails(testnetAddress);

      if (data) {
        return data.address;
      }

      if (!data) {
        setShowErrorMsg(true);
        setErrorMsg('Invalid Address');
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // broadcast Transaction
  const broadcastRawTransaction = async (hex) => {
    const postbody = {hex: hex};
    try {
      const {success, error} = await broadcastTransaction(postbody);

      if (success) {
        Alert.alert('Transaction sent Successfully');
      }

      if (!success) {
        setShowErrorMsg(true);
        setErrorMsg(error.message);
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle on send btn pressed
  const handleSendBtn = async () => {
    const testnet = bitcoin.networks.testnet;
    setLoading(true);

    // check testnet address is empty
    if (!address) {
      Alert.alert('Enter Testnet Address');
      setLoading(false);
      return;
    }

    // check amount is empty
    if (!amount) {
      Alert.alert('Enter Amount');
      setLoading(false);
      return;
    }

    // check amount is less than bitcoin balance
    if (amount > bitcoinData.balance) {
      Alert.alert('Insufficient Balance');
      setLoading(false);
      return;
    }

    // check if unconfirmed
    bitcoinData.txs.map((transaction, index) => {
      if (transaction.hash === lastHash) {
        if (transaction.confirmations === 0) {
          Alert.alert('Waiting for transaction to confirm');
          setLoading(false);
          return;
        }
      }
    });

    // validate receiver address
    const data = await checkTestAddress(address);
    if (data) {
      try {
        const transactionBuilder = new bitcoin.TransactionBuilder(testnet);
        const transactionID = lastHash;
        const outn = outIn;
        transactionBuilder.addInput(transactionID, outn);
        transactionBuilder.addOutput(address, parseInt(amount));
        transactionBuilder.addOutput(
          bitcoinData.address,
          parseInt(amount) - 1000,
        );
        const keyPair = bitcoin.ECPair.fromWIF(storedBitcoinData.wif, testnet);
        transactionBuilder.sign(0, keyPair);

        const transaction = transactionBuilder.build();
        const transactionHex = transaction.toHex();
        console.log('hex', transactionHex);
        if (transactionHex) {
          broadcastRawTransaction(transactionHex);
        }
      } catch (error) {
        console.log('error', error);
        Alert.alert('ERROR');
      }
    }

    setLoading(false);
  };

  return (
    <>
      {loading && <Spinner />}
      {!loading && (
        <SafeAreaView style={styles.container}>
          <View style={styles.textInputContainer}>
            <Image
              style={styles.logo}
              resizeMode="contain"
              source={{
                uri: 'https://en.bitcoin.it/w/images/en/2/29/BC_Logo_.png',
              }}
            />
            <TextInput
              style={styles.textInputOuterContainer}
              placeholder="Testnet Address"
              value={address}
              onChangeText={(e) => setAddress(e)}
            />
            <TextInput
              style={styles.textInputOuterContainer}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={(e) => setAmount(e)}
            />
          </View>

          <View style={styles.btnOuterContainer}>
            <CustomButton text="SEND" handleBtnClick={handleSendBtn} />
          </View>

          {showErrorMsg && (
            <View style={styles.errorMsgContainer}>
              <Text style={styles.errorText}>ERROR : {errorMsg}</Text>
            </View>
          )}
        </SafeAreaView>
      )}
    </>
  );
}
