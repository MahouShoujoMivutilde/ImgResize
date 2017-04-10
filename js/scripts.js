"use strict";

// http://stackoverflow.com/a/18234317
String.prototype.formatUnicorn = String.prototype.formatUnicorn || function() {
  var str = this.toString();
  if (arguments.length) {
    var t = typeof arguments[0];
    var key;
    var args = ("string" === t || "number" === t) ?
      Array.prototype.slice.call(arguments) :
      arguments[0];
    for (key in args) {
      str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
    }
  }
  return str;
}

function convert_canvas_to_image(canvas, bg_color, image_format) {
  var image = new Image();
  if (image_format === "image/jpeg") {
    if (bg_color == undefined) {
      console.log("%c некорректный, или и вовсе отсутствует цвет фона, использован #fdfeff", "color: #E91E63");
      bg_color = "#fdfeff";
    }
    var w = canvas.width;
    var h = canvas.height;
    var tmp_canvas = document.createElement("canvas");
    tmp_canvas.width = w;
    tmp_canvas.height = h;
    var CTX = tmp_canvas.getContext("2d");
    CTX.fillStyle = bg_color; //для хрома-ки выделения
    CTX.fillRect(0, 0, w, h);
    CTX.drawImage(canvas, 0, 0, w, h);
    image.src = tmp_canvas.toDataURL(image_format, 1.0);
  } else {
    image.src = canvas.toDataURL(image_format);
  }
  return image;
}

function resize_log(d) {
  if (d.oh !== d.h || d.ow !== d.w) {
    return "{ow}x{oh} → {w}x{h} {s}s".formatUnicorn({
      ow: d.ow,
      oh: d.oh,
      w: d.w,
      h: d.h,
      s: (d.time/1000).toFixed(2)
    });
  } else {
    return "image → {f} {s}s".formatUnicorn({
      f: d.format.split("/")[1],
      s: (d.time/1000).toFixed(2)
    });
  }
}

function notify(dic) {
  try {
    var title;
    if (Object.keys(dic).length === 1)
      title = dic.msg;
    else
      title = resize_log(dic);
    var notification = new Notification(title, {
      icon: "style/notification-min.png" //Icon made by www.flaticon.com/authors/roundicons, CC BY 3.0
    });
  } catch (e) {}
}

function get_max_side() {
  return parseInt(document.getElementById("max_side").value);
}

function get_new_resolution(width, height, max) {
  var w, h;
  if (width <= max && height <= max) {
    w = width;
    h = height;
  } else if (width > height) {
    w = max;
    h = Math.round(height/(width/w));
  } else if (width < height) {
    h = max;
    w = Math.round(width/(height/h));
  } else {
    w = max;
    h = max;
  }
  return {width:w, height:h};
}

function get_format() {
  if (document.getElementById("jpeg").checked) {
    return "image/jpeg";
  } else {
    return "image/png";
  }
}

// http://stackoverflow.com/a/9601429
function invertColor(hexTripletColor) { // Для читаемости
  var color = hexTripletColor.toString();
  color = color.substring(1); // remove #
  if (color.length === 3)
    color = color + color // #aaa format handling
  color = parseInt(color, 16); // convert to integer
  color = 0xFFFFFF ^ color; // invert three bytes
  color = color.toString(16); // convert to hex
  color = ("000000" + color).slice(-6); // pad with leading zeros
  color = "#" + color;
  return color;
}

