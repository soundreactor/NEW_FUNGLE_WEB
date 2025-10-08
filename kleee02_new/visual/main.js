/* =========================
   KLEEE02 Visual (stable smooth-lerp)
   ========================= */

if (window.location.hash.substring(1)) {
  var id = window.location.hash.substring(1);
} else {
  var id = 1;
  window.location.hash = 1;
}

var url = new URL(window.location.href);
if (url.searchParams.get("autoplay") == "true") {
  qs(".initial").style.display = "none";
} else {
  qs(".initial").style.display = "block";
}

var hash;

var show_tokenid = false;
var show_points = false;

var canvas_resolution = Math.min(window.innerHeight, window.innerWidth) * window.devicePixelRatio;
var resolution = 1 / 300;
var animation_speed = 1235;   // ms per frame step (drives 0..1 frame progress)
var lerping_speed   = 3000;   // ms "time constant" for smooth mode (larger = more overlap)
var start_fresh = true;
var smoother_lerp = true;
var background_alpha = 1;
var line_alpha = 1;
var fps = 60;
var clear_after_loop = false;

var degree;
var huearrinter;
var saturation;
var lightness;

var text_color_str = "white";
var canvas, ctx, ani_frames;
var save_idx = 0;
var old_time = Date.now();

var ilda_frame_count = 0;
var ilda_points = [];
var ilda_frames = [];
var ilda_auto_save = false;
var ilda_save_start = false;

/* ---------- NEW: EMA (low-pass) state for smooth mode ---------- */
var emaPoints = null;              // [[x,y]*7] smoothed points we draw
var lastNow = performance.now();   // for dt
// Convert lerping_speed (ms to ~95% settle) into exponential smoothing alpha
function alphaFromDur(dtSec) {
  // Choose tau so that about 95% is reached around lerping_speed
  // For exp smoothing, 1 - e^(-t/tau) ≈ 0.95 → tau ≈ t/3
  var tau = Math.max(1e-3, (lerping_speed / 1000) / 3);
  var a = 1 - Math.exp(-dtSec / tau);
  // Clamp just in case of tab resumes
  if (a < 0) a = 0;
  if (a > 0.6) a = 0.6; // cap to avoid big jumps on huge dt
  return a;
}
/* --------------------------------------------------------------- */

function setup() {
  // Degree from hash nibble 13
  degree = (parseInt(hash.substring(13, 14), 16) >= 8) ? 5 : 3;

  // Hues from token id (even ids +180°)
  var hue = (id % 2 === 0) ? ((id * 1 + 180) % 360) : (id * 1);

  var hue1 = (360 + hue - 20.54);
  var hue2 = (360 + hue + 11.77);
  var hue3 = (360 + hue + 33.31);
  var hue4 = (360 + hue + 26.13);

  var huearr = [hue4, hue1, hue2, hue3, hue4, hue1];
  var huearrinterpre = interpolateArray(huearr, Math.round(1.25 / resolution));
  var huearrinter2 = huearrinterpre.slice(Math.round(.125 / resolution), Math.round(1.125 / resolution));

  huearrinter = [];
  for (var i = 0; i < huearrinter2.length; i++) {
    huearrinter[i] = huearrinter2[i] % 360;
  }

  saturation = map(parseInt(hash.substring(9, 12), 16), 0, 4095, 50, 100);
  lightness = 50;
}

function getAnimationFrames() {
  // 16 frames; per spec only two points change between frames.
  var frames = [];
  for (var ai = 0; ai < 16; ai++) {
    var points = [];
    var hash2 = (hash + hash + hash).substring((ai * 4) % 64, (ai * 4) % 64 + 64);
    var hash4 = hash2.substring(0, 16);

    for (var i = 0; i < 7; i++) {
      var xhex = hash4.substring(i * 2, i * 2 + 3);
      var yhex = hash4.substring(i * 2 + 1, i * 2 + 1 + 3);

      var x = Math.round(map(parseInt(xhex, 16), 0, 4095, 0, canvas_resolution));
      var y = Math.round(map(parseInt(yhex, 16), 0, 4095, canvas_resolution, 0));

      points[i] = [x, y];
    }

    // Shift so majority of points persist & exactly 2 move per frame
    for (var ii = 0; ii < ai; ii++) {
      points.unshift(points.pop());
      points.unshift(points.pop());
    }
    frames[ai] = points;
  }
  return frames;
}

