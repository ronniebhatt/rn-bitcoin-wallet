import React, {useState} from 'react';
import Contexts from './Contexts';

const AppStorage = ({children}) => {
  const [storedBitcoinData, setStoredBitcoinData] = useState(null);

  const contextObject = {
    storedBitcoinData,
    setStoredBitcoinData,
  };

  return (
    <Contexts.Provider value={contextObject}>{children}</Contexts.Provider>
  );
};

export default AppStorage;
