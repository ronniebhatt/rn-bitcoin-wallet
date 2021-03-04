import React from 'react';
import {View, Image, SafeAreaView, TouchableOpacity, Text} from 'react-native';
import {LOGO_URL} from '../../api/bitcoin/constant';
import styles from './styles';

export default function LoginScreen({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
      {/* TOP LOGO */}
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={{
          uri: LOGO_URL,
        }}
      />
      <View style={{...styles.btnContainer, flexDirection: 'row'}}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('MnemonicScreen', {type: 'import_wallet'})
          }>
          <Text style={styles.btnText}>IMPORT WALLET</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('MnemonicScreen', {type: 'create_wallet'})
          }>
          <Text style={styles.btnText}>CREATE WALLET</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
