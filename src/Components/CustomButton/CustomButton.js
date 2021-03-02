import React from 'react';
import {Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

export default function CustomButton({
  text,
  handleBtnClick,
  isDisabled = false,
}) {
  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.7}
      style={{...styles.btn}}
      onPress={handleBtnClick}>
      <Text style={styles.btnText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#265C7E',
    width: width - 40,
    paddingVertical: 15,
    borderRadius: 40,
  },
  btnText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
