#!/bin/bash

cd art
read -d '' header << EOF 
<!DOCTYPE html>
<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <link href="./theme.css" rel="stylesheet">
    <title>My Art</title>
</head>
<body>
<script>
    let images = document.getElementsByClassName("image);
        var showBig = function(e){
            console.log("clicked!");
        };
</script>
    <div id="opaquecover" style="z-index: 999; background-color: black; position: absolute; display: hidden;"></div>
    <div id="imagetoshow" style="z-index: 1000; padding: 16px; position: absolute; display: hidden;"><img/></div>
    <div id="content" role="main">
        <div id="title">Art</div>
        <a href="index.html">Return</a>
        <div class="block">
            <div id="gallery">
EOF

read -d '' footer << EOF
</div>
        </div>
    </div>
</body>    
</html>
EOF
echo $header > ../art.html
ls | xargs -I {} echo "<img src='art/{}' class='medium-image image'>" >> ../art.html
echo $footer >> ../art.html