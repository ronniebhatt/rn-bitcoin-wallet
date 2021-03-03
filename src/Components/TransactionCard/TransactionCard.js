import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function TransactionCard({
  transactionID,
  amount,
  isCredited,
  confirmations,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.txnCard}>
        <Text style={styles.transactionIDText}>{transactionID}</Text>
        <Text style={{color: isCredited ? 'green' : 'red', fontSize: 16}}>
          {isCredited ? '+' : '-'}
          {amount}
        </Text>
      </View>

      <View
        style={{
          ...styles.confirmationContainer,
          backgroundColor: isCredited ? 'green' : 'red',
        }}>
        <Text style={styles.confirmationText}>
          {confirmations} Confirmations
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.2,
    borderBottomColor: '#fff',
  },

  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionIDText: {
    width: '70%',
    color: '#fff',
  },
  confirmationContainer: {
    borderWidth: 0.5,
    borderColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginVertical: 10,
  },
  confirmationText: {
    color: '#fff',
    textTransform: 'uppercase',
  },
});
