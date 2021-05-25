import React, { Component } from 'react';
import Identicon from 'identicon.js';

class DriverId extends Component {

  render() {
    return (
      
      <div className="container-fluid mt-5">
        
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" >
          <h1 className="text-center">Regional Transport Office of India</h1>
            <div className="content mr-auto ml-auto" style={{ maxWidth: '500px' }}>
              
              <br/>
              <br/>
              
              <h3 align='center'>Uploaded Ids</h3>

              
              {this.props.driver.map((img_var, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(img_var.author, 30).toString()}`}
                      />
                      <small className="text-muted">{img_var.author}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                      <form onSubmit={(event) => {
                        event.preventDefault()
                        
                        if(!img_var.verify){
                          img_var.verified = "Profile is verified"
                        }
                        else{
                          img_var.verified = ""
                        }
                        const name = img_var.driver_name
                        const hash = img_var.hash
                        const nid = img_var.id
                        /*this.props.uploadImaging(name,hash,true)*/
                        this.props.verifyDriver(key,img_var.hash,img_var.driver_name,img_var.author)
                        }} >
                          <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${img_var.hash}`} style={{ maxWidth: '420px'}}/></p>
                          <p className="text-center">{img_var.driver_name}</p>
                          <p className="text-center">{img_var.verified}</p>
                          <button type="submit" className="btn btn-success btn-x btn-grp ">Accept</button>
                        </form>
                      </li>
                      
                    </ul>
                    
                  </div>
                )
              })}


            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default DriverId;