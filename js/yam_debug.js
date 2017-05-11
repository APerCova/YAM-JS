/**
 * Bug con secuencias de escape
 * [if(next == "/" && bef!=="\\" && !bstr){//inicia comentario de linea]
 */
var yam = (yam ||
(function(){

    var _yam = {
        minify:function(a){
            a = a||"";
            a = this.normalizeLineEnd(a);
            a = this.cleanComments(a);
            a = this.trimLines(a);
            a = this.cleanOperatorSpaces(a);
            a = this.cleanOtherSpaces(a);
            a = a.trim();
            return a;
        },
        normalizeLineEnd:function(a){
            a = a.replace(/\r/g,"\n");
            a = a.replace(/\n{2,}/g,"\n");
            return a;
        },
        trimLines:function(a){
            var lines = a.match(/[^\n]*\n+/g);
            var line;
            for(l in lines){
                line = lines[l];
                a = a.replace(line, (line.trim()? line.trim()+" ":" "));
            }
            return a;
        },
        cleanOtherSpaces:function(a){
            a = a.replace(/\s{2,}/g," ");
            a = a.replace(/\n/g," ");
            return a;
        },
        cleanOperatorSpaces:function(a){
            var matches = a.match(/\s*[\.\,\;\:\?\+\-\*\/\=\!=\&\|\^\~\>\<\(\)\{\}\[\]]\s*/g);
            var match, replacement;
            for(m in matches){
                match = matches[m];
                replacement = match.replace(/[^\n]+/, match.trim());
                a = a.replace(match, replacement);
            }
            return a;
        },
        isEscaped(stream, pos){
            var cur = stream[pos];
            var bef = stream[pos-1];
            console.log("cur->"+cur);
            console.log("bef->"+bef);
            if(!bef || bef !== "\\"){
                return false;
            }else{
                //check if \ is also escaped
                bef = stream[pos-2];
                if(!bef || bef !== "\\"){
                    return true;
                }else{
                    return false;
                }
            }
        },
        cleanComments:function(a){
            var len = a.length;
            var posArr = [];
            var cur, nex, bef, pos_a, pos_b, quote;
            var blc = false, bmc = false, bstr = false, esc = false;
            for(var i = 0; i<len;i++){
                // console.log("pos-->"+i);
                cur  = a[i];
                bef  = a[i-1];
                next = a[i+1];
                // if((cur === "\"" || cur === "\'") && bef !== "\\"){//cadena de texto
                if((cur === "\"" || cur === "\'")){//cadena de texto
                    if(_yam.isEscaped(a, i)){
                        continue;
                    }
                    if(!blc && !bmc){
                        if(bstr){//cadena abierta
                            if(quote === cur){//cerrar cadena 
                                quote = "";
                                bstr = !bstr;
                            }
                        }else{//cadena cerrada
                            quote = cur;
                            bstr = !bstr;
                        }
                    }
                }
                if(cur === "/"){
                    
                    if(next === "*" && !bstr){//inicia comentario multiple
                        pos_a = i;
                        pos_b = a.indexOf("*/", pos_a);
                        if(pos_b < 0){
                            pos_b = len;
                        }else{
                            pos_b = pos_b+2;
                        }
                        console.log("detectado comentario multiple "+a.substring(pos_a, pos_b)+" de "+pos_a+" a "+pos_b);
                        posArr.push({"a":pos_a,"b":pos_b});
                        i = pos_b-1;
                        continue;
                    }
                    if(next == "/" && !bstr){//inicia comentario de linea
                        if(_yam.isEscaped(a, i)){
                            continue;
                        }
                        pos_a = i;
                        pos_b = a.indexOf("\n", pos_a);
                        if(pos_b < 0){//EOF
                            pos_b = len;
                        }
                        console.log("detectado comentario "+a.substring(pos_a, pos_b)+" de "+pos_a+" a "+pos_b);
                        posArr.push({"a":pos_a,"b":pos_b});
                        i = pos_b-1;
                        continue;
                    }
                    // if(bef === "*" && bmc){//fin comentario multiple
                    //     bmc = false;
                    //     continue;
                    // }
                }
                if(cur === "\n"){
                    // if(blc){//si hay comentario de linea, se cierra 
                    //     blc = false;
                    // }
                    if(bstr){//si hay cadena abierta se cierra a fin de linea
                        bstr = !bstr;
                    }
                }
            }
            _a = "";
            cur  = 0; 
            for(p in posArr){
                pos_a = posArr[p].a;
                pos_b = posArr[p].b;
                _a = _a + a.slice(cur, pos_a);
                cur = pos_b;
            }
            if(cur < len){
                _a = _a + a.slice(cur);
            }
            return _a;
        }

    };

    return _yam;

})()
);


