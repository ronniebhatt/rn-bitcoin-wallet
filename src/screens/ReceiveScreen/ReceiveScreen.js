import React from 'react';
import {View, ToastAndroid, Platform, Alert} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import CustomButton from '../../Components/CustomButton/CustomButton';
import Clipboard from '@react-native-community/clipboard';

export default function ReceiveScreen({route}) {
  const {bitcoinData} = route.params;

  const handleCopyBtn = () => {
    Clipboard.setString(bitcoinData.address);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Testnet Address Copied', ToastAndroid.SHORT);
    } else {
      Alert.alert('Testnet Address Copied');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      <QRCode value={bitcoinData.address} size={250} />
      <View style={{marginTop: 40}}>
        <CustomButton
          handleBtnClick={handleCopyBtn}
          text="COPY TESTNET ADDRESS"
        />
      </View>
    </View>
  );
}
