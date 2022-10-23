import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const App = () => {
  const [allWaves,setAllWaves] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [value, setValue] = useState("");

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x154cA2c3d66f69F54668511834869EFf66b986FB";
  const contractABI = abi.abi;

  const onTextareaChanged = evt => setValue(evt.target.value);
  
  const getAllWaves = async () => {
    try {
      const { ethreum } = window;
      if (ethreum) {
        const provider = new ethers.providers.Web3Provider(ethreum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(
          wave => {
            return {
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message,
            };
          });
        // let wavesCleaned = [];
        // waves.forEach(wave => {
        //   wavesCleaned.push({
        //     address:wave.waver,
        //     timestamp: new Date(wave.timestamp * 1000),
        //     message: wave.message
        //   });
        // });

        setAllWaves(waveCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }


  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({method:"eth_accounts"});
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

/**
 * Implement your connectWallet method here
 */
const connectWallet = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get Metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    console.log("Connected", accounts[0]);
    setCurrentAccount(accounts[0]);
  } catch (error) {
    console.log(error);
  }
}

const wave = async () => {
  try {
    const { ethereum } = window;

    if ( ethereum ) {
      const provider = new ethers.providers.Web3Provider( ethereum );
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      let count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());


      console.log("text:",value);
      /**
       * Execute the actual wave from your smart contract
       */
      const waveTxn = await wavePortalContract.wave(value, { gasLimit:300000});
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);
      count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
      // alert("total wave count : "+count.toNumber());
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
}

/*
 * This runs our function when the page loads
 */
useEffect(() => {
  checkIfWalletIsConnected();
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, [])




//export default function App() {

//  const wave = () => {
    
//  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        ⚡️⚡️⚡️Welcome !⚡️⚡️⚡️
        </div>

        <textarea placeholder="Please enter a message" onChange={onTextareaChanged}>{value}</textarea>

        <div className="bio">
        Please enter a message!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {
          /**
           * If there no currentAccount render this button
           */
        }
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>Connect Wallet
          </button>
        )

        }

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App