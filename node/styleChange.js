const fs = require("fs");

/*************************************************/
/*"rgba(r,g,b,a)"などのパース                      */
/*************************************************/
var parsecolor = function(txt){
  if( (txt.indexOf("rgba") == 0) || (txt.indexOf("hsla") == 0) ){
    var length = txt.length - 1;
    var type= txt.slice(0, 4);
    txt = txt.slice(5,length );
    var col = txt.split(",");
  }else{
    var length = txt.length - 1;
    var type= txt.slice(0, 3);
    txt = txt.slice(4,length );
    var col = txt.split(",");
    col.push(1);
  }
  var color = [];
  color.push( type );
  color.push( parseInt(col[0]) );
  color.push( parseInt(col[1]) );
  color.push( parseInt(col[2]) );
  color.push( Number(col[3]) );
  return color;
}


/*************************************************/
/*RGB→HSLの変換関係設定                         */
/*************************************************/
var calcsl = function(max, min) {
    var L = (max + min)/(2*255);
    var total = max + min;
    var S=(max - min)/255;
    if((total <= 0) || (total >= 510)){
        S = 0;
    }else if(total < 255){
        S = (max-min)/(total);
    }else{
        S = (max-min)/(255*2-total);
    }
    var SL = {"s" : S, "l" : L};
    return SL;
}

var rgb2hsl = function(r, g, b, a = 1) {
    var max=0; var middle=0; var min = 0; 
    var h=0; var s=0; var l=0; 
    if((r == g) && (r == b)){
        max = r; middle=b; min = g; 
        h = 0;
        var sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }else if((r <= g) && (r < b)){
        min = r;
        if(g < b){
            middle=g; max = b; 
        }else{ 
            middle=b; max = g; 
        }
        h = 60*((b-g)/(max-min))+180;
        var sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }else if((g <= b) && (g < r)){
        min = g; 
        if(r < b){
            middle=r; max = b; 
        }else{ 
            middle=b; max = r; 
        } 
        h = 60*((r-b)/(max-min))+300;
        var sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }else{
        min = b; 
        if(g < r){
            middle=g; max = r; 
        }else{ 
            middle=r; max = g; 
        }
        h = 60*((g-r)/(max-min))+60;
        var sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }
    
    if(h > 360){
        h = h - 360;
    }else if(h < 0){
        h = h + 360;
    }
    
    var hsl = [ Math.floor(h), Math.floor(s*100), Math.floor(l*100), a ];
    return hsl;
}

/*************************************************/
/*文字列"hsla(h,s,l,a)"への変換処理              */
/*************************************************/

var create_hlsa_string = function(c1, c2, c3, c4, move = 0){
    c1t = c1;
    c2t = c2;
    c3t = c3;
    c4t = c4;

    if( c1 > 360){
        c1t = c1 - 360 * Math.floor(c1/360);
    }else if(c1 < 0){
        c1t = c1 - 360 * Math.ceil(c1/360);
    }
    
    if(c2 > 100){
      c2t = 100 - move;
    }else if(c2 < 0){
      c2t = 0 + move;
    }
    
    if(c3 > 100){
      c3t = 100 - move;
    }else if(c3 < 0){
      c3t = 0 + move;
    }
    
    c1t = Math.floor(c1t);
    c2t = Math.floor(c2t) + "%";
    c3t = Math.floor(c3t) + "%";
    var color_txt = "hsla" + "(" + c1t + "," + c2t + "," + c3t + "," + c4t + ")";
    return color_txt;
}


/*************************************************/
/*色自体の変換設定（全体 + 鉄道）                */
/*************************************************/

