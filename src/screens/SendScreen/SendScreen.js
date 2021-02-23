import React, {useState, useContext, useEffect} from 'react';
import {View, Text, SafeAreaView, TextInput, Image, Alert} from 'react-native';
import styles from './styles';
import Contexts from '../../Contexts/Contexts';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import broadcastTransaction from '../../api/bitcoin/broadcastTransaction';
import CustomButton from '../../Components/CustomButton/CustomButton';
import getUtxosTransaction from '../../api/bitcoin/getUtxosTransaction';
const bitcoin = require('bitcoinjs-lib');
const coinSelect = require('coinselect');

const testnet = bitcoin.networks.testnet;

export default function SendScreen({route}) {
  const {bitcoinData} = route.params;
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const {storedBitcoinData, handleGlobalSpinner} = useContext(Contexts);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [utxosList, setUtxoList] = useState({});

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

  // get unsigned transaction
  const getUtxosTransactions = async (address) => {
    handleGlobalSpinner(true);
    try {
      const data = await getUtxosTransaction(address);
      setUtxoList(data);
      handleGlobalSpinner(false);
    } catch (error) {
      console.log(error);
      handleGlobalSpinner(false);
    }
  };

  useEffect(() => {
    if (storedBitcoinData.address) {
      getUtxosTransactions(storedBitcoinData.address);
    }
  }, []);

  // get unsigned transaction
  const getUnsignedTransaction = async (utxos, targets, feePerByte = 1) => {
    const formattedUTXO = [];

    utxos.forEach((utxo) => {
      formattedUTXO.push({
        txId: utxo.txid,
        vout: utxo.vout,
        value: utxo.value,
      });
    });

    let {inputs, outputs, fee} = coinSelect(formattedUTXO, targets, feePerByte);

    const data = inputs.map((input, index) => {
      let isConfirmed = false;
      bitcoinData.txs.map((transaction) => {
        if (input.txId === transaction.hash) {
          if (transaction.confirmations >= 1) isConfirmed = true;
        }
      });
      return isConfirmed;
    });

    if (data.includes(false)) {
      return {
        success: false,
        message: 'Waiting for transaction to confirm',
        fee,
      };
    }

    if (!inputs || !outputs) {
      return {
        success: false,
        message: 'Insufficient Balance',
        fee,
      };
    }

    if (inputs && outputs) {
      return {
        success: true,
        inputs,
        outputs,
        fee,
      };
    }
  };

  // broadcast Transaction
  const broadcastRawTransaction = async (hex) => {
    const postbody = {hex: hex};
    try {
      const {success, error} = await broadcastTransaction(postbody);

      if (success) {
        handleGlobalSpinner(false);
        Alert.alert('Transaction sent Successfully');
      }
      if (!success) {
        handleGlobalSpinner(false);
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
    handleGlobalSpinner(true);

    // check testnet address is empty
    if (!address) {
      Alert.alert('Enter Testnet Address');
      return;
    }

    // check amount is empty
    if (!amount) {
      Alert.alert('Enter Amount');
      return;
    }

    // validate receiver address
    const data = await checkTestAddress(address);

    // recipient address and amount
    const targets = [
      {
        address: address,
        value: parseInt(amount),
      },
    ];

    //if receiver address is valid
    if (data) {
      try {
        // check unsigned transaction
        const data = await getUnsignedTransaction(utxosList, targets);
        const {success, inputs, outputs, message} = data;

        if (success) {
          const transactionBuilder = new bitcoin.TransactionBuilder(testnet);

          inputs.forEach((input) =>
            transactionBuilder.addInput(input.txId, input.vout),
          );

          outputs.forEach((output) => {
            if (!output.address) {
              output.address = bitcoinData.address;
            }

            transactionBuilder.addOutput(output.address, output.value);
          });

          const keyPair = bitcoin.ECPair.fromWIF(
            storedBitcoinData.privateKey,
            testnet,
          );
          transactionBuilder.sign(0, keyPair);
          const transaction = transactionBuilder.build();
          const transactionHex = transaction.toHex();
          if (transactionHex) {
            broadcastRawTransaction(transactionHex);
          }
        }
        if (!success) {
          handleGlobalSpinner(false);
          Alert.alert(message);
        }
      } catch (error) {
        console.log('error', error);
        handleGlobalSpinner(false);
        Alert.alert('ERROR');
      }
    }
  };

  return (
    <>
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
    </>
  );
}
