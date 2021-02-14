const getBitcoinDetails = async (address) => {
  const response = await fetch(
    `https://testnet-api.smartbit.com.au/v1/blockchain/addr/${address}?dir=desc&limit=50&sort=block_index`,
  );

  const data = await response.json();
  return data;
};
export default getBitcoinDetails;
