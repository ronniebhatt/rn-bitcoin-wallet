const generateTransaction = async (data, utxoArray) => {
  console.log('called1111');
  Promise.all(
    Object.keys(data).map((address) => {
      return new Promise((resolve) => {
        fetch(
          `https://blockstream.info/testnet/api/address/${address}/txs`,
        ).then((response) => {
          return new Promise(() => {
            response.json().then((transactions) => {
              console.log('transactions', transactions);
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
    console.log('called', utxoArray);
  });
};

export default generateTransaction;
