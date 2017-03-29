"use strict";

// http://stackoverflow.com/a/18234317
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];
        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }
    return str;
}

function remove_previous_image() {
    try {
        document.getElementsByTagName("img")[0].remove();
    } catch(e) {}
}

function convert_canvas_to_jpeg(canvas, bg_color = "#fdfeff", image_format) {
    var image = new Image();
    //image_format = "image/" + image_format;
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
        CTX.fillStyle = bg_color; ///для хрома-ки выделения
        CTX.fillRect(0, 0, w, h);
        CTX.drawImage(canvas, 0, 0, w, h);
        image.src = tmp_canvas.toDataURL(image_format);
    } else {
        image.src = canvas.toDataURL(image_format);
    }
    return image;
}

function res_log(original_w, original_h, w, h, format) {
    if (original_h !== h || original_w !== w) {
        return "{ow}x{oh} → {w}x{h}".formatUnicorn({ow:original_w, oh:original_h, w:w, h:h});
    } else {
        return "image → " + format.split("/")[1];
    }
}

function notify(original_w, original_h, w, h, format) {
    var title = res_log(original_w, original_h, w, h, format);
    var notification = new Notification(title, {
        icon: "style/notification-min.png" //Icon made by www.flaticon.com/authors/roundicons, CC BY 3.0
    });
}

function get_max_side() {
    return parseInt(document.getElementById("max_side").value);
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
    color = color.substring(1);           // remove #
    if (color.length === 3)
        color = color + color             // #aaa format handling
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
}

function get_color() {
    var p = new RegExp(/^#(?:[0-9a-f]{3}){1,2}$/i);
    var input = document.getElementById("bg_color");
    var ret = p.exec(input.value);
    if (ret === null) {
        input.style = "background: #521d1d";
    } else {
        var inv = invertColor(ret);
        input.style = "background: {bg} !important; color: {co} !important".formatUnicorn({bg:ret, co:inv});
    }
    return ret;
}

function hide_color_row() {
    var el = document.getElementById("bg_color_row");
    if (get_format() === "image/png") {
        el.style = "opacity: 0.5";
    } else {
        el.style = "opacity: 1";
    }
}

function main(url) {
    GL_IMG.src = url;

    GL_IMG.onload = function() {
        var height = GL_IMG.height;
        var width = GL_IMG.width;
        var h, w;
        var max_side = get_max_side();

        if (width <= max_side && height <= max_side) {
            w = width;
            h = height;
        } else if (width > height) {
            w = max_side;
            h = Math.round(height/(width/w));
        } else if (width < height) {
            h = max_side;
            w = Math.round(width/(height/h));
        } else {
            w = max_side;
            h = max_side;
        }

        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var CTX = canvas.getContext("2d");
        CTX.drawImage(GL_IMG, 0, 0, w, h);

        pica.WEBGL = true;
        pica.resizeCanvas(GL_IMG, canvas, {
                quality: 3,
                alpha: true,
                unsharpAmount: 0,
                //unsharpRadius: unsharpRadius,
                unsharpThreshold: 0,
                transferable: true
            }, 
            function (err) {if (err) {"%c" + console.log(err, "color: #E91E63")}}
        );

        //resample_hermite(canvas, width, height, w, h) // старый
        var fmt = get_format();
        var image = convert_canvas_to_jpeg(canvas, get_color(), fmt);
        document.getElementById("c").appendChild(image);
        image.onload = function() {
            console.log("%c" + res_log(width, height, w, h, fmt), "color: #26A69A");
            notify(width, height, w, h, fmt);
        }
    }
}

var read_image = function(imgFile) {
    remove_previous_image();
    if(!imgFile || !imgFile.type.match(/image.*/)) {console.log("%c это не картинка!", "color: #E91E63"); return;}
    var reader = new FileReader();
    reader.onload = function(e) {main(e.target.result);}
    reader.readAsDataURL(imgFile);
}

// http://stackoverflow.com/a/6338207
document.onpaste = function(event) {
    remove_previous_image();
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function(event) {
                main(event.target.result)
            }; // data url!
            reader.readAsDataURL(blob);
        }
    }
}

// request permission on page load
document.addEventListener("DOMContentLoaded", function () {
    var url = window.location.href;
    if (Notification.permission !== "granted" && url.search("http") != -1)  {
        Notification.requestPermission();
        console.log("%c страница не локальная \n запрос разрешения на уведомления с характеристиками масштабируемой картинки", "color: #009688");
    }
});

//setInterval(function() {get_color(); hide_color_row()}, 200); // старый костыль

var GL_IMG = new Image(); // Для хранения изображения при повторном ресайзе

/* динамическое затемнение строки ввода цвета по ненужности 
+  изменение её цвета в соответствии с введенным */
get_color(); // сразу поменять первоначальный цвет поля ввода при загрузке страницы

var events = ["input", "change"];
var input = document.getElementsByTagName("input");

for (var i = 0; i < input.length; i++) {
    events.forEach(function(event) {
        input[i].addEventListener(event, function() {
            get_color();
            hide_color_row();
        });
    });
}

/* повторный ресайз и т.д. */
document.getElementById("render").addEventListener("click", function() {
    remove_previous_image()
    try {
        main(GL_IMG.src);
    } catch(e) {}
});

/* Собственно, сам drag and drop */
document.addEventListener("dragover", function(e) {e.preventDefault();}, true);
document.addEventListener("drop", function(e) {e.preventDefault(); read_image(e.dataTransfer.files[0]);}, true);

console.log("%c Ширина x Высота", "background: #222; color: #bada55"); //http://stackoverflow.com/a/13017382