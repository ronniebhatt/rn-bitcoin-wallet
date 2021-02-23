const getUtxosTransaction = async (address) => {
  const response = await fetch(
    `https://blockstream.info/testnet/api/address/${address}/utxo`,
  );
  console.log(response);
  const data = await response.json();
  return data;
};
export default getUtxosTransaction;
