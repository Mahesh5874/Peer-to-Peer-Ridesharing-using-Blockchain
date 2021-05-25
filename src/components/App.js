import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import user from '../abis/user.json'
import DriverContract from '../abis/DriverContract.json'
import Navbar from './Navbar'
import Main from './Main'
import DriverId from './DriverId'
import UserClass from './userclass'

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    

    this.setState({ account: accounts[0] })
    const unitbal = await web3.eth.getBalance(accounts[0])
    const  balanceacc = await web3.utils.fromWei(unitbal,'ether')

    this.setState({balance: balanceacc})

    const networkId = await web3.eth.net.getId()
    const networkData = user.networks[networkId]

    if (networkData) {
      const User = new web3.eth.Contract(user.abi, networkData.address)
      this.setState({ User })

      const reqCounts = await User.methods.reqCount().call()
      this.setState({ reqCounts })
      
      const imgCounts = await User.methods.imgCount().call()
      this.setState({ imgCounts })

      const rideCounts = await User.methods.rideCount().call()
      this.setState({ rideCounts })
      
      //Load requests
      for (var i = 1; i <= reqCounts; i++) {
        const users_var = await User.methods.users(i).call()
        this.setState({
          users: [...this.state.users,users_var]
        })
      }

      //Load images

      for (var j=1; j<=imgCounts; j++){
        const img_var = await User.methods.driver(j).call()
        this.setState({
          driver: [...this.state.driver,img_var]
        })
      }
     /** */

     for (var k=1; k<=rideCounts; k++){
      const ride_var = await User.methods.ride(k).call()
      this.setState({
        ride: [...this.state.ride,ride_var]
      })
    }

    } else {
      window.alert('User contract not deployed to detected network.')
    }

  }

  
  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  

  rideReq = (source,destination,date,time) => {
    this.setState({loading:true })
      this.state.User.methods.rideReq(source,destination,date,time).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
  }

  uploadRide = (source,destination,date,time,rider,amount) => {
    this.setState({loading:true })
      this.state.User.methods.uploadRide(source,destination,date,time,rider,amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
  }

  

  uploadImaging = (drivername,hash,verified) =>
  {
    this.state.User.methods.uploadImg(hash,drivername,verified).send({from: this.state.account}).on('transactionHash',(hash) => {
      this.setState({loading:false})
    })

  }

  uploadImage = drivername => {
    console.log("submitting file to ipfs...")

    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if (error) {
        console.error(error)
        return
      }

    this.setState({loading:true})
      this.state.User.methods.uploadImg(result[0].hash,drivername,false).send({from: this.state.account}).on('transactionHash',(hash) => {
        this.setState({loading:false})
      })
    })
  }

  verifyDriver = (id,hashs,name,author) => {

  this.state.User.methods.verifyDriver(id,hashs,name,author).send({from: this.state.account}).on('transactionHash',(hash) => {
    this.setState({loading:false})
  })
  }

  tipImageOwner = (id, tipAmount) =>{
    this.setState({ loading: true })
    this.setState({ loading: false })
    this.state.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
    })
  }

  rideAmount = (id,amount) =>{
    this.state.User.methods.ridePayment(id).send({ from: this.state.account, value: amount }).on('transactionHash', (hash) => {
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      balance:'',
      account: '',
      User: null,
      users:[],
      driver:[],
      ride:[],
      loading: true,
      
    }
  }

  

  render() {
    let body
    const authorizedAccounts = ['0xC2FaD539fdF982eb4B262Bb38baaf59DB9eae795']
    const authorizedAccounts2 = ['0x052a51b5245B69AF60C9fdf4A7376B15bF4b0ff8']
    const authorized = authorizedAccounts.includes(this.state.account)
        if(authorizedAccounts.includes(this.state.account)){
          
          body = 
          <Main
          account={this.state.account}
          users={this.state.users}
          driver={this.state.driver}
          captureFile={this.captureFile}
          uploadImage={this.uploadImage}
          uploadRide = {this.uploadRide}
        />
          
          

        }
        else if(authorizedAccounts2.includes(this.state.account)){
          body = 
          <DriverId
          account={this.state.account}
          users={this.state.users}
          driver={this.state.driver}
          captureFile={this.captureFile}
          uploadImage={this.uploadImage}
          uploadImaging = {this.uploadImaging}
          verifyDriver = {this.verifyDriver}
        />

        }
        else{
          body = 
          <UserClass 
          account = {this.state.account}
          rideReq = {this.rideReq} 
          users={this.state.users}
          uploadRide = {this.uploadRide}
          ride = {this.state.ride}
          rideAmount = {this.rideAmount}
          
          />
                  }
    
    return (
      <div>
        <Navbar account={this.state.account}
        balance= {this.state.balance} />
        { body }

      </div>
    );
  }
}

export default App;