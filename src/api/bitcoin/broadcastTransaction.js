const broadcastTransaction = async (hexData) => {
  const response = await fetch(
    'https://testnet-api.smartbit.com.au/v1/blockchain/pushtx',
    {
      method: 'POST',
      body: JSON.stringify(hexData),
    },
  );
  const data = await response.json();
  return data;
};
export default broadcastTransaction;
