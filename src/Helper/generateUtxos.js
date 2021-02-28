const generateUtxos = async (
  data,
  setBitcoinBalance,
  setUtxos,
  utxoArray,
  balance,
) => {
  Promise.all(
    Object.keys(data).map((address) => {
      return new Promise((resolve) => {
        fetch(
          `https://blockstream.info/testnet/api/address/${address}/utxo`,
        ).then((response) => {
          return new Promise(() => {
            response.json().then((transactions) => {
              if (transactions.length !== 0) {
                // setting total balance
                transactions.map((transaction) => {
                  utxoArray.push({
                    ...transaction,
                    derivePath: data[address].derivePath,
                  });
                  balance += transaction.value;
                });
                setBitcoinBalance(balance);
              }
              resolve();
            });
          });
        });
      });
    }),
  ).then(() => {
    setUtxos(utxoArray);
  });
};

export default generateUtxos;
