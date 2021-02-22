import React, {useEffect, useState, useContext} from 'react';
import {View, Text, SafeAreaView, Image, TextInput} from 'react-native';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
import Contexts from '../../Contexts/Contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import {LOGO_URL} from '../../api/constant';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');

export default function LoginScreen({navigation}) {
  const [currentNo, setCurrentNo] = useState(10);
  const {setStoredBitcoinData, handleGlobalSpinner} = useContext(Contexts);
  const arr = [];

  const generateRandomAndStoreData = async (data) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem('bitcoin', jsonValue);
      setStoredBitcoinData(data);
      navigation.navigate('Home');
      handleGlobalSpinner(false);
    } catch (e) {
      console.log(e);
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

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const generate = async () => {
    handleGlobalSpinner(true);

    const seed = bip39.mnemonicToSeedSync(
      'elephant mountain scatter chair strike input dragon maple amazing eight office know',
    );
    const root = bitcoin.bip32.fromSeed(seed, bitcoin.networks.testnet);
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
    const data = await getBitcoinData(lastArray.address);
    if (data.txs.length === 0) {
      generateRandomAndStoreData({
        address: lastArray.address,
        privateKey: lastArray.privateKey,
      });
      return true;
    } else {
      return false;
    }
  };

  const callFun = async () => {
    const isUnused = await generate();
    console.log('isUnused', isUnused);
    if (!isUnused) {
      setCurrentNo(currentNo + 10);
      callFun();
    }
  };

  const handleLoginBtn = async () => {
    try {
      callFun();
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView>
        {/* TOP LOGO */}
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={{
            uri: LOGO_URL,
          }}
        />

        <View style={styles.textInputOuterContainer}>
          <Text style={{textAlign: 'center'}}>Enter 12 word mnemonic </Text>
          <View style={styles.textInputContainer}>
            <TextInput placeholder="word 1" style={styles.textInput} />
            <TextInput placeholder="word 2" style={styles.textInput} />
            <TextInput placeholder="word 3" style={styles.textInput} />
          </View>

          <View style={styles.textInputContainer}>
            <TextInput placeholder="word 4" style={styles.textInput} />
            <TextInput placeholder="word 5" style={styles.textInput} />
            <TextInput placeholder="word 6" style={styles.textInput} />
          </View>

          <View style={styles.textInputContainer}>
            <TextInput placeholder="word 7" style={styles.textInput} />
            <TextInput placeholder="word 8" style={styles.textInput} />
            <TextInput placeholder="word 9" style={styles.textInput} />
          </View>

          <View style={styles.textInputContainer}>
            <TextInput placeholder="word 10" style={styles.textInput} />
            <TextInput placeholder="word 11" style={styles.textInput} />
            <TextInput placeholder="word 12" style={styles.textInput} />
          </View>
        </View>

        <View style={styles.btnContainer}>
          <CustomButton text="LOGIN" handleBtnClick={handleLoginBtn} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
