import '../../shim';
const bitcoin = require('bitcoinjs-lib');

const generateRandomTestnet = () => {
  const TESTNET = bitcoin.networks.testnet;
  const keyPair = bitcoin.ECPair.makeRandom({network: TESTNET});
  const {address} = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: TESTNET,
  });
  const wif = keyPair.toWIF();
  const privateKey = bitcoin.ECPair.fromWIF(wif, TESTNET);

  const bitcoinObj = {
    address,
    privateKey,
    wif,
  };

  return bitcoinObj;
};
export default generateRandomTestnet;
