export const isTokenAddress = (tokenAddress: string) => {
  return tokenAddress.length > 40 && tokenAddress.length < 45;
};
