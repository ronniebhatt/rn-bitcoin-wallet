import React from 'react';
import {View, SafeAreaView, Text} from 'react-native';
import styles from './styles';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SetupWalletBtn from '../../../Components/CustomButton/SetupWalletBtn';

export default function SetupScreen({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Setup wallet</Text>
      </View>
      <View style={styles.btnContainer}>
        {/* Import wallet button */}
        <SetupWalletBtn
          primary_text="IMPORT WALLET"
          secondary_text="a wallet using mnemonic"
          handleClick={() =>
            navigation.navigate('MnemonicScreen', {type: 'import_wallet'})
          }>
          <Entypo name="wallet" size={50} color="#4c8fed" />
        </SetupWalletBtn>

        {/* Create wallet button */}
        <SetupWalletBtn
          primary_text="CREATE WALLET"
          secondary_text="new wallet"
          handleClick={() =>
            navigation.navigate('MnemonicScreen', {type: 'create_wallet'})
          }>
          <MaterialCommunityIcons
            name="wallet-plus"
            size={50}
            color="#4c8fed"
          />
        </SetupWalletBtn>
      </View>
    </SafeAreaView>
  );
}
