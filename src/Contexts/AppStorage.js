import React, {useState} from 'react';
import Contexts from './Contexts';

const AppStorage = ({children}) => {
  const [storedBitcoinData, setStoredBitcoinData] = useState(null);
  const [globalSpinner, setGlobalSpinner] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mnemonicWord, setMnemonicWord] = useState('');
  const [usedAndUnusedData, setUsedAndUnusedData] = useState(null);
  const [bitcoinBalance, setBitcoinBalance] = useState(0);
  const [utxos, setUtxos] = useState([]);
  const [mnemonicRoot, setMnemonicRoot] = useState(null);
  const [changeAddress, setChangeAddress] = useState('');

  const handleGlobalSpinner = (data) => {
    setGlobalSpinner(data);
  };

  const contextObject = {
    storedBitcoinData,
    setStoredBitcoinData,
    handleGlobalSpinner,
    globalSpinner,
    setIsLoggedIn,
    isLoggedIn,
    mnemonicWord,
    setMnemonicWord,
    usedAndUnusedData,
    setUsedAndUnusedData,
    utxos,
    setUtxos,
    bitcoinBalance,
    setBitcoinBalance,
    mnemonicRoot,
    setMnemonicRoot,
    changeAddress,
    setChangeAddress,
  };

  return (
    <Contexts.Provider value={contextObject}>{children}</Contexts.Provider>
  );
};

export default AppStorage;
