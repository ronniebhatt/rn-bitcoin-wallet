import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function TransactionCard({
  transactionID,
  amount,
  isCredited,
  confirmed,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.txnCard}>
        <Text style={styles.transactionIDText}>{transactionID}</Text>
        <Text style={{color: isCredited ? 'green' : 'red', fontSize: 16}}>
          {isCredited ? '+' : '-'}
          {amount} sats
        </Text>
      </View>

      <View
        style={{
          ...styles.confirmationContainer,
          backgroundColor: confirmed ? 'green' : 'red',
        }}>
        <Text style={styles.confirmationText}>
          {confirmed ? 'CONFIRMED' : 'UNCONFIRMED'}
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
    color: '#000',
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
