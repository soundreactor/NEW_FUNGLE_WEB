


var token_count = 0;

var container = document.getElementById('TokenCarousel');
var carousel;


var isMobile = false; //initiate as false
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
  || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
  isMobile = true;
}
if (window.innerHeight > window.innerWidth) {
  isMobile = true;
}

function loadCar(data) {

  console.log(data);
  console.log(data.length);

  token_count = data.length;

  var tmp_div_arr = [];

  for (ii = 0; ii < 360; ii++) {

    // OLD TOKENS
    if (ii < data.length) {
      var div = document.createElement('div');

      div.className = 'card_wrap';
      var thmb_img = data[ii][3];

      div.innerHTML = `<div class="caro-div">
        <div class="card" >
        <img class="caro-img img-thumbnail card-img-top" src="` + thmb_img + `">
        <div class="card-body">
        <h5 class="card-title">` + 'Artwork ' + (ii * 1 + 1) + ' of 360' + `</h5>
        <p class="card-text">This Token and it's Visualization
        <br>have been created on:
        <br> ` + data[ii][4] + ` by
        <br><a target="_blank" href="https://etherscan.io/address/` + data[ii][5] + `">` + data[ii][5] + `</a></p>
        <a target="_blank" href="` + opensea_trade + data[ii][0] + `" class="lowc btn btn-primary">Make an Offer</a>
        </div>
        </div>
        </div>`;

      tmp_div_arr.push(div);
    }
    // BUY CURRENT TOKEN
    if (ii == data.length) {
      var div = document.createElement('div');

      div.className = 'card_wrap';
      var thmb_img = 'https://fungle.xyz/kleee02/data/img_util.php?id=777&size=500'

      div.innerHTML = `<div class="caro-div">
        <div class="card" >
        <img class="qr caro-img img-thumbnail card-img-top" src="` + thmb_img + `">
        <div class="card-body">
        <h5 class="card-title">` + 'Artwork ' + (ii * 1 + 1) + ' of 360' + `</h5>

        <div class="lowc">


        <div class="row">
          <div class="col">
            <div class="input-group mb-3 ">
              <div class="input-group-prepend">
                <span class="input-group-text">ETH</span>
              </div>
              <input id="price_display" type="text" class="form-control"  placeholder="99999" readonly>
            </div>
          </div>
          <div class="col">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">$</span>
              </div>
              <input id="d_price_display" type="text" class="form-control"  placeholder="99999" readonly>
            </div>
          </div>
      </div>




        <button id="ethButton" class="btn btn-primary widebtn" type="button" id="button-addon2" data-toggle="modal" data-target="#exampleModalCenter">Pay with ETH</button>
      <br><button id="stripeButton" class="btn btn-primary widebtn" type="button" id="button-addon2" >Pay with Credit Card</button>


        </div>



        <p class="card-text">This Token is for Sale.<br>
        <a target="_blank" href="https://opensea.io/assets/kleee02" class="">View Gallery</a></p>


    <br>


        </div>
        </div>
        </div>`;

      tmp_div_arr.push(div);
    }
    //FUTURE BLACK TOKENS
    if (ii > data.length) {
      var div = document.createElement('div');

      div.className = 'card_wrap';
      var thmb_img = 'https://fungle.xyz/kleee02/2000px-Solid_black.svg.png';

      div.innerHTML = `<div class="caro-div">
        <div class="card" >
        <img class="caro-img img-thumbnail card-img-top" src="` + thmb_img + `">
        <div class="card-body">
        <h5 class="card-title">` + 'Artwork ' + (ii * 1 + 1) + ' of 360' + `</h5>
       <p class="card-text">This token isn't for sale yet. <br>&nbsp;</p>

          <div class="futureTokenPrice">
                <div class="row ">
                  <div class="col">
                    <div class="input-group mb-3 ">
                      <div class="input-group-prepend">
                        <span class="input-group-text">ETH</span>
                      </div>
                      <input id="price_display_id_` + (ii - data.length - 1) + `" type="text" class="form-control"  placeholder="99999" readonly>
                    </div>
                  </div>
                  <div class="col">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text">$</span>
                      </div>
                      <input id="d_price_display_id_` + (ii - data.length - 1) + `" type="text" class="form-control"  placeholder="99999" readonly>
                    </div>
                  </div>
              </div>

</div>



        </div>
        </div>
        </div>`;

      tmp_div_arr.push(div);
    }




  }

  if (isMobile) {
    shiftm_ = +1;
  } else {
    shiftm_ = 0;
  }

  //if token id is passed shift different
  var tokenid_passed = window.location.hash.substr(1);
  if (tokenid_passed) {
    //SHIFT Array LEFT TO CENTER QR code
    tmp_div_arr = tmp_div_arr.concat(tmp_div_arr.splice(0, parseInt(tokenid_passed) - 2 + shiftm_));

  } else {
    //SHIFT Array LEFT TO CENTER QR code
    tmp_div_arr = tmp_div_arr.concat(tmp_div_arr.splice(0, token_count - 1 + shiftm_));

  }


  for (ioi = 0; ioi < tmp_div_arr.length; ioi++) {
    document.getElementById('TokenCarousel').appendChild(tmp_div_arr[ioi]);
  }


  document.getElementById("stripeButton").addEventListener('click', function() {

    window.location.href = "/kleee02/buy/buyToken.html";

  }, false);

  //decide carousel count
  if (isMobile) {
    cc_ = 1;
  } else {
    cc_ = 3;
  }

  carousel = new MultiCarousel({
    target: container,
    data: {
      delay: 1000,
      items: Array.prototype.slice.call(container.children),
      count: cc_
    }
  });
  carousel.pause();


  loadJSON('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=PTCA92VPDU5J2RXFBHYH1ERN5HGBFXWZME', loadETH);



}


