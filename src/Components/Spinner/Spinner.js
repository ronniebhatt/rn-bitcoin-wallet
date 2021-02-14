import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';

export default function Spinner() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{color: '#fff', fontSize: 22}}>Loading......</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: '#265C7E',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
