import React from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import CustomButton from '../../CustomButton/CustomButton';
import styles from './styles';
import Feather from 'react-native-vector-icons/Feather';

export default function CreateMnemonicScreen({mnemonic, setMnemonic}) {
  return (
    <>
      <View style={styles.textInputOuterContainer}>
        <View style={styles.headerContainer}>
          <Feather name="chevron-left" size={30} color="#2a3b52" />
          <Text style={styles.mainText}>Create wallet</Text>
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
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.generateAddressBtn}
            // onPress={generateMnemonicPhrase}
          >
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
      </View>

      <View style={styles.btnContainer}>
        <CustomButton
          text="create_wallet"
          //   handleBtnClick={handleLoginBtn}
        />
      </View>
    </>
  );
}
