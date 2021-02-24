import React from 'react';
import {View, TextInput, StyleSheet} from 'react-native';

export default function CustomTextInput({wordOne, wordTwo, wordThree}) {
  return (
    <View style={styles.textInputContainer}>
      <TextInput
        placeholder="word 1"
        style={styles.textInput}
        value={wordOne}
      />
      <TextInput
        placeholder="word 2"
        style={styles.textInput}
        value={wordTwo}
      />
      <TextInput
        placeholder="word 3"
        style={styles.textInput}
        value={wordThree}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    width: '30%',
    marginVertical: 10,
    height: 40,
    borderRadius: 5,
    paddingLeft: 10,
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
