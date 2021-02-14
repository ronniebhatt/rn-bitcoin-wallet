import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function TransactionCard({transactionID, amount, isCredited}) {
  return (
    <View style={styles.txnCard}>
      <Text style={styles.transactionIDText}>{transactionID}</Text>
      <Text style={{color: isCredited ? 'green' : 'red', fontSize: 16}}>
        {isCredited ? '+' : '-'}
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.2,
    borderBottomColor: '#fff',
  },
  transactionIDText: {
    width: '70%',
    color: '#fff',
  },
});
