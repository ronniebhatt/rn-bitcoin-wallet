const getBitcoinDetails = async (address) => {
  const response = await fetch(
    `https://testnet-api.smartbit.com.au/v1/blockchain/address/${address}`,
  );

  const data = await response.json();
  return data;
};
export default getBitcoinDetails;
