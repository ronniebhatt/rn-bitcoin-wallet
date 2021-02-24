import getBitcoinDetails from '../api/bitcoin/getBitcoinDetails';
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');

const getAddress = (data) => {
  return {
    address: bitcoin.payments.p2pkh({
      pubkey: data.publicKey,
      network: bitcoin.networks.testnet,
    }).address,
    privateKey: data.toWIF(),
  };
};

// get bitcoin data by bitcoin address
const getBitcoinData = async (address) => {
  try {
    const data = await getBitcoinDetails(address);
    return data;
  } catch (error) {
    console.log(error);
  }
};

const generateTestnetAddressAndPrivateKey = async (
  currentNo,
  mnemonicPhrase,
) => {
  const seed = bip39.mnemonicToSeedSync(mnemonicPhrase);
  const root = bitcoin.bip32.fromSeed(seed, bitcoin.networks.testnet);
  const branch = root
    .deriveHardened(44)
    .deriveHardened(1)
    .deriveHardened(0)
    .derive(0);

  const addressAndPrivatekey = [];

  // generate address
  for (let i = 0; i < currentNo; ++i) {
    addressAndPrivatekey.push(getAddress(branch.derive(i)));
  }

  const lastArray = addressAndPrivatekey.slice(-1).pop();
  const data = await getBitcoinData(lastArray.address);
  if (data.txs.length === 0) {
    return {
      address: lastArray.address,
      privateKey: lastArray.privateKey,
    };
  } else {
    return false;
  }
};

export default generateTestnetAddressAndPrivateKey;
