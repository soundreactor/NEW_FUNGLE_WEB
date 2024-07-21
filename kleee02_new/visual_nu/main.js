
if (window.location.hash.substring(1)) {
  var id = window.location.hash.substring(1);
}else{
  var id = 1;
  window.location.hash = 1;
}

var hash;

var show_tokenid = false;
var show_points = false;

var canvas_resolution = Math.min(window.innerHeight,window.innerWidth)*window.devicePixelRatio;
var resolution = 1 / 300;
var animation_speed = 1500; //time per frame
var lerping_speed = 3000; //time to transition point movements this is extra
var start_fresh = true; //if true the animation starts from frame 0 instead of frame 15
var smoother_lerp = false;
var background_alpha = .0;
var line_alpha = 1;
var fps = 10;
var clear_after_loop = false;

var degree;
var huearrinter;
var saturation;
var lightness;

var text_color_str = "white";
var canvas, ctx, ani_frames;
var save_idx=0;
var old_time = Date.now();

var ilda_frame_count = 0;
var ilda_points = [];
var ilda_frames = [];
var ilda_auto_save = false;

function setup() {
  // Defining the angle degree of the b-spline
  // The angle degree of the spline is either 3 or 5 depending on position 13 of the hash. If the hexadecimal number is 8(decimal) or above it is 5, if it is below 8, the degree is 3.
  if (parseInt(hash.substring(13, 14), 16) >= 8) {
    degree = 5;
  } else {
    degree = 3;
  }

  // The coloring of the b-spline is defined in HSL color space.
  // The 4 color’s hue are a mapping of the (token id → 360) to a full rotation on the hue spectrum.
  // If the token id is an odd number all colors +0 degrees on the hue scale. If the token id is an even number all colors +180 degrees.
  if (id % 2 == 0) {
    var hue = ((id * 1) + 180) % 360;
  } else {
    var hue = (id * 1);
  }


  // Color 1 with an additional offset of -20.54 degrees , color 2 11.77 , color 3 33.31 and color 4 26.13.
  // add a full cycle so we can interpolate between positive numbers
  var hue1 = (360 + hue - 20.54);
  var hue2 = (360 + hue + 11.77);
  var hue3 = (360 + hue + 33.31);
  var hue4 = (360 + hue + 26.13);


  // 4 colors are blended in a loop and applied to the spline.
  var huearr = [hue4, hue1, hue2, hue3, hue4, hue1];
  var huearrinterpre = interpolateArray(huearr, Math.round(1.25 / resolution));
  var huearrinter2 = huearrinterpre.slice(Math.round(.125 / resolution), Math.round(1.125 / resolution));

  huearrinter=[]
  // remove a full cycle
  for (var i = 0; i < huearrinter2.length; i++) {
    huearrinter[i] = huearrinter2[i]%360;
  }

  // All colors share the same saturation. To get the saturation, sample position 9 for 3 characters and map the hexadecimal value to the range of 50% - 100% saturation.
  saturation = map(parseInt(hash.substring(9, 9 + 3), 16), 0, 4095, 50, 100);

  // All colors share the same lightness of 50%.
  lightness = 50;
}


function getAnimationFrames() {

  // Defining the animation
  // For each frame, the sampling positions are to be incremented by 4, shifting the sampled positions from 0-14 to 4-18 then 8-22 and so on endlessly.
  // The hash is to be looped. Position 64 = position 0 and so on.
  // This means that 2 points change position per frame. The full animation has 16 frames (64/4).

  var frames = [];


  for (var ai = 0; ai < 16; ai++) {
    var points = [];

    hash2 = (hash + hash + hash).substring((ai * 4) % 64, (ai * 4) % 64 + 64);
    hash4 = hash2.substring(0, 16);
    // console.log(ai + "--" + hash4);


    // We assume an x,y 2-dimensional space from x = -1 to 1 and from y = -1 to 1.
    // In order to obtain the values for the x position of the first point, sample the hash at position 0 for 3 characters. This 3 character sample is interpreted as a hexadecimal number and mapped on the range from x= -1 to 1.
    // In order to obtain the y position of the 1st point, sample the hash at position 1 for 3 characters.
    // This 3 character sample is interpreted as hexadecimal number and mapped on the range from y= -1 to 1.
    // For points 2-7, x and y, the initial position of the sample from the hash is always increased by two. (e.g point 4 x samples position 6 for 3 characters)

    for (var i = 0; i < 7; i++) {

      xhex = hash4.substring(i * 2, i * 2 + 3);
      yhex = hash4.substring(i * 2 + 1, i * 2 + 1 + 3);

      // console.log(i + " xhash " + xhex);
      // console.log(i + " yhash " + yhex);

      var x = Math.round(map(parseInt(xhex, 16), 0, 4095, 0, canvas_resolution)); // 3 characters of hex are max 4095 in decimal
      var y = Math.round(map(parseInt(yhex, 16), 0, 4095, canvas_resolution, 0)); // depends if -1 is up or down

      points[i] = [x, y];

    }

    //shift the array so that most points stay the same.
    for (var ii = 0; ii < ai; ii++) {
      points.unshift(points.pop());
      points.unshift(points.pop());
    }

    frames[ai] = points;

  }



  return frames;



}





