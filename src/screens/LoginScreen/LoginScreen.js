import React, {useContext, useRef} from 'react';
import {View, Text, SafeAreaView, Image, TextInput} from 'react-native';
import Contexts from '../../Contexts/Contexts';
import styles from './styles';
import {LOGO_URL} from '../../api/constant';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import generateTestnetAddressAndPrivateKey from '../../Helper/generateTestnetAddress';

export default function LoginScreen() {
  const ref = useRef({currentNo: 10});
  const {setStoredBitcoinData, handleGlobalSpinner, setIsLoggedIn} = useContext(
    Contexts,
  );

  const generateUnusedAddress = async () => {
    const data = await generateTestnetAddressAndPrivateKey(
      ref.current.currentNo,
    );
    if (data) {
      setStoredBitcoinData(data);
      setIsLoggedIn(true);
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
