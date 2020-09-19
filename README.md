# railway-map-style
鉄道を強調した地図（地理院地図Vectorベクトルタイル）

国土地理院さんのGitHubで鉄道を強調した地図のstyle.jsonが公開されています。

[地理院地図Vector（仮称）で読み込めるスタイルのサンプル集](https://github.com/gsi-cyberjapan/gsimaps-vector-stylesamples)

これは、鉄道関連の地物のみを表示したスタイルですが、本レポジトリでは、別のアイデアとして、
表示する地物は標準地図・淡色地図から変えず、レイヤ順・色の変更で鉄道を強調してみました。

ついでに、鉄道や道路が太いと感じたので、少し細めにしてみました。

また、自治体等の境界を強調した地図も作成してみました。

## サンプル
https://mghs15.github.io/railway-map-style/railway.html

## 作成手順
1. main.htmlで基本的な色を整える。pale.json→custom.json
2. custom.htmlで鉄道のレイヤ順や鉄道関係注記の色を変更する。custom.json→railway.json
3. railway.htmlで表示。

※main.htmlは[style-color-change-on-web](https://github.com/mghs15/style-color-change-on-web)のもの。

`node/styleChange.js`を使うと、同じ作業が以下のようにNode.jsでできる。
```node styleChange.js pale.json railway.json```

※境界(boundary-layer)の強調スタイルについては、手作業にて編集。railway.json→railway2.json

## 利用したライブラリやコード、参考文献
* Pickr https://github.com/Simonwep/pickr
* Mapbox GL JS https://docs.mapbox.com/mapbox-gl-js/overview/
* 地理院地図Vector https://github.com/gsi-cyberjapan/gsimaps-vector-experiment
* HSL and HSV (Wikipedia) https://en.wikipedia.org/wiki/HSL_and_HSV
* gsi-vector-style-converter https://github.com/mghs15/gsi-vector-style-converter
* ベクトルタイルカラーデザイン変更ツール https://github.com/gsi-cyberjapan/gsivectortile-color-design
* style-color-change-on-web https://github.com/mghs15/style-color-change-on-web

## 備考
* 最初は、custom（順番変更）→main（色設定）としていたが、main（大まかな色設定）→custom（順番変更＋鉄道関係ラベルの色変更）のほうが良いと気づいた。

