import React, {useContext, useRef} from 'react';
import {View, Text, SafeAreaView, Image, TextInput, Alert} from 'react-native';
import Contexts from '../../Contexts/Contexts';
import styles from './styles';
import {LOGO_URL} from '../../api/bitcoin/constant';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import generateTestnetAddressAndPrivateKey from '../../Helper/generateTestnetAddress';
import {useState} from 'react/cjs/react.development';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const ref = useRef({currentNo: 10});
  const {
    setStoredBitcoinData,
    handleGlobalSpinner,
    setIsLoggedIn,
    setMnemonicWord,
  } = useContext(Contexts);
  const [mnemonic, setMnemonic] = useState('');

  const generateUnusedAddress = async () => {
    const data = await generateTestnetAddressAndPrivateKey(
      ref.current.currentNo,
      mnemonic,
    );
    if (data) {
      setStoredBitcoinData(data);
      setIsLoggedIn(true);
      AsyncStorage.setItem('bitcoin_async_data', JSON.stringify(data));
      handleGlobalSpinner(false);
      return true;
    }
    if (!data) {
      return false;
    }
  };

  // handle login btn pressed
  const handleLoginBtn = async () => {
    handleGlobalSpinner(true);
    const isUnused = await generateUnusedAddress();
    if (!isUnused) {
      const currentIndex = ref.current.currentNo + 10;
      ref.current.currentNo = currentIndex;
      handleLoginBtn();
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
