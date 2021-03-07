import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';

export default function TransactionCard({
  date,
  amount,
  isCredited,
  confirmations,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.txnCard}>
        <Feather
          name={isCredited ? 'arrow-down-left' : 'arrow-up-right'}
          size={26}
          color={isCredited ? 'green' : 'red'}
        />
        <View style={{flexDirection: 'column', paddingLeft: 20}}>
          <Text style={styles.transactionIDText}>Bitcoin Transaction</Text>
          <View
            style={{
              ...styles.confirmationContainer,
              backgroundColor: confirmations >= 1 ? 'green' : 'red',
            }}>
            <Text style={styles.confirmationText}>
              {confirmations >= 1 ? 'CONFIRMED' : 'UNCONFIRMED'}
            </Text>
          </View>
          <Text>{confirmations >= 1 && moment.unix(date).format('LLL')}</Text>
        </View>
      </View>
      <Text style={{color: isCredited ? 'green' : 'red', fontSize: 16}}>
        {isCredited ? '+' : '-'}
        {amount} sats
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },

  txnCard: {
    flexDirection: 'row',
    width: '50%',
  },
  transactionIDText: {
    color: '#000',
    fontSize: 18,
  },
  confirmationContainer: {
    borderWidth: 0.5,
    borderColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginVertical: 10,
  },
  confirmationText: {
    color: '#fff',
    textTransform: 'uppercase',
  },
});
