// http://stackoverflow.com/a/18234317
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
    "use strict";
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

function convert_canvas_to_image(canvas) {
    var image = new Image();
    image.src = canvas.toDataURL("image/jpeg"); // base64
    return image;
}

function notify(or_w, or_h, w, h) {
    var title;
    if (or_h !== h || or_w !== w) {
        title = "{0}x{1} → {2}x{3}".formatUnicorn(or_w, or_h, w, h)
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

// https://github.com/AleksMeshkov/Hermite-resize
function resample_hermite(canvas, W, H, W2, H2){
    var time1 = Date.now();
    W2 = Math.round(W2);
    H2 = Math.round(H2);
    if (W === W2 && H === H2) {
        return console.log('допустимый размер, только конвертирование в jpg будет применено');
    }
    var img = canvas.getContext("2d").getImageData(0, 0, W, H);
    var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
    var data = img.data;
    var data2 = img2.data;
    var ratio_w = W / W2;
    var ratio_h = H / H2;
    var ratio_w_half = Math.ceil(ratio_w/2);
    var ratio_h_half = Math.ceil(ratio_h/2);
    
    for(var j = 0; j < H2; j++){
        for(var i = 0; i < W2; i++){
            var x2 = (i + j*W2) * 4;
            var weight = 0;
            var weights = 0;
            var weights_alpha = 0;
            var gx_r = gx_g = gx_b = gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy*dy //pre-calc part of w
                for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx*dx);
                    if(w >= -1 && w <= 1){
                        //hermite filter
                        weight = 2 * w*w*w - 3*w*w + 1;
                        if(weight > 0){
                            dx = 4*(xx + yy*W);
                            //alpha
                            gx_a += weight * data[dx + 3];
                            weights_alpha += weight;
                            //colors
                            if(data[dx + 3] < 255)
                                weight = weight * data[dx + 3] / 250;
                            gx_r += weight * data[dx];
                            gx_g += weight * data[dx + 1];
                            gx_b += weight * data[dx + 2];
                            weights += weight;
                            }
                        }
                    }       
                }
            data2[x2]     = gx_r / weights;
            data2[x2 + 1] = gx_g / weights;
            data2[x2 + 2] = gx_b / weights;
            data2[x2 + 3] = gx_a / weights_alpha;
            }
        }
    console.log("resample_hermite = "+(Math.round(Date.now() - time1)/1000)+" s");
    canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
    canvas.width = W2;
    canvas.height = H2;
    canvas.getContext("2d").putImageData(img2, 0, 0);
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
        canvas.width = width;
        canvas.height = height;
        var CTX = canvas.getContext("2d");
        CTX.fillStyle = "#fdfeff"; //на случай png с прозрачностью, r253 g254 b255 - для хрома-ки выделения
        CTX.fillRect(0, 0, width, height);
        CTX.drawImage(img, 0, 0, width, height); // "рисуем" канвас картинку, но не выводим на страницу */
        resample_hermite(canvas, width, height, w, h)
        var image = convert_canvas_to_image(canvas);
        document.getElementById("c").appendChild(image);
        image.onload = function() {
            console.log("{0}x{1} → {2}x{3}, альфа-канал (если был ^__^) заполнен #fdfeff".formatUnicorn(width, height, w, h));
            notify(height, width, h, w);
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
document.onpaste = function(event){
    remove_previous_image();
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function(event){
                    main(event.target.result); // data url
                }; 
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

/* Собственно, сам drag and drop */
document.addEventListener("dragover", function(e) {e.preventDefault();}, true);
document.addEventListener("drop", function(e) {e.preventDefault(); read_image(e.dataTransfer.files[0]);}, true);