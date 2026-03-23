export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Vui lòng cài MetaMask!");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0]; 
  } catch (error) {
    console.error(error);
  }
};