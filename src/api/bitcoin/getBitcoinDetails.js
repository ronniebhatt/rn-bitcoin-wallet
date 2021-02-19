const getBitcoinDetails = async (address) => {
  const response = await fetch(
    `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full?limit=50`,
  );

  const data = await response.json();
  return data;
};
export default getBitcoinDetails;
