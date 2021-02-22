import React from 'react';
import {View, ToastAndroid} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import CustomButton from '../../Components/CustomButton/CustomButton';
import Clipboard from '@react-native-community/clipboard';

export default function ReceiveScreen({route}) {
  const {bitcoinData} = route.params;

  const handleCopyBtn = () => {
    Clipboard.setString(bitcoinData.address);
    ToastAndroid.show('Link Copied', ToastAndroid.SHORT);
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
