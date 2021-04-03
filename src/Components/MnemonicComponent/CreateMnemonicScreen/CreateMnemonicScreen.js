import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import CustomButton from '../../CustomButton/CustomButton';
import styles from './styles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-community/clipboard';

export default function CreateMnemonicScreen({
  handleBackButton,
  mnemonic_word,
  handleLoginBtn,
}) {
  const mnemonic_word_array = mnemonic_word.split(' ');
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleCopyBtn = () => {
    Clipboard.setString(mnemonic_word);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Mnemonic Copied', ToastAndroid.SHORT);
    } else {
      Alert.alert('Mnemonic Copied');
    }
  };

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
            <TouchableOpacity onPress={handleCopyBtn}>
              <MaterialCommunityIcons
                name="content-copy"
                color="#2a3b52"
                size={25}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleModal}>
              <FontAwesome name="qrcode" color="#2a3b52" size={30} />
            </TouchableOpacity>
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

      <Modal
        isVisible={isModalVisible}
        animationInTiming={1000}
        animationOutTiming={1000}
        backdropTransitionInTiming={800}
        backdropTransitionOutTiming={800}
        onBackdropPress={toggleModal}
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        style={{marginHorizontal: 0, marginVertical: 0}}>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>Scan QR to copy your Mnemonic</Text>
          <QRCode value={mnemonic_word} size={250} />
        </View>
      </Modal>
    </>
  );
}
