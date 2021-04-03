import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');
export default function SetupWalletBtn({
  children,
  handleClick,
  primary_text,
  secondary_text,
}) {
  return (
    <TouchableOpacity style={styles.btn} onPress={handleClick}>
      <View>
        <Text style={styles.btnText}>{primary_text}</Text>
        <Text style={{opacity: 0.5}}>{secondary_text}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: width - 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  btnText: {
    color: '#2a3b52',
    fontSize: 22,
    fontWeight: '600',
  },
});