function get_bg_color() {
  var p = new RegExp(/^#(?:[0-9a-f]{3}){1,2}$/i);
  var input = document.getElementById("bg_color");
  var ret = p.exec(input.value);
  if (ret === null) {
    input.style.cssText = "background: #521d1d";
  } else {
    var inv = invertColor(ret);
    input.style.cssText = "background: {bg} !important; color: {text} !important".formatUnicorn({
      bg: ret,
      text: inv
    });
  }
  return ret;
}

function change_row_fade() {
  var el = document.getElementById("bg_color_row");
  if (get_format() === "image/png") {
    el.style.cssText = "opacity: 0.5";
  } else {
    el.style.cssText = "opacity: 1";
  }
}

function change_bg_text(text) {
  try {
    document.getElementById("bg_text").textContent = text;
  } catch (e) {}
}

function main(url) {
  ORIGINAL_IMAGE.src = url;

  change_bg_text("processing...");

  ORIGINAL_IMAGE.onload = function() {
    var new_res = get_new_resolution(ORIGINAL_IMAGE.width, ORIGINAL_IMAGE.height, get_max_side());
    
    var dst_canvas = document.createElement("canvas");
    dst_canvas.width = new_res.width;
    dst_canvas.height = new_res.height;

    var start = performance.now();

    window.pica.resizeCanvas(ORIGINAL_IMAGE, dst_canvas, {
      quality: 3,
      alpha: true
    }, function(err) {
      if (err) console.log("%c" + err, "color: #E91E63");
      var fmt = get_format();
      var image = convert_canvas_to_image(dst_canvas, get_bg_color(), fmt);
      var finish = performance.now();
      document.getElementById("holder").src = image.src;
      image.onload = function() {
        var msg = {
          ow: ORIGINAL_IMAGE.width,
          oh: ORIGINAL_IMAGE.height,
          w: new_res.width,
          h: new_res.height,
          format: fmt,
          time: (finish - start)
        };
        console.log("%c" + resize_log(msg), "color: #26A69A");
        notify(msg);
        change_bg_text("paste drag&drop");
      }
    });
  }
}

function read_image(imgFile) {
  if (!imgFile || !imgFile.type.match(/image.*/)) {
    var msg = "это не картинка!";
    notify({
      msg: msg
    });
    console.log("%c " + msg, "color: #E91E63");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    main(e.target.result);
  }
  reader.readAsDataURL(imgFile);
}

// http://stackoverflow.com/a/6338207
document.onpaste = function(event) {
  var items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (var index in items) {
    var item = items[index];
    if (item.kind === 'file') {
      var blob = item.getAsFile();
      var reader = new FileReader();
      reader.onload = function(event) {
        main(event.target.result) // data url!
      };
      reader.readAsDataURL(blob);
    }
  }
}

var ORIGINAL_IMAGE = new Image(); // Для хранения изображения при повторном ресайзе
document.addEventListener("DOMContentLoaded", function() {

  // request permission on page load
  var url = window.location.href;
  if (Notification.permission !== "granted" && url.search("http") != -1) {
    Notification.requestPermission();
    console.log("%c страница не локальная \n запрос разрешения на уведомления с характеристиками масштабируемой картинки", "color: #009688");
  }

  /* динамическое затемнение строки ввода цвета по ненужности 
  +  изменение её цвета в соответствии с введенным */
  get_bg_color(); // сразу поменять первоначальный цвет поля ввода при загрузке страницы

  var events = ["input", "change"];
  var input = document.getElementsByTagName("input");

  for (var i = 0; i < input.length; i++) {
    events.forEach(function(event) {
      input[i].addEventListener(event, function() {
        get_bg_color();
        change_row_fade();
      });
    });
  }

  // повторный ресайз и т.д.
  document.getElementById("render").addEventListener("click", function() {
    if (ORIGINAL_IMAGE.src) main(ORIGINAL_IMAGE.src);
  });

  // Собственно, сам drag and drop
  document.addEventListener("dragover", function(e) {
    e.preventDefault();
  }, true);
  document.addEventListener("drop", function(e) {
    e.preventDefault();
    read_image(e.dataTransfer.files[0]);
  }, true);

  // Ввод файла по клику на центральную надпись
  document.getElementById("get_img").addEventListener("change", function(e) {
    e.preventDefault();
    read_image(e.target.files[0]);
  }, true)
  
  console.log("%c Ширина x Высота", "background: #222; color: #bada55"); //http://stackoverflow.com/a/13017382
});