window.addEventListener("load", function() {
  canvas = qs("canvas");
  canvas.width = canvas_resolution;
  canvas.height = canvas_resolution;

  ctx = canvas.getContext("2d");
  //ctx.globalCompositeOperation = 'hard-light';
  //ctx.globalCompositeOperation = 'color';

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  hash = data[id].substring(2);//remove 0x
  console.log(hash);

  setup();

  ani_frames = getAnimationFrames();

  draw();
  animate();

  setupInterface();
}, true);


function animate() {
  draw();
  setTimeout(function() {
    window.requestAnimationFrame(animate);
  }, 1000/fps);
}


var alreadycleared = false;
function draw() {

  ilda_frame_count++;

  var new_time = (Date.now() - old_time) / animation_speed;

  var frame_prg = new_time % 1;
  var frame_idx = Math.floor(new_time) % 16;
  var old_frame_idx = (Math.floor(frame_idx) - 1) % 16;

  if (old_frame_idx == -1) {
    old_frame_idx = 15;
    //do stuff when a full animation loop is done
    if (alreadycleared == false) {

      alreadycleared = true;

      if (ilda_auto_save) {
        console.log(ilda_frame_count);
        saveILDA();
      }

      ilda_frame_count = 0;
      ilda_frames=[];

      //clear
      if (clear_after_loop) {
        console.log("clear");
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

    }


  }else {
    alreadycleared = false;
  }

  if (Math.floor(new_time) == 0 && start_fresh) {
    old_frame_idx = 0;
  }



  if (!smoother_lerp) {
    //option 1
    // lerp points according to frame progress
    var lerpedPoints = [];
    for (var iz = 0; iz < 7; iz++) {
      var x_ = lerp(ani_frames[old_frame_idx][iz][0],ani_frames[frame_idx][iz][0],frame_prg);
      var y_ = lerp(ani_frames[old_frame_idx][iz][1],ani_frames[frame_idx][iz][1],frame_prg);

      lerpedPoints[iz] = [x_,y_];
    }
  }else {
    //option 2
    //this is not part of the description,
    //but it makes the visual much more interesting to lerp the frames slower than the piont changes
    var lerpedPoints = timeLerp2D(ani_frames[old_frame_idx], ani_frames[frame_idx], lerping_speed);
  }




  var originalNumPoints = 7;
  var maxT = 1.0 - 1.0 / (originalNumPoints + 1);


  //ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0,0,0,"+background_alpha+")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  var oldx, oldy, x, y;

  var point = bspline((1 - resolution) * maxT, degree, lerpedPoints);
  oldx = point[0];
  oldy = point[1];

  // The colors are moving along the spline incrementing their position,
  // doing 2 full loops for every loop of the animation.
  var hsl_animation_off = ((frame_idx + frame_prg) / 8) % 1;
  var hsl_animation_off_res = Math.floor(hsl_animation_off * (1 / resolution));
  // console.log(hsl_animation_off);
  // console.log(Math.floor(hsl_animation_off*(1/resolution)));

  cnt = 0;
  ilda_points=[];
  for (var t = 0; t < 1; t += resolution) {
    var point = bspline(t * maxT, degree, lerpedPoints);
    //console.log(point);


    hsl_indx = huearrinter[(cnt + hsl_animation_off_res) % (1 / resolution)];
    //console.log(hsl_indx);

    ctx.strokeStyle = "hsl(" + hsl_indx + "," + saturation + "%," + lightness + "%,"+line_alpha+")";

    x = point[0];
    y = point[1];

    ilda_points.push(createILDApoint(x,y,hsl2rgb(hsl_indx,saturation,lightness)));

    ctx.beginPath();

    //console.log("wedraw")
    ctx.moveTo(oldx, oldy);


    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.closePath();


    oldx = x;
    oldy = y;

    cnt++;
  }

  // debug draw the points
  if (show_points) {
    drawPoints(lerpedPoints, ctx);
  }

  //show id or not
  var text_color = huearrinter[hsl_animation_off_res % (1 / resolution)];
  text_color_str = "hsl(" + text_color + "," + saturation + "%," + lightness + "%)";
  if (show_tokenid) {
    drawTextTR(""+id+"/360",ctx,text_color_str,.1,canvas.width*.02);
  }


  //save frame
  if (new_time>=1&&new_time<=17) {
    //console.log(new_time);
    // canvas.toBlob(function(blob) {
    //     saveAs(blob, id+"_"+save_idx+".png");
    // });
    save_idx++;
  }

  ilda_frames.push(createILDAframe(ilda_frames.length,animation_speed-(animation_speed/10),ilda_points));


}

function hsl2rgb(h,s2,l2)
{
  var s = s2/100;
  var l = l2/100;
  let a=s*Math.min(l,1-l);
  let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
  return [f(0),f(8),f(4)];
  //return [Math.round(255*f(0)),Math.round(255*f(8)),Math.round(255*f(4))];
}

function saveILDA() {
  saveJSON(JSON.stringify(ilda_frames));
}

function createILDApoint(x,y,rgb) {
  return {
    "x": Math.floor(map(x,0,canvas_resolution,-32766,32765)),
    "y": Math.floor(map(y,0,canvas_resolution,-32766,32765)),
    "z": 0,
    "r": rgb[0],
    "g": rgb[1],
    "b": rgb[2]
  };
}

function createILDAframe(index,total,points) {
  return {
    "type": 5,
    "name": "kleee02",
    "company": "s3 "+Math.floor(index),
    "points": points,
    "head": 0,
    "total": Math.floor(total),
    "colors": []
  };
}

function saveJSON(string) {
  var blob = new Blob([string], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "token_"+id+".json");
}


function setupInterface() {
  qs("canvas").addEventListener("click", function() {
    qs(".overlay").style.display = (qs(".overlay").dataset.toggled ^= 1) ? "block" : "none";
  });

  qs(".close").addEventListener("click", function() {
    qs(".overlay").style.display = (qs(".overlay").dataset.toggled ^= 1) ? "block" : "none";
  });

  qs("#animation_speed").addEventListener('input', function () {
    animation_speed = this.value*-1;
    console.log(animation_speed);
  }, false);

  qs("#background_alpha").addEventListener('input', function () {
    background_alpha = this.value;
    console.log(background_alpha);
  }, false);

  qs("#line_alpha").addEventListener('input', function () {
    line_alpha = this.value;
    console.log(line_alpha);
  }, false);

  qs("#fps").addEventListener('input', function () {
    fps = this.value;
    console.log(fps);
  }, false);

  qs("#smoother_lerp").addEventListener('change', function () {
    smoother_lerp = qs("#smoother_lerp").checked;
  }, false);

  qs("#clear_after_loop").addEventListener('change', function () {
    clear_after_loop = qs("#clear_after_loop").checked;
  }, false);
}


/////
//helpers
/////

function drawTextTR(text, ctx, color, pos,size) {
  ctx.fillStyle = color;
  ctx.font = size+'px sans-serif';
  ctx.textBaseline='top';
  ctx.textAlign = "right";
  var text_pos=[ctx.canvas.width*(1-pos),ctx.canvas.width*pos];

  ctx.fillText(text, text_pos[0],text_pos[1]);
}


var timeLerp2Dchange = [];
var timeLerp2DtimeLeft = [];
var timeLerp2DoldPos = [];

function timeLerp2D(old2d, new2d, time) {

  var out2d = [];

  // console.log(" ============  ");

  for (var i = 0; i < old2d.length; i++) {

    if (timeLerp2Dchange[i] != new2d[i][0] + new2d[i][1]) {
      timeLerp2DtimeLeft[i] = Date.now() + time;

      timeLerp2DoldPos[i] = old2d[i];

      timeLerp2Dchange[i] = new2d[i][0] + new2d[i][1];

      // console.log(i+" changed");

    }

    var left = 1 - (Math.max((timeLerp2DtimeLeft[i] - Date.now()), 0) / time);

    var lerpedX = lerp(timeLerp2DoldPos[i][0], new2d[i][0], left);
    var lerpedY = lerp(timeLerp2DoldPos[i][1], new2d[i][1], left);

    out2d[i] = [lerpedX, lerpedY];

  }

  return out2d;

}

function drawPoints(pts, ctx) {
  for (var i = 0; i < pts.length; i++) {
    ctx.fillStyle = "hsl(" + Math.round(360 / 7 * i) + ",50%,50%)";
    ctx.beginPath();
    ctx.arc(pts[i][0], pts[i][1], 5, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
  }
}


function interpolateArray(data, fitCount) {

  var linearInterpolate = function(before, after, atPoint) {
    return before + (after - before) * atPoint;
  };

  var newData = new Array();
  var springFactor = new Number((data.length - 1) / (fitCount - 1));
  newData[0] = data[0]; // for new allocation
  for (var i = 1; i < fitCount - 1; i++) {
    var tmp = i * springFactor;
    var before = new Number(Math.floor(tmp)).toFixed();
    var after = new Number(Math.ceil(tmp)).toFixed();
    var atPoint = tmp - before;
    newData[i] = linearInterpolate(data[before], data[after], atPoint);
  }
  newData[fitCount - 1] = data[data.length - 1]; // for new allocation
  return newData;
};


function lerp(v0, v1, t) {
  //  return (1 - t) * v0 + t * v1;
  return v0 + t * (v1 - v0);
}

function qs(nm) {
  return document.querySelector(nm);
}

function qsa(nm) {
  return document.querySelectorAll(nm);
}

function map(X, A, B, C, D) {
  return (X - A) / (B - A) * (D - C) + C;
}