var change_color = function({outputtype, o1, o2 , o3, o4, prop_name, slayer}){
  //変換式1=H, 2=S, 3=L
  var c1 = o1;
  var c2 = o2;
  var c3 = o3;
  var c4 = o4;
  
  //paleから
  //全体の変換
  if( o2 < 1){ //モノクロ系（H=0はpaleにはない。）
    if(o3 > 99){
      c1 = main_color_arr[0];
    }else if(prop_name.match(/text-/)){
      c1 = main_color_arr[0];
      c3 = o3 * 0.55;
    }else if(prop_name.match(/fill/)){ //建物（+中縮尺湿地）
      c1 = main_color_arr[0];//建物は量も多いため、メインカラーを適用したい。
      c2 = 50;//建物は量が多いため、汚くならないように純色にする。
    }else if(o3 > 65){ //薄い色の部分
      c1 = main_color_arr[0];
      c2 = o2 + 50;
    }else{
      c1 = main_color_arr[0];
    }
  }else if((o1 > 0) && (o1 < 41)){ //黄色系統：国道
    c1 = main_color_arr[0]; //ラインデータの中では、量も多いため、メインカラーを適用したい。
  }else if((o1 > 40) && (o1 < 45)){ //黄色系統：等高線・小縮尺道路
    c1 = main_color_arr[0];
    c3 = 80;// 等高線は薄めに、小縮尺道路は濃いめにLを調整
  }else if((o1 > 120) && (o1 < 180) && !(prop_name.match(/fill-/)) ){ //緑系統：高速道路・注記
    c1 = (o1 - 145)/3 + accnt_color_arr[0];
  }else if((o1 > 120) && (o1 < 180) && (prop_name.match(/fill-/)) ){ //緑系統：大縮尺湿地
    c1 = main_color_arr[0];
    c3 = o3 + 15;
  }else if((o1 > 200) && (o1 < 270) && (prop_name.match(/fill-/)) ){ //青色系統：水域（+万年雪）
    c1 = sub_color_arr[0]; //水域は、少し色味の違う色が良い。
  }else if((o1 > 200) && (o1 < 270) ){ //青色系統：海岸線・河川・注記
    c1 = sub_color_arr[0]; //小縮尺でメインカラーが欲しい場合、「c1 = main_color_arr[0];」に。
  }else{
    c1 = main_color_arr[0];
  }
  
  //鉄道
  if(slayer == "railway"){ 
    c1 = rail_color_arr[0];
    c2 = rail_color_arr[1];
    c3 = rail_color_arr[2];
    //c3 = (o3 + rail_color_arr[2])/2;
    
    if(c3 > 99){ //完全に白にはしない
      c3 = 99;
    } 
  }
  
  if(o3 == 100){ //白はそのまま
    c2 = o2; 
    c3 = o3;
  }
  
  
  //hslaの場合
  var color_txt = create_hlsa_string(c1, c2, c3, c4, 0);
  
  return(color_txt);
}


/*************************************************/
/*バックグラウンドの処理                         */
/*************************************************/
// layer.id = "background"を前提とする。
// background layer の初期設定
var create_backgorund_layer = function( h = main_color_arr[0], s = 100, l = 98){
var background_color = "hsla(" + h + "," + s + "%," + l + "%,1)";
  var background_layer = {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": background_color,
        "background-opacity": 1
      },
      "layout": {
        "visibility": "visible"
      }
  };
  return background_layer;
}


/*************************************************/
/*変換した色を表示しているスタイルに反映         */
/*************************************************/

