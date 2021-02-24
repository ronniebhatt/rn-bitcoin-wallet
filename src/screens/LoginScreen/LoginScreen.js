import React, {useContext, useRef} from 'react';
import {View, Text, SafeAreaView, Image, TextInput, Alert} from 'react-native';
import Contexts from '../../Contexts/Contexts';
import styles from './styles';
import {LOGO_URL} from '../../api/bitcoin/constant';
import CustomButton from '../../Components/CustomButton/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import generateTestnetAddressAndPrivateKey from '../../Helper/generateTestnetAddress';
import {useState} from 'react/cjs/react.development';

export default function LoginScreen() {
  const ref = useRef({currentNo: 10});
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const {
    setStoredBitcoinData,
    handleGlobalSpinner,
    setIsLoggedIn,
    setMnemonicWord,
  } = useContext(Contexts);
  const [word, setWord] = useState([
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
    {text: ''},
  ]);

  const generateUnusedAddress = async () => {
    const data = await generateTestnetAddressAndPrivateKey(
      ref.current.currentNo,
      mnemonicPhrase,
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
    const data = processWords();
    if (data) {
      handleGlobalSpinner(true);
      const isUnused = await generateUnusedAddress();
      if (!isUnused) {
        const currentIndex = ref.current.currentNo + 10;
        ref.current.currentNo = currentIndex;
        handleLoginBtn();
      }
    }

    if (!data) {
      Alert.alert('Enter 12 word');
    }
  };

  // on change mnemonic phrase text
  const onChangeMnemonicText = (index, text) => {
    const newWord = [...word];
    newWord.splice(index, 1, {text});
    setWord(newWord);
  };

  // process mnemonic words array to single text
  const processWords = () => {
    const words = [];
    word.map((text) => {
      if (text.text !== '') {
        words.push(text.text);
      }
    });
    if (words.length !== 12) {
      return false;
    }
    setMnemonicPhrase(words.join(' '));
    setMnemonicWord(words.join(' '));

    return true;
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
              placeholder="word 1"
              style={styles.textInput}
              value={word[0].text}
              onChangeText={(text) => onChangeMnemonicText(0, text)}
            />
            <TextInput
              placeholder="word 2"
              style={styles.textInput}
              value={word[1].text}
              onChangeText={(text) => onChangeMnemonicText(1, text)}
            />
            <TextInput
              placeholder="word 3"
              style={styles.textInput}
              value={word[2].text}
              onChangeText={(text) => onChangeMnemonicText(2, text)}
            />
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="word 4"
              style={styles.textInput}
              value={word[3].text}
              onChangeText={(text) => onChangeMnemonicText(3, text)}
            />
            <TextInput
              placeholder="word 5"
              style={styles.textInput}
              value={word[4].text}
              onChangeText={(text) => onChangeMnemonicText(4, text)}
            />
            <TextInput
              placeholder="word 6"
              style={styles.textInput}
              value={word[5].text}
              onChangeText={(text) => onChangeMnemonicText(5, text)}
            />
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="word 7"
              style={styles.textInput}
              value={word[6].text}
              onChangeText={(text) => onChangeMnemonicText(6, text)}
            />
            <TextInput
              placeholder="word 8"
              style={styles.textInput}
              value={word[7].text}
              onChangeText={(text) => onChangeMnemonicText(7, text)}
            />
            <TextInput
              placeholder="word 9"
              style={styles.textInput}
              value={word[8].text}
              onChangeText={(text) => onChangeMnemonicText(8, text)}
            />
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="word 10"
              style={styles.textInput}
              value={word[9].text}
              onChangeText={(text) => onChangeMnemonicText(9, text)}
            />
            <TextInput
              placeholder="word 11"
              style={styles.textInput}
              value={word[10].text}
              onChangeText={(text) => onChangeMnemonicText(10, text)}
            />
            <TextInput
              placeholder="word 12"
              style={styles.textInput}
              value={word[11].text}
              onChangeText={(text) => onChangeMnemonicText(11, text)}
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
