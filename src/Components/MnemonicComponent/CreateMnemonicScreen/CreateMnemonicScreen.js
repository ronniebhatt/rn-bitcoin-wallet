import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import CustomButton from '../../CustomButton/CustomButton';
import styles from './styles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CreateMnemonicScreen({
  handleBackButton,
  mnemonic_word,
  handleLoginBtn,
}) {
  const mnemonic_word_array = mnemonic_word.split(' ');

  return (
    <>
      <View style={styles.textInputOuterContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBackButton}>
            <Feather name="chevron-left" size={30} color="#2a3b52" />
          </TouchableOpacity>
          <Text style={styles.mainText}>Create wallet</Text>
        </View>

        <View style={styles.backupWordContainer}>
          <Text style={{fontSize: 20}}>Backup words</Text>
          <View style={styles.backupWordIconContainer}>
            <MaterialCommunityIcons
              name="content-copy"
              color="#2a3b52"
              size={25}
            />
            <FontAwesome name="qrcode" color="#2a3b52" size={30} />
          </View>
        </View>

        <FlatList
          data={mnemonic_word_array}
          keyExtractor={(item) => item}
          numColumns={3}
          renderItem={({item, index, separators}) => (
            <View style={styles.mnemonicWordContainer}>
              <Text style={{opacity: 0.6}}>{`${index + 1}.`}</Text>
              <Text style={{paddingLeft: 5, opacity: 0.6}}>{item}</Text>
            </View>
          )}
          contentContainerStyle={{marginVertical: 30}}
        />

        <View>
          <Text style={{opacity: 0.6, lineHeight: 22}}>
            Please write down these words in a secure location (Not on this
            phone).
          </Text>
          <Text style={{opacity: 0.6, lineHeight: 22}}>
            If you lose access to this wallet, you will need these words in
            exactly this sequence to recover your funds.
          </Text>
        </View>
      </View>

      <View style={styles.btnContainer}>
        <CustomButton text="PROCEED" handleBtnClick={handleLoginBtn} />
      </View>
    </>
  );
}
