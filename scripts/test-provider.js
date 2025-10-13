import { JsonRpcProvider } from "ethers";
(async() => {
  const p1 = new JsonRpcProvider("https://mainnet.infura.io/v3/98efe65110994f4a88b4ce16c4d2f521");
  console.log("ETH block:", await p1.getBlockNumber());
  const p2 = new JsonRpcProvider("https://rpc.ankr.com/bsc/cad8a04abff4187043f0e4ab71c013eed4fe6e713aa4a6831798383735d45d38");
  console.log("BSC block:", await p2.getBlockNumber());
})();
