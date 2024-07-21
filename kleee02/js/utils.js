//globals
var MMenabled = false;

var stripe_pk = 'pk_live_9HCeWN9tguequ76JtD8AYtME';
// var stripe_pk = 'pk_test_zUJN8xXFViG8UVppvCWT5ckI'; //TEST

var opensea_trade = 'https://opensea.io/assets/0x63658cc84a5b2b969b8df9bea129a1c933e1439f/';

var contract_address = '0x63658cc84a5b2b969b8df9bea129a1c933e1439f';

// var web3nu = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/de3b7281121c4be3ba794c13bb8f34eb"));

if (typeof web3 !== 'undefined') {
  //   // Use Mist/MetaMask's provider
  //   console.log("MetaMask Found!")
  //   MMenabled = true;
  var web3nu = new Web3(web3.currentProvider);
} else {
  var web3nu = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/de3b7281121c4be3ba794c13bb8f34eb"));

}


// if (typeof web3 !== 'undefined') {
//   // Use Mist/MetaMask's provider
//   console.log("MetaMask Found!")
//   MMenabled = true;
//   window.web3 = new Web3(web3.currentProvider);
// //window.web3jsMM = new Web3(window.web3.currentProvider);
// } else {
//   var web3nu = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/de3b7281121c4be3ba794c13bb8f34eb"));
//
// }




//helper functions


function loadJSON(path, success) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error)
          console.error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}


function loadTXT(path, success) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(xhr.responseText);
      } else {
        if (error)
          console.error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

function eth2dollar(eth, success) {
  path = 'https://api.etherscan.io/api?module=stats&action=ethprice&apikey=PTCA92VPDU5J2RXFBHYH1ERN5HGBFXWZME';
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          dollpr = JSON.parse(xhr.responseText).result.ethusd * eth;
        success(dollpr);
      } else {
        if (error)
          console.error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

function wei2eth(wei) {
  return wei / 1000000000000000000;
}


function add_alert(type, text, div) {
  var alert_ok = `<div class="alert alert-` + type + ` alert-dismissible show" role="alert">
  <strong>` + text + `</strong>
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  </div>`;
  div.insertAdjacentHTML('afterbegin', alert_ok);
}

function iterationCopy(src) {
  let target = {};
  for (let prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }
  return target;
}
