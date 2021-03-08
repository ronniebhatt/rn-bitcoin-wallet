import React, {useContext, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Contexts from '../../Contexts/Contexts';
import styles from './styles';
import {LOGO_URL} from '../../api/bitcoin/constant';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import generateAddress from '../../Helper/generateAddress';
import sortTransaction from '../../Helper/sortTransaction';
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');

export default function MnemonicScreen({route}) {
  const {type} = route.params;
  const ref = useRef({
    currentNo: 10,
    currentChangeNo: 10,
    generatedAddress: [],
    generatedChangeAddress: [],
  });
  const {
    setStoredBitcoinData,
    handleGlobalSpinner,
    setIsLoggedIn,
    setUsedAndUnusedData,
    setChangeAddress,
    setMnemonicRoot,
    setUsedAndUnusedChangeData,
  } = useContext(Contexts);

  const [mnemonic, setMnemonic] = useState('');
  const [regularAddressComplete, setRegularAddressComplete] = useState(false);
  const [changeAddressComplete, setChangeAddressComplete] = useState(false);

  useEffect(() => {
    if (regularAddressComplete && changeAddressComplete) {
      setIsLoggedIn(true);
      handleGlobalSpinner(false);
    }
  }, [regularAddressComplete, changeAddressComplete]);

  const generateTestnetAddressAndPrivateKey = async (mnemonicPhrase) => {
    ref.current.generatedAddress = [];
    const addressAndPrivatekey = [];
    const changeAddressAndPrivatekey = [];
    const valid = bip39.validateMnemonic(mnemonicPhrase);

    if (!valid) {
      Alert.alert('ALERT', 'Enter valid mnemonic phase');
      handleGlobalSpinner(false);
      return;
    }
    const seed = bip39.mnemonicToSeedSync(mnemonicPhrase);
    const root = bitcoin.bip32.fromSeed(seed, bitcoin.networks.testnet);
    await AsyncStorage.setItem('mnemonic_root', mnemonicPhrase);
    setMnemonicRoot(root);
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

    // ---- generate 10 change address ---
    for (let i = 0; i < ref.current.currentChangeNo; ++i) {
      changeAddressAndPrivatekey.push(
        generateAddress(changeAddressBranch.derive(i)),
      );
      ref.current.generatedChangeAddress.push(
        generateAddress(changeAddressBranch.derive(i)),
      );
    }
    // ---- generate 10 change address ---

    // generate 5 testnet address
    for (let i = 0; i < ref.current.currentNo; ++i) {
      addressAndPrivatekey.push(generateAddress(branch.derive(i)));
      ref.current.generatedAddress.push(generateAddress(branch.derive(i)));
    }

    await processBitcoinAddress(addressAndPrivatekey);
    await processBitcoinChangeAddress(changeAddressAndPrivatekey);
  };

  const processBitcoinAddress = async (addressAndPrivatekey) => {
    const apiAddressResponse = [];
    const processedUsedAndUnusedAddress = {};

    // --------- using promise ------------
    // getting data of all generated address
    Promise.all(
      addressAndPrivatekey.map((el) => {
        return new Promise((resolve) => {
          fetch(
            `https://testnet-api.smartbit.com.au/v1/blockchain/address/${el.address}`,
          ).then((response) => {
            return new Promise(() => {
              response.json().then((data) => {
                if (data.address) {
                  apiAddressResponse.push(data);
                }
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
            apiAddressResponse[i].address.address &&
            !apiAddressResponse[i].address.transactions)
        ) {
          // getting all unused address and storing to obj
          processedUsedAndUnusedAddress[
            apiAddressResponse[i].address.address
          ] = {
            is_used: false,
            index: ref.current.generatedAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            ),
            address: apiAddressResponse[i].address.address,
            derivePath: `m/44'/1'/0'/0/${ref.current.generatedAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            )}`,
          };
        } else {
          // getting all used address and storing to obj
          processedUsedAndUnusedAddress[
            apiAddressResponse[i].address.address
          ] = {
            is_used: true,
            index: ref.current.generatedAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            ),
            address: apiAddressResponse[i].address.address,
            derivePath: `m/44'/1'/0'/0/${ref.current.generatedAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            )}`,
          };
        }

        // storing all processed data to context and asyncStorage
        setUsedAndUnusedData(processedUsedAndUnusedAddress);
        await AsyncStorage.setItem(
          'usedUnusedAddress',
          JSON.stringify(processedUsedAndUnusedAddress),
        );
      });

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
        ref.current.currentNo += 10;
        generateTestnetAddressAndPrivateKey(mnemonic);
      } else {
        // has some unused data
        let currentUnusedAddressIndex = 0;

        for (
          let i = 0;
          i <
          Object.keys(sortTransaction(processedUsedAndUnusedAddress)).length;
          i++
        ) {
          if (
            processedUsedAndUnusedAddress[
              Object.keys(sortTransaction(processedUsedAndUnusedAddress))[i]
            ].index === i &&
            !processedUsedAndUnusedAddress[
              Object.keys(sortTransaction(processedUsedAndUnusedAddress))[i]
            ].is_used
          ) {
            currentUnusedAddressIndex = i;
            break;
          }
        }

        const nextAddress = Object.keys(
          sortTransaction(processedUsedAndUnusedAddress),
        )[currentUnusedAddressIndex];
        setStoredBitcoinData({
          address: nextAddress,
        });
        AsyncStorage.setItem(
          'bitcoin_async_data',
          JSON.stringify({
            address: nextAddress,
          }),
        );

        setRegularAddressComplete(true);
      }
    });

    // --------- using promise ------------
  };

  const processBitcoinChangeAddress = async (changeAddress) => {
    const apiAddressResponse = [];
    const processedUsedAndUnusedAddress = {};

    // --------- using promise ------------
    // getting data of all generated address
    Promise.all(
      changeAddress.map((el) => {
        return new Promise((resolve) => {
          fetch(
            `https://testnet-api.smartbit.com.au/v1/blockchain/address/${el.address}`,
          ).then((response) => {
            return new Promise(() => {
              response.json().then((data) => {
                if (data.address) {
                  apiAddressResponse.push(data);
                }
                resolve();
              });
            });
          });
        });
      }),
    ).then(() => {
      // separate used and unused address
      changeAddress.map(async (el, i) => {
        if (
          el.address &&
          (el.address =
            apiAddressResponse[i].address.address &&
            !apiAddressResponse[i].address.transactions)
        ) {
          // getting all unused address and storing to obj
          processedUsedAndUnusedAddress[
            apiAddressResponse[i].address.address
          ] = {
            is_used: false,
            index: ref.current.generatedChangeAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            ),
            address: apiAddressResponse[i].address.address,
            derivePath: `m/44'/1'/0'/1/${ref.current.generatedChangeAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            )}`,
          };
        } else {
          // getting all used address and storing to obj
          processedUsedAndUnusedAddress[
            apiAddressResponse[i].address.address
          ] = {
            is_used: true,
            index: ref.current.generatedChangeAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            ),
            address: apiAddressResponse[i].address.address,
            derivePath: `m/44'/1'/0'/1/${ref.current.generatedChangeAddress.findIndex(
              (x) => x.address === apiAddressResponse[i].address.address,
            )}`,
          };
        }

        // storing all processed data to context and asyncStorage
        setUsedAndUnusedChangeData(processedUsedAndUnusedAddress);
        await AsyncStorage.setItem(
          'usedUnusedChangeAddress',
          JSON.stringify(processedUsedAndUnusedAddress),
        );
      });

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
        ref.current.generatedChangeAddress = [];
        ref.current.currentChangeNo = ref.current.currentChangeNo + 10;
        generateTestnetAddressAndPrivateKey(mnemonic);
      } else {
        // has some unused data

        let currentUnusedAddressIndex = 0;

        for (
          let i = 0;
          i <
          Object.keys(sortTransaction(processedUsedAndUnusedAddress)).length;
          i++
        ) {
          if (
            processedUsedAndUnusedAddress[
              Object.keys(sortTransaction(processedUsedAndUnusedAddress))[i]
            ].index === i &&
            !processedUsedAndUnusedAddress[
              Object.keys(sortTransaction(processedUsedAndUnusedAddress))[i]
            ].is_used
          ) {
            currentUnusedAddressIndex = i;
            break;
          }
        }

        const nextAddress = Object.keys(
          sortTransaction(processedUsedAndUnusedAddress),
        )[currentUnusedAddressIndex];

        setChangeAddress(nextAddress);

        AsyncStorage.setItem('change_address', nextAddress);

        setChangeAddressComplete(true);
      }
    });
    // --------- using promise ------------
  };

  // handle login btn pressed
  const handleLoginBtn = async () => {
    handleGlobalSpinner(true);
    await generateTestnetAddressAndPrivateKey(mnemonic);
  };

  const generateMnemonicPhrase = () => {
    const text = bip39.generateMnemonic();
    setMnemonic(text);
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
          <Text style={styles.mainText}>
            {type === 'create_wallet'
              ? 'Generate 12 word Mnemonic Phrase'
              : 'Enter 12 word Mnemonic Phrase'}
          </Text>
          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="Enter Mnemonic Phrase"
              style={styles.textInput}
              multiline
              value={mnemonic}
              onChangeText={(text) => setMnemonic(text.trim())}
            />
          </View>
          {type === 'create_wallet' && (
            <>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity
                  style={styles.generateAddressBtn}
                  onPress={generateMnemonicPhrase}>
                  <Text style={styles.generateAddressText}>Generate</Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text style={{opacity: 0.6, paddingVertical: 10}}>
                  Click on generate button to generate a new 12 word mnemonic
                </Text>
                <Text style={{opacity: 0.6}}>
                  Please write down these words in a secure location
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.btnContainer}>
          <CustomButton
            text={type === 'create_wallet' ? 'CREATE WALLET' : 'IMPORT'}
            handleBtnClick={handleLoginBtn}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
