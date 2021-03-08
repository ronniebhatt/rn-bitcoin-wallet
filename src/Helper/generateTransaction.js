import moment from 'moment';

const generateTransaction = async (data, setTransactions, transactionArray) => {
  Promise.all(
    Object.keys(data).map((address) => {
      return new Promise((resolve) => {
        fetch(
          `https://testnet-api.smartbit.com.au/v1/blockchain/address/${address}`,
        ).then((response) => {
          return new Promise(() => {
            response.json().then((transactions) => {
              if (
                transactions.address.transactions &&
                transactions.address.transactions.length !== 0
              ) {
                transactions.address.transactions.map((transaction) => {
                  transactionArray.push({
                    ...transaction,
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
    setTransactions(transactionArray);
  });
};

export default generateTransaction;
