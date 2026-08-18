function shortenWalletAddress(walletAddress: string) {
  if (walletAddress.length <= 10) {
    return walletAddress; 
  }

  const start = walletAddress.slice(0, 6); 
  const end = walletAddress.slice(-4); 
  return `${start}*****${end}`; 
}

export { shortenWalletAddress };
