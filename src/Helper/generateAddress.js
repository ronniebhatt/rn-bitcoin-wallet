const bitcoin = require('bitcoinjs-lib');

const generateAddress = (data) => {
  return {
    address: bitcoin.payments.p2pkh({
      pubkey: data.publicKey,
      network: bitcoin.networks.testnet,
    }).address,
  };
};

export default generateAddress;
