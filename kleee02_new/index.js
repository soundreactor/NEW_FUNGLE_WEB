var ns = {};

var token_id = 1;
var path = window.location.origin+window.location.pathname;

function configureBGloop() {

  qs(".token_bg").contentWindow.background_alpha=1;
  qs(".token_bg").contentWindow.fps=60;

}

function init() {

  if (window.location.hash.substring(1)) {
    token_id = window.location.hash.substring(1);
    qs(".token_bg").src = path+"/visual/?autoplay=true#"+token_id;
  }else{
    token_id = 1;
    window.location.hash = 1;
  }


  qs(".token_bg").addEventListener('load', configureBGloop, true);
  link_button_events();

  setInterval(function() {
    qs(".active").style.backgroundColor = qs(".token_bg").contentWindow.text_color_str;

    var alllinks = qsa("body > div.content a");
    for (var i = 0; i < alllinks.length; i++) {
      alllinks[i].style.color = qs(".token_bg").contentWindow.text_color_str;
    }
  }, 1000/24);
}

ns.open_token= function() {
  console.log("sdfasdfasd");
  window.open(path+"/visual/?autoplay=true#"+qs("#token_id").value, '_blank').focus();
}

ns.open_link = function() {
  if (this.dataset.name == "gallery") {
    window.open("https://fungle.xyz/kleee02/", '_blank').focus();
  }
}

ns.menu_switch = function() {
  console.log('menuuuswitschhc');

  qs(".active").style.backgroundColor = "";
  qs(".active").classList.remove("active");
  this.classList.add("active");

  console.log(".tab_"+this.dataset.name);
  hide_all();
  show_tab(".tab_"+this.dataset.name);

  // if (this.dataset.name == "view_your_token") {
  //   qs(".token_bg").style.pointerEvents = "auto";
  // }else{
  //   qs(".token_bg").style.pointerEvents = "none";
  // }
}

function link_button_events() {
  var all_btns = qsa(".btn");
  for (var i = 0; i < all_btns.length; i++) {
    var action_ = all_btns[i].dataset.action;
    all_btns[i].addEventListener('click', ns[action_], false);
    console.log("listener for "+all_btns[i].dataset.action);
  }
}

function show_tab(name) {
  qs(name).style.opacity = "1";
  qs(name).style.display = "block";

}
function hide_tab(name) {
  qs(name).style.opacity = "0";
    qs(name).style.display = "none";
}
function hide_all() {
  var all_tabs = qsa(".tab");
  for (var i = 0; i < all_tabs.length; i++) {
    all_tabs[i].style.opacity = "0";
      all_tabs[i].style.display = "none";
  }
}

function qs(nm) {
  return document.querySelector(nm);
}

function qsa(nm) {
  return document.querySelectorAll(nm);
}



init();
