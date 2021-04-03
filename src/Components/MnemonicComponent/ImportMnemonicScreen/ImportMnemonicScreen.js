import React from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import CustomButton from '../../CustomButton/CustomButton';
import styles from './styles';
import Feather from 'react-native-vector-icons/Feather';

export default function ImportMnemonicScreen({setMnemonic, mnemonic}) {
  return (
    <>
      <View style={styles.textInputOuterContainer}>
        <View style={styles.headerContainer}>
          <Feather name="chevron-left" size={30} color="#2a3b52" />
          <Text style={styles.mainText}>Import wallet</Text>
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Type or Paste the recovery words separated by spaces"
            style={styles.textInput}
            multiline
            value={mnemonic}
            onChangeText={(text) => setMnemonic(text)}
          />
        </View>
      </View>

      <View style={styles.btnContainer}>
        <CustomButton
          text="CREATE WALLET"
          // handleBtnClick={handleLoginBtn}
        />
      </View>
    </>
  );
}
