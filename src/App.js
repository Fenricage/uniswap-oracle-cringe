import logo from './logo.svg';
import './App.css';
import * as OracleSdk from '@keydonix/uniswap-oracle-sdk'
import * as OracleSdkAdapter from '@keydonix/uniswap-oracle-sdk-adapter'
import {useEffect} from "react";
import {createMemoryRpc} from "./utils/rpc-factories";
import {ethGetBlockByNumber} from "./utils/adapters";
import emitterAbi from './emitterAbi.json'
import Web3 from 'web3'

const gasPrice = 10n**9n;

const getContract = (abi, address, web3) => {
  // const _web3 = web3
  const _web3 = new Web3(window.ethereum);
  console.log('_web3', _web3)
  return new _web3.eth.Contract(abi, address);
};



const fetchPrice = async () => {
  const rpc = await createMemoryRpc('https://rinkeby.infura.io/v3/bc4d11088848481a972333f5161120fe', gasPrice)
// create the getters the SDK needs from an Ethereum instance off the window.  you could use `window.web3.currentProvider` instead of `window.ethereum` if that is what is available
  const getStorageAt = OracleSdkAdapter.getStorageAtFactory(window.ethereum)
 const getProof = OracleSdkAdapter.getProofFactory(window.ethereum)
  const getBlockByNumber = OracleSdkAdapter.getBlockByNumberFactory(window.ethereum)
  const uniswapExchangeAddress = '3D8051F7c057d1b77b27D8DbBE638EAff0359EAa';
  const denominationTokenAddress = 0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735n;
  const denominationTokenAddress2 = `0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735`;
// estimate the moving average price off-chain for presentation in your UI
  const bNumber =  await rpc.getBlockNumber();

  // let estimatedPrice = []
  // try {
  //   estimatedPrice = OracleSdk.getPrice(rpc.getStorageAt, ethGetBlockByNumber.bind(undefined, rpc), uniswapExchangeAddress, denominationTokenAddress, bNumber)
  // } catch (e) {
  //   console.log('e', e)
  // }
  //
  // console.log('estimatedPrice', estimatedPrice)

// get the proof from the SDK
//   const proof = await OracleSdk.getProof(getStorageAt, getProof, getBlockByNumber, uniswapExchangeAddress, denominationTokenAddress, bNumber)
  const proof = await OracleSdk.getProof(rpc.getStorageAt, rpc.getProof, ethGetBlockByNumber.bind(undefined, rpc), uniswapExchangeAddress, denominationTokenAddress, bNumber - 10n)
  // console.log('proof', proof)
// inside this contract call we'll have trustless access to a Uniswap average price between `blockNumber` and `currentBlockNumber`
  const priceEmitter = getContract(emitterAbi, '0x90b0a887a008DdBE63B6aBd8D304D634dcC07516');
  console.log('rpc', rpc)
  console.log('proof', proof)
  const priceEmitterRes = await priceEmitter.methods.emitPrice(`0x${uniswapExchangeAddress}`, denominationTokenAddress2, 0n, 20n, proof)
    .send({ from: '0xab3d19A29a4a95E51abAeE18Bba2DFb62e4ddBb8' });
  console.log('priceEmitterRes', priceEmitterRes)
}

function App() {

  useEffect(() => {
    const enableMetamask =  async () => {
      await window.ethereum.enable();
    }
    enableMetamask()
  }, [])

  useEffect(() => {
    fetchPrice()
  }, [])


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
