"use strict";var _Mathround=Math.round,_Stringprototype=String.prototype;_Stringprototype.formatUnicorn=_Stringprototype.formatUnicorn||function(){var a=this.toString();if(arguments.length){var b=typeof arguments[0],c,f="string"==b||"number"==b?Array.prototype.slice.call(arguments):arguments[0];for(c in f)a=a.replace(new RegExp("\\{"+c+"\\}","gi"),f[c])}return a};function convert_canvas_to_image(a,b,c){var f=new Image;if("image/jpeg"===c){b==void 0&&(console.log("%c \u043D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439, \u0438\u043B\u0438 \u0438 \u0432\u043E\u0432\u0441\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0446\u0432\u0435\u0442 \u0444\u043E\u043D\u0430, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D #fdfeff","color: #E91E63"),b="#fdfeff");var g=a.width,j=a.height,k=document.createElement("canvas");k.width=g,k.height=j;var l=k.getContext("2d");l.fillStyle=b,l.fillRect(0,0,g,j),l.drawImage(a,0,0,g,j),f.src=k.toDataURL(c,1)}else f.src=a.toDataURL(c);return f}function resize_log(a){return a.oh!==a.h||a.ow!==a.w?"{ow}x{oh} \u2192 {w}x{h} {s}s".formatUnicorn({ow:a.ow,oh:a.oh,w:a.w,h:a.h,s:(a.time/1e3).toFixed(2)}):"image \u2192 {f} {s}s".formatUnicorn({f:a.format.split("/")[1],s:(a.time/1e3).toFixed(2)})}function notify(a){try{var b=1===Object.keys(a).length?a.msg:resize_log(a);new Notification(b,{icon:"style/notification-min.png"})}catch(f){}}function get_max_side(){return parseInt(document.getElementById("max_side").value)}function get_new_resolution(a,b,c){var f,g;return a<=c&&b<=c?(f=a,g=b):a>b?(f=c,g=_Mathround(b/(a/f))):a<b?(g=c,f=_Mathround(a/(b/g))):(f=c,g=c),{width:f,height:g}}function get_format(){return document.getElementById("jpeg").checked?"image/jpeg":"image/png"}function invertColor(a){var b=a.toString();return b=b.substring(1),3===b.length&&(b+=b),b=parseInt(b,16),b=16777215^b,b=b.toString(16),b=("000000"+b).slice(-6),b="#"+b,b}function get_bg_color(){var a=new RegExp(/^#(?:[0-9a-f]{3}){1,2}$/i),b=document.getElementById("bg_color"),c=a.exec(b.value);return b.style.cssText=null===c?"background: #521d1d":"background: {bg} !important; color: {text} !important".formatUnicorn({bg:c,text:invertColor(c)}),c}function change_row_fade(){var a=document.getElementById("bg_color_row");a.style.cssText="image/png"===get_format()?"opacity: 0.5":"opacity: 1"}function change_bg_text(a){try{document.getElementById("bg_text").textContent=a}catch(b){}}function main(a){ORIGINAL_IMAGE.src=a,change_bg_text("processing..."),console.log("%c processing...","color: #26A69A"),ORIGINAL_IMAGE.onload=function(){var b=get_new_resolution(ORIGINAL_IMAGE.width,ORIGINAL_IMAGE.height,get_max_side()),c=document.createElement("canvas");c.width=b.width,c.height=b.height;var f=performance.now();pica.resize(ORIGINAL_IMAGE,c,{quality:3,alpha:!0}).then(()=>convert_canvas_to_image(c,get_bg_color(),get_format())).then((g)=>{document.getElementById("holder").src=g.src;var j=performance.now();g.onload=function(){var k={ow:ORIGINAL_IMAGE.width,oh:ORIGINAL_IMAGE.height,w:b.width,h:b.height,format:get_format(),time:j-f};console.log("%c "+resize_log(k),"color: #26A69A"),notify(k),change_bg_text("paste drag&drop")}})}}function read_image(a){if(!a||!a.type.match(/image.*/)){var b="\u044D\u0442\u043E \u043D\u0435 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430!";return notify({msg:b}),void console.log("%c "+b,"color: #E91E63")}var c=new FileReader;c.onload=function(f){main(f.target.result)},c.readAsDataURL(a)}document.onpaste=function(a){var b=(a.clipboardData||a.originalEvent.clipboardData).items;for(var c in b){var f=b[c];if("file"===f.kind){var g=f.getAsFile(),j=new FileReader;j.onload=function(k){main(k.target.result)},j.readAsDataURL(g)}}};var pica=window.pica(),ORIGINAL_IMAGE=new Image;document.addEventListener("DOMContentLoaded",function(){var a=window.location.href;"granted"!==Notification.permission&&-1!=a.search("http")&&(Notification.requestPermission(),console.log("%c \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043D\u0435 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \n \u0437\u0430\u043F\u0440\u043E\u0441 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0441 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0430\u043C\u0438 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u0443\u0435\u043C\u043E\u0439 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0438","color: #009688")),get_bg_color();for(var b=["input","change"],c=document.getElementsByTagName("input"),f=0;f<c.length;f++)b.forEach(function(g){c[f].addEventListener(g,function(){get_bg_color(),change_row_fade()})});document.getElementById("render").addEventListener("click",function(){ORIGINAL_IMAGE.src&&main(ORIGINAL_IMAGE.src)}),document.addEventListener("dragover",function(g){g.preventDefault()},!0),document.addEventListener("drop",function(g){g.preventDefault(),read_image(g.dataTransfer.files[0])},!0),document.getElementById("get_img").addEventListener("change",function(g){g.preventDefault(),read_image(g.target.files[0])},!0),console.log("%c \u0428\u0438\u0440\u0438\u043D\u0430 x \u0412\u044B\u0441\u043E\u0442\u0430","background: #222; color: #bada55")});