loadJSON('https://fungle.xyz/kleee02/tokenAPI.php', loadCar);



document.getElementById("email_btn").addEventListener("click", email_add);

function email_add(target) {

  var tmp_email = document.getElementById("email_input").value;
  var modal_elem = document.getElementById("eth-modal");
  console.log(tmp_email)
  loadJSON('https://fungle.xyz/kleee02/emailCollector.php?email=' + tmp_email, function(data) {

    console.log(data);
    if (data[0]) {
      add_alert('success', 'Email added!', modal_elem);
    } else {
      add_alert('warning', 'Email not valid.', modal_elem);
    }

  });

}


function previous() {
  carousel.previous();
}
function next() {
  carousel.next();
}




var kleee02_c = new web3.eth.Contract(abi, contract_address);
var price = 0;
// initiate contract for an address
//var kleee02_c = MyContract .at();

// call constant function (synchronous way)
function loadETH(data) {
  var priceA = kleee02_c.methods.price().call().then((result) => {
    price = web3.utils.fromWei(result, "ether");
    price = (Math.ceil(price * 1000) / 1000);

    document.getElementById("price_display").placeholder = price.toFixed(3);
    document.getElementById("price_display2").placeholder = price.toFixed(3);

    console.log("price=" + price);


    console.log(data);
    window.token_price_usd = data.result.ethusd * price;
    document.getElementById("d_price_display").placeholder = window.token_price_usd.toFixed(3);



    console.log(window.token_price_usd);

    var last_eth_p = price;
    var last_d_p = window.token_price_usd;

    for (vv = 0; vv < 360; vv++) {
      var myEle = document.getElementById("price_display_id_" + vv);
      var myEle2 = document.getElementById("d_price_display_id_" + vv);
      if (myEle) {
        last_eth_p = last_eth_p + last_eth_p / 75;
        last_d_p = last_d_p + last_d_p / 75;
        myEle.placeholder = last_eth_p.toFixed(3);
        myEle2.placeholder = last_d_p.toFixed(3);
      }
    }


  });
}
