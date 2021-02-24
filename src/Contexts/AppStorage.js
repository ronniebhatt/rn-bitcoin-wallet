import React, {useState} from 'react';
import Contexts from './Contexts';

const AppStorage = ({children}) => {
  const [storedBitcoinData, setStoredBitcoinData] = useState(null);
  const [globalSpinner, setGlobalSpinner] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mnemonicWord, setMnemonicWord] = useState('');

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
  };

  return (
    <Contexts.Provider value={contextObject}>{children}</Contexts.Provider>
  );
};

export default AppStorage;
