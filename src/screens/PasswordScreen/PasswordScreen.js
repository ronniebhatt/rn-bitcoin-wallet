import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import '../../../shim';
import getBitcoinDetails from '../../api/bitcoin/getBitcoinDetails';
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');

export default function PasswordScreen() {
  function getAddress(node) {
    return {
      address: bitcoin.payments.p2pkh({
        pubkey: node.publicKey,
        network: bitcoin.networks.testnet,
      }).address,
      privateKey: node.toWIF(),
    };
  }

  // get bitcoin data by bitcoin address
  const getBitcoinData = async (address) => {
    try {
      const data = await getBitcoinDetails(address);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const seed = bip39.mnemonicToSeedSync(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    );
    console.log('seed', seed);
    const root = bitcoin.bip32.fromSeed(seed, bitcoin.networks.testnet);
    console.log('root', root);
    // const branch = root.deriveHardened(0).derive(0).derive(0);
    const branch = root
      .deriveHardened(44)
      .deriveHardened(1)
      .deriveHardened(0)
      .derive(0);
    let arr = [];

    for (let i = 0; i < 10; ++i) {
      arr.push(getAddress(branch.derive(i)));
    }
    console.log(arr);

    arr.map(async (el) => {
      const data = await getBitcoinData(el.address);
      console.log('data', data);
      if (data.txs.length === 0) {
        console.log('unused');
        return;
      } else {
        console.log('used');
      }
    });
  }, []);
  return (
    <View>
      <Text>PasswordScreen</Text>
    </View>
  );
}