window.addEventListener("load", function () {
  canvas = qs("canvas");
  canvas.width = canvas_resolution;
  canvas.height = canvas_resolution;

  ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  hash = data[id].substring(2); // strip 0x
  setup();
  ani_frames = getAnimationFrames();

  draw();
  animate();
  setupInterface();
  loadStatic();
}, true);

function animate() {
  draw();
  setTimeout(function () {
    window.requestAnimationFrame(animate);
  }, 1000 / fps);
}

var alreadycleared = false;
function draw() {
  ilda_frame_count++;

  // Base timeline for frame indices (unchanged)
  var new_time = (Date.now() - old_time) / animation_speed;

  var frame_prg = new_time % 1;
  var frame_idx = Math.floor(new_time) % 16;
  var old_frame_idx = (Math.floor(frame_idx) - 1) % 16;

  if (old_frame_idx == -1) {
    old_frame_idx = 15;

    // end-of-loop events
    if (alreadycleared == false) {
      alreadycleared = true;

      if (ilda_auto_save) {
        saveILDA();
        ilda_auto_save = false;
        qs(".record_json").style.border = "none";
      }
      if (ilda_save_start) {
        ilda_auto_save = true;
        ilda_save_start = false;
      }

      ilda_frame_count = 0;
      ilda_frames = [];

      if (clear_after_loop) {
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  } else {
    alreadycleared = false;
  }

  if (Math.floor(new_time) == 0 && start_fresh) {
    old_frame_idx = 0;
  }

  // -------- Base (ground-truth) interpolation: exactly 2 points move ----------
  var basePoints = new Array(7);
  for (var iz = 0; iz < 7; iz++) {
    var x_ = lerp(ani_frames[old_frame_idx][iz][0], ani_frames[frame_idx][iz][0], frame_prg);
    var y_ = lerp(ani_frames[old_frame_idx][iz][1], ani_frames[frame_idx][iz][1], frame_prg);
    basePoints[iz] = [x_, y_];
  }

  // -------- Smooth Lerp (EMA over base) ----------
  const now = performance.now();
  let dtSec = (now - lastNow) / 1000;
  if (!isFinite(dtSec) || dtSec < 0) dtSec = 0;
  // Cap dt in case tab resumes
  if (dtSec > 0.1) dtSec = 0.1;
  lastNow = now;

  let drawPointsArr;
  if (!smoother_lerp) {
    emaPoints = null; // reset EMA when smooth is off
    drawPointsArr = basePoints;
  } else {
    if (!emaPoints) {
      // first frame in smooth mode: start from base (no jump)
      emaPoints = clonePts(basePoints);
    } else {
      const a = alphaFromDur(dtSec);
      for (let i = 0; i < 7; i++) {
        emaPoints[i][0] = emaPoints[i][0] + a * (basePoints[i][0] - emaPoints[i][0]);
        emaPoints[i][1] = emaPoints[i][1] + a * (basePoints[i][1] - emaPoints[i][1]);
      }
    }
    drawPointsArr = emaPoints;
  }
  // -----------------------------------------------

  // Spline draw
  var originalNumPoints = 7;
  var maxT = 1.0 - 1.0 / (originalNumPoints + 1);

  ctx.fillStyle = "rgba(0,0,0," + background_alpha + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var p0 = bspline((1 - resolution) * maxT, degree, drawPointsArr);
  var oldx = p0[0];
  var oldy = p0[1];

  // Colors: two loops per full animation
  var hsl_animation_off = ((frame_idx + frame_prg) / 8) % 1;
  var hsl_animation_off_res = Math.floor(hsl_animation_off * (1 / resolution));

  var cnt = 0;
  ilda_points = [];
  for (var t = 0; t < 1; t += resolution) {
    var pt = bspline(t * maxT, degree, drawPointsArr);
    var hsl_indx = huearrinter[(cnt + hsl_animation_off_res) % (1 / resolution)];
    ctx.strokeStyle = "hsl(" + hsl_indx + "," + saturation + "%," + lightness + "%," + line_alpha + ")";

    var x = pt[0];
    var y = pt[1];

    ilda_points.push(createILDApoint(x, y, hsl2rgb(hsl_indx, saturation, lightness)));

    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();

    oldx = x;
    oldy = y;

    cnt++;
  }

  // Debug control points
  if (show_points) drawPoints(drawPointsArr, ctx);

  // Token id text
  var text_color = huearrinter[hsl_animation_off_res % (1 / resolution)];
  text_color_str = "hsl(" + text_color + "," + saturation + "%," + lightness + "%)";
  if (show_tokenid) drawTextTR("" + id + "/360", ctx, text_color_str, .1, canvas.width * .02);

  // Save counter
  if (new_time >= 1 && new_time <= 17) save_idx++;

  ilda_frames.push(createILDAframe(ilda_frames.length, animation_speed - (animation_speed / 10), ilda_points));
}

/* ===================== helpers & UI ===================== */

function clonePts(arr) {
  const out = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = [arr[i][0], arr[i][1]];
  return out;
}

function hsl2rgb(h, s2, l2) {
  var s = s2 / 100;
  var l = l2 / 100;
  let a = s * Math.min(l, 1 - l);
  let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)];
}

