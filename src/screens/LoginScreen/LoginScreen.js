import React, {useContext, useRef, useState, useEffect} from 'react';
import {View, Text, SafeAreaView, Image, TextInput, Alert} from 'react-native';
import Contexts from '../../Contexts/Contexts';
import styles from './styles';
import {LOGO_URL} from '../../api/bitcoin/constant';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// import generateTestnetAddressAndPrivateKey from '../../Helper/generateTestnetAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');

export default function LoginScreen() {
  const ref = useRef({
    currentNo: 10,
    generatedAddress: [],
  });
  const {
    setStoredBitcoinData,
    handleGlobalSpinner,
    setIsLoggedIn,
    setUsedAndUnusedData,
    setChangeAddress,
  } = useContext(Contexts);

  const [mnemonic, setMnemonic] = useState('');

  const getAddress = (data) => {
    console.log('data', data);
    return {
      address: bitcoin.payments.p2pkh({
        pubkey: data.publicKey,
        network: bitcoin.networks.testnet,
      }).address,
    };
  };

  const generateTestnetAddressAndPrivateKey = async (
    currentNo,
    mnemonicPhrase,
  ) => {
    ref.current.generatedAddress = [];
    const addressAndPrivatekey = [];
    const apiAddressResponse = [];
    const processedUsedAndUnusedAddress = {};
    const seed = bip39.mnemonicToSeedSync(mnemonicPhrase);
    const root = bitcoin.bip32.fromSeed(seed, bitcoin.networks.testnet);
    const branch = root
      .deriveHardened(44)
      .deriveHardened(1)
      .deriveHardened(0)
      .derive(0);
    // generate one change address
    const changeAddressBranch = root
      .deriveHardened(44)
      .deriveHardened(1)
      .deriveHardened(0)
      .derive(1);
    const changeAddress = getAddress(changeAddressBranch.derive(0));
    // generate one change address

    // generate 10 address
    for (let i = 0; i < currentNo; ++i) {
      addressAndPrivatekey.push(getAddress(branch.derive(i)));
      ref.current.generatedAddress.push(getAddress(branch.derive(i)));
    }

    // --------- using promise ------------
    // getting data of all generated address
    Promise.all(
      addressAndPrivatekey.map((el) => {
        return new Promise((resolve) => {
          fetch(
            `https://api.blockcypher.com/v1/btc/test3/addrs/${el.address}/full?limit=50&token=a657369943a148eba820eb667fcd5c26`,
          ).then((response) => {
            return new Promise(() => {
              response.json().then((data) => {
                console.log(data);
                apiAddressResponse.push(data);
                resolve();
              });
            });
          });
        });
      }),
    ).then(() => {
      // separate used and unused address
      addressAndPrivatekey.map(async (el, i) => {
        if (
          el.address &&
          (el.address =
            apiAddressResponse[i].address &&
            apiAddressResponse[i].txs.length === 0)
        ) {
          // getting all unused address and storing to obj
          processedUsedAndUnusedAddress[apiAddressResponse[i].address] = {
            is_used: false,
            address: apiAddressResponse[i].address,
            derivePath: `m/44'/1'/0'/0/${ref.current.generatedAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address,
            )}`,
          };
        } else {
          // getting all used address and storing to obj
          processedUsedAndUnusedAddress[apiAddressResponse[i].address] = {
            is_used: true,
            address: apiAddressResponse[i].address,
            derivePath: `m/44'/1'/0'/0/${ref.current.generatedAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address,
            )}`,
          };
        }

        // add change address
        processedUsedAndUnusedAddress[changeAddress.address] = {
          is_used: true,
          address: changeAddress.address,
          derivePath: "m/44'/1'/0'/1/0",
        };
        await AsyncStorage.setItem('change_address', changeAddress.address);
        setChangeAddress(changeAddress.address);

        // storing all processed data to context and asyncStorage
        setUsedAndUnusedData(processedUsedAndUnusedAddress);
        await AsyncStorage.setItem(
          'usedUnusedAddress',
          JSON.stringify(processedUsedAndUnusedAddress),
        );
      });

      //check

      // check if has all used address or not
      const usedAddress = [];
      Object.keys(processedUsedAndUnusedAddress).map((el) => {
        if (processedUsedAndUnusedAddress[el].is_used) {
          usedAddress.push(true);
        }
      });

      if (
        usedAddress.length === Object.keys(processedUsedAndUnusedAddress).length
      ) {
        // has no unused data generate more 10 address
        usedAddress.splice(0, usedAddress.length);
        ref.current.currentNo += 5;
        generateTestnetAddressAndPrivateKey(ref.current.currentNo, mnemonic);
      } else {
        // has some unused data
        Object.keys(processedUsedAndUnusedAddress).map((el) => {
          if (!processedUsedAndUnusedAddress[el].is_used) {
            setStoredBitcoinData({
              address: processedUsedAndUnusedAddress[el].address,
            });
            AsyncStorage.setItem(
              'bitcoin_async_data',
              JSON.stringify({
                address: processedUsedAndUnusedAddress[el].address,
              }),
            );
            setIsLoggedIn(true);
            handleGlobalSpinner(false);
          }
        });
      }
    });
    // --------- using promise ------------
  };

  // handle login btn pressed
  const handleLoginBtn = async () => {
    handleGlobalSpinner(true);
    await generateTestnetAddressAndPrivateKey(ref.current.currentNo, mnemonic);
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
          <Text style={{textAlign: 'center', fontSize: 18, marginVertical: 10}}>
            Enter 12 word Mnemonic Phrase
          </Text>
          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="Enter Mnemonic Phrase"
              style={styles.textInput}
              value={mnemonic}
              onChangeText={(text) => setMnemonic(text)}
            />
          </View>
        </View>

        <View style={styles.btnContainer}>
          <CustomButton text="LOGIN" handleBtnClick={handleLoginBtn} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
