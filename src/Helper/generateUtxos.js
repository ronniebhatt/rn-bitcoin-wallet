const generateUtxos = async (data, setUtxos, utxoArray) => {
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
                });
              }
              resolve();
            });
          });
        });
      });
    }),
  ).then(() => {
    console.log('utxos', utxoArray);
    setUtxos(utxoArray);
  });
};

export default generateUtxos;