function saveILDA() {
  saveJSON(JSON.stringify(ilda_frames));
}

function createILDApoint(x, y, rgb) {
  return {
    "x": Math.floor(map(x, 0, canvas_resolution, -32766, 32765)),
    "y": Math.floor(map(y, 0, canvas_resolution, -32766, 32765)),
    "z": 0,
    "r": rgb[0],
    "g": rgb[1],
    "b": rgb[2]
  };
}

function createILDAframe(index, total, points) {
  return {
    "type": 5,
    "name": "kleee02",
    "company": "s3 " + Math.floor(index),
    "points": points,
    "head": 0,
    "total": Math.floor(total),
    "colors": []
  };
}

function saveJSON(string) {
  var blob = new Blob([string], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "token_" + id + ".json");
}

function setupInterface() {
  qs("canvas").addEventListener("click", function () {
    qs(".overlay").style.display = (qs(".overlay").dataset.toggled ^= 1) ? "block" : "none";
  });

  qs(".close").addEventListener("click", function () {
    qs(".overlay").style.display = (qs(".overlay").dataset.toggled ^= 1) ? "block" : "none";
  });

  qs(".record_json").addEventListener("click", function () {
    qs(".record_json").style.border = "solid red 5px";
    ilda_save_start = true;
  });

  qs("#animation_speed").addEventListener('input', function () {
    // negative slider? keep compatibility with your UI
    animation_speed = this.value * -1;
  }, false);

  qs("#background_alpha").addEventListener('input', function () {
    background_alpha = this.value;
  }, false);

  qs("#line_alpha").addEventListener('input', function () {
    line_alpha = this.value;
  }, false);

  qs("#fps").addEventListener('input', function () {
    fps = this.value;
  }, false);

  qs("#smoother_lerp").addEventListener('change', function () {
    smoother_lerp = qs("#smoother_lerp").checked;
    // Re-initialize EMA on toggle to avoid any jump
    emaPoints = null;
    lastNow = performance.now();
  }, false);

  qs("#clear_after_loop").addEventListener('change', function () {
    clear_after_loop = qs("#clear_after_loop").checked;
  }, false);

  qs(".initial_text").addEventListener('click', function () {
    qs(".initial").style.display = "none";
  });
}

function loadStatic() {
  var path_ = "https://fungle.xyz/kleee02/data/token_timelapse_gen_token_id_";
  qs(".initial").style.backgroundImage = 'url(' + path_ + id.padStart(3, "0") + '.png' + ')';
}

function drawTextTR(text, ctx, color, pos, size) {
  ctx.fillStyle = color;
  ctx.font = size + 'px sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = "right";
  var text_pos = [ctx.canvas.width * (1 - pos), ctx.canvas.width * pos];
  ctx.fillText(text, text_pos[0], text_pos[1]);
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
  var linearInterpolate = function (before, after, atPoint) {
    return before + (after - before) * atPoint;
  };
  var newData = new Array();
  var springFactor = new Number((data.length - 1) / (fitCount - 1));
  newData[0] = data[0];
  for (var i = 1; i < fitCount - 1; i++) {
    var tmp = i * springFactor;
    var before = new Number(Math.floor(tmp)).toFixed();
    var after = new Number(Math.ceil(tmp)).toFixed();
    var atPoint = tmp - before;
    newData[i] = linearInterpolate(data[before], data[after], atPoint);
  }
  newData[fitCount - 1] = data[data.length - 1];
  return newData;
};

function lerp(v0, v1, t) { return v0 + t * (v1 - v0); }
function qs(nm) { return document.querySelector(nm); }
function qsa(nm) { return document.querySelectorAll(nm); }
function map(X, A, B, C, D) { return (X - A) / (B - A) * (D - C) + C; }