//色の変換処理にかける
var change_style = function(style, callback){
    
    var layers = style.layers;
    
    /* 処理１（色変更）--------------------------------------------------------------  */
    var backgrond_flag = false; //backgroundがあるかどうかの記録用
    
    for(var i = 0;  i < layers.length;  i++ ) {
      //console.log(layer);
      var layer = layers[i];
      
      if(layer["source-layer"]){
        var slayer = layer["source-layer"];
      }else{
        var slayer = "";
      }
      
      if(layer.metadata && layer.metadata["line-role"]){
        var linerole = layer.metadata["line-role"];
      }else{
        var linerole = "";
      }
      
      if(layer.metadata && layer.metadata["path"]){
        var metapath = layer.metadata["path"];
      }else{
        var metapath = "";
      }
      
      
      for(name in layer){
        if(name === "paint"){
          for(name in layer.paint){
            if(name.match(/-color/)) {
              //console.log(name);
              //console.log(layer.paint[name]);
              
              var col = parsecolor(layer.paint[name]); //文字列をrgbaの配列にパース
              //console.log(col);
              if((col[0] == "rgba") || (col[0] == "rgb")){ //rgb系ならhslに変換
                var hsl = rgb2hsl(col[1], col[2], col[3], col[4]);
              }else{
                if(col[4] || col[4] == 0){
                  var hsl = [col[1], col[2], col[3], col[4]];
                }else{
                  var hsl = [col[1], col[2], col[3], 1];
                }
              }
              
              //console.log(hsl);
              //色を変換して反映
              layer.paint[name] = callback({
                outputtype: "hsla", 
                o1: hsl[0], 
                o2: hsl[1], 
                o3: hsl[2], 
                o4: hsl[3], 
                prop_name: name, 
                slayer: slayer,
                linerole: linerole,
                metapath: metapath
              });
              //console.log(layer.paint[name]);
            }
          }
        }
      }
      
      //backgroundがあるか記録。
      if(layer.type == "background"){
        backgrond_flag = true;
        layer.id = "background"; //IDをbackgroundに強制変更
      }
      
    }
    
    //backgroundがなければ追加
    if(!backgrond_flag){
      if(callback.name === "change_backcolor"){ // 関数名から分岐
        var background_layer = create_backgorund_layer(back_color_arr[0],back_color_arr[1],back_color_arr[2]);
      }else{
        var background_layer = create_backgorund_layer();
      }
      style.layers.unshift(background_layer);
    }
    
    //スタイルにメタデータを設定
    if(!(style.metadata)){
      style.metadata = {}
    }
    
    /* 処理２（鉄道関係、レイヤ順序変換、線幅調整）-------------------------------------------------------------- */
    var layers = style.layers;
    var results_layers = [];
    var results_raillayers = [];
    var results_symbollayers = [];
    var results_symbolraillayers = [];
    
    for(var i = 0;  i < layers.length;  i++ ) {
      //console.log(layer);
      var layer = layers[i];
      
      //各レイヤの属性情報を格納
      var metadata_path = "";
      var slayer = "";
      var manz = "-";
      var minz = "-";
      
      
      //鉄道
      if( layer["source-layer"] && layer["source-layer"] == "railway" && layer.paint["line-width"] ){
        
        if(layer["maxzoom"] < 15 ){
          var lwd = layer.paint["line-width"];
          if(!lwd.stops && lwd > 1){
            layer.paint["line-width"] = lwd/2;
          }
        }else if(layer["maxzoom"] < 18 ){
          var lwd = layer.paint["line-width"];
          if(!lwd.stops && lwd > 1){
            layer.paint["line-width"] = lwd*0.75;
          }
        }
        
        results_raillayers.push(layer);
        
      }else if( layer["source-layer"] && (layer["source-layer"] == "symbol" || layer["source-layer"] == "label")){
        //植生記号については、もうちょっと考える
        
        //鉄道・駅（道の駅除く）
        if(layer.metadata.title.match(/駅/) && !layer.metadata.title.match(/の/)){
          if(layer.paint["text-color"]){
            layer.paint["text-color"] = "hsla(240,100%,50%,1)";
          }
          if(layer.layout["text-field"]){
            layer.layout["text-field"] = ["format",
                ["get", "kana"], { "font-scale": 0.9 },
                "\n",
                ["get", "knj"], { "font-scale": 1.2 }
            ];
          }
          results_symbolraillayers.push(layer);
        }else if(layer.metadata.title.match(/鉄道/)){
          if(layer.paint["text-color"]){
            layer.paint["text-color"] = "hsla(270,100%,50%,1)";
          }
          results_symbolraillayers.push(layer);
        }else{
          results_symbollayers.push(layer);
        }
      }else{
        
        if( layer["source-layer"] && layer["source-layer"] == "road" && layer.paint["line-width"] ){
          if(layer["minzoom"] == 11 && layer["maxzoom"] == 14 ){
            var lwd = layer.paint["line-width"];
            if(!lwd.stops){
              layer.paint["line-width"] = lwd/2;
            }
          }else if(layer["minzoom"] == 8 && layer["maxzoom"] == 11 ){
            var lwd = layer.paint["line-width"];
            if(!lwd.stops){
              layer.paint["line-width"] = lwd*0.75;
            }
          }
        }
        
        results_layers.push(layer);
        
      }
    }
    
    var all_layers = [];
    all_layers = all_layers.concat(results_layers);
    all_layers = all_layers.concat(results_raillayers);
    all_layers = all_layers.concat(results_symbollayers);
    all_layers = all_layers.concat(results_symbolraillayers);
    
    style.layers = all_layers;
    
    return style;
}

/*************************************************/
/*実行                                           */
/*************************************************/

//色設定
var main_color_arr = [45, 100, 50, 1]; //hsla
var accnt_color_arr = [45, 100, 50, 1]; //hsla
var sub_color_arr = [45, 100, 50, 1]; //hsla
var rail_color_arr = [250, 100, 50, 1]; //hsla
//※鉄道関係注記の色はハードコード


//入出力・処理
var infile = process.argv[2];
var outfile = process.argv[3];

var content = fs.readFileSync(infile).toString();
var style = JSON.parse(content);

//色の処理
var styleres = change_style(style, change_color);

//メタデータの整理
styleres.metadata.colorset = {
        "main": main_color_arr,
        "sub": sub_color_arr,
        "accent":accnt_color_arr
};

var resstring = JSON.stringify(styleres, null, 4);
fs.writeFileSync(outfile, resstring);
