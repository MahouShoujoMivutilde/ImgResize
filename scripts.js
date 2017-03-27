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
    if (image_format === "image/jpeg") {
        if (bg_color == undefined) {
            console.log("некорректный, или и вовсе отсутствует цвет фона, использован #fdfeff")
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

function notify(original_w, original_h, w, h) {
    var title;
    if (original_h !== h || original_w !== w) {
        title = "{0}x{1} → {2}x{3}".formatUnicorn(original_w, original_h, w, h)
    } else {
        title = "image → jpeg"
    }
    var notification = new Notification(title, {
        icon: "notification.png"
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

function get_color() {
    var p = new RegExp(/^#(?:[0-9a-f]{3}){1,2}$/i);
    var input = document.getElementById("bg_color");
    var ret = p.exec(input.value);
    if (ret === null) {
        input.style = "background: #521d1d";
    } else {
        input.style = "background: #444";
    }
    return ret;
}

function main(url) {
    var img = new Image();
    img.src = url;

    img.onload = function() {
        var height = img.height;
        var width = img.width;
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
        CTX.drawImage(img, 0, 0, w, h);

        pica.WEBGL = true;
        pica.resizeCanvas(img, canvas, {
                quality: 3,
                alpha: true,
                unsharpAmount: 0,
                //unsharpRadius: unsharpRadius,
                unsharpThreshold: 0,
                transferable: true
            }, 
            function (err) {if (err) {console.log(err)}}
        );

        //resample_hermite(canvas, width, height, w, h)
        var image = convert_canvas_to_jpeg(canvas, get_color(), get_format());
        document.getElementById("c").appendChild(image);
        image.onload = function() {
            console.log("{0}x{1} → {2}x{3}".formatUnicorn(width, height, w, h));
            notify(width, height, w, h);
        }
    }
}

var read_image = function(imgFile) {
    remove_previous_image();
    if(!imgFile.type.match(/image.*/)) {console.log("это не картинка!: ", imgFile.type); return;}
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
        console.log("страница не локальная \n запрос разрешения на уведомления с характеристиками масштабируемой картинки");
    }
});

setInterval(function(){ get_color()}, 200);

/* Собственно, сам drag and drop */
document.addEventListener("dragover", function(e) {e.preventDefault();}, true);
document.addEventListener("drop", function(e) {e.preventDefault(); read_image(e.dataTransfer.files[0]);}, true);