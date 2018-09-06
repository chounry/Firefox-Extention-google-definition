

var scrollChange = 0;
function cssConcat(cssDic){
    let keys = Object.keys(cssDic);
    let css="";
    
    for(var i=0;i<keys.length;i++){
        css += keys[i] + cssDic[keys[i]];
    }
    return css;
}

// this funciton for checking whether the child is in the specific parent   
function isDescendant(parent, child){
    let next_par = child.parentNode;
    // console.log(next_par);
    while(next_par != null){
        if(next_par == parent){
            return true;
        }
        next_par = next_par.parentNode;
    }
    return false;
}

// get the html file from the server 
function requestWord(selectedObj_Pos,word){    
    var req = new XMLHttpRequest();
    req.open("GET", `http://127.0.0.1:8000/api/${word}/`);

    req.onload = function(){
        getEle(this.responseText,selectedObj_Pos);
    }
    req.onerror = function(){
        console.log("error : ",this.error);
    }
    req.send();
}

function toPosition(selectedObj_Pos, dic_height){
    var offset = 10;
    var position = {
        "d_top":0,
        "d_left":0,
        "arrow_left":0,
        "isTop":true // The main dictionary is above or under the seleted word
    }
    position.d_top = selectedObj_Pos.top + selectedObj_Pos.scrollY - dic_height - offset;  
    // left = text_left - dic_width/2 + text_width/2
    position.d_left = selectedObj_Pos.left - (247/2) + selectedObj_Pos.width/2; // 230 is the width of the "main_dictionary"
    
    // check if they don't stay out of the window
    if(position.d_top < 0){
        position.isTop = false;
        position.d_top = selectedObj_Pos.top + selectedObj_Pos.height + selectedObj_Pos.scrollY + offset; // make it under the word
    }
    if(position.d_left < 0){
        position.d_left = 0;
    }
    if(position.d_left > window.innerWidth - 230){
        position.d_left = window.innerWidth - 270;
    }

    position.arrow_left = selectedObj_Pos.left - position.d_left + selectedObj_Pos.width/2 - 6; // 6 is just for adjusting it to the middle  
    return position;
}

function createSysnPlace(childNodes){
    if(childNodes.length < 1){
        return null;
    }
    
    var synonym_place = document.createElement("div");
    synonym_place.style = "display: grid;grid-template-columns: 1fr 2fr;font-size:12px;"
    var box_in = "<div style='color:rgb(234, 22, 74) !important;'><i>Synonym :</i></div><div></div>"
    synonym_place.innerHTML = box_in;
    var i = 0; 

    while(childNodes.length > 1){
        synonym_place.childNodes[1].appendChild(childNodes[0]);
    };
    return synonym_place;
}

function clearInheritedCSS(element){
    var style_computed = window.getComputedStyle(element);
    var selfCSS = element.style;
    var newCSS = "";
    
    for(var i=0;i<style_computed.length;i++){
        var has = false;
        for(var j=0;j<selfCSS.length;j++){
            if(style_computed[i] == selfCSS[j]){
                has = true;
                break;
            }
        }
        if(has){
            continue;
        }
        newCSS += style_computed[i] + ":unset !important;";
    }
    return newCSS;
}


function createLoading(){
    let win = document.createElement("div");
    win.style.textAlign = "center";
    win.setAttribute("id","main_dictionary"); 
    let img = document.createElement("img");
    img.setAttribute("src",browser.extension.getURL("./imgs/progress.gif"));
    img.setAttribute("width","16");
    win.appendChild(img);
    return win;
}

// create general main window with the selected position
function createWindow(dic_element_set,selectedObj_Pos){
    let dic_win = document.createElement("div");
    dic_win.setAttribute("id","main_dictionary");

    while(dic_element_set.childNodes.length >0){
        dic_win.appendChild(dic_element_set.childNodes[0]);
    }

    let text_algin = ":center;";
    let old_main_dic = document.getElementById("main_dictionary");
    if(old_main_dic){
        old_main_dic.remove();
        text_algin = ":unset;";
    }
    var dic_win_sty = {
        "line-height":":1.5;",
        "border-radius":":4px;",
        "background-color":":#E3E3E3;",
        "font-family":":arial,san-serif;",
        "box-sizing":":unset !important;",
        "position":":absolute;",
        "width":":230px;",
        '-moz-box-shadow':':0px 0px 10px 0px rgba(0,0,0,0.75);',
        'box-shadow':':0px 0px 10px 0px rgba(0,0,0,0.75);',
        "padding":":10px;",
        "z-index":":10000;",
        "text-align":text_algin,
    }
    
    document.documentElement.appendChild(dic_win);
    
    // console.log(dic_win.style);
    dic_win.style = cssConcat(dic_win_sty);
    let dic_win_h = dic_win.offsetHeight;

    // put the dic_win to the word location
    let offset_pos = toPosition(selectedObj_Pos, dic_win_h);
    dic_win.style.top = `${offset_pos.d_top}px`;
    dic_win.style.left = `${offset_pos.d_left}px`;

    // create arrow pointer
    let arrow_point = document.createElement("div");

    let arr_sty = {
        "background": ":#E3E3E3;",
        "padding": ":7px;",
        "width":":0;",
        "transform":":rotate(45deg);",
        "position": ":absolute;",
        "bottom": ":-6px;"
    }
    arrow_point.style = cssConcat(arr_sty);

    if(offset_pos.isTop){
        dic_win.appendChild(arrow_point);
    }else{
        dic_win.insertBefore(arrow_point, dic_win.childNodes[0]);
        arrow_point.style.bottom = "unset";
        arrow_point.style.top = "-7px";
    }
    arrow_point.style.left = `${offset_pos.arrow_left}px`;
}
// get the all the nessessary elements from the server html
function getEle(html_server,selectedObj_Pos){  
    let dic_win = document.createElement("div");
    dic_win.innerHTML = html_server;
    
    // all the element that need to display grap from the html file from server
    let word_official;
    let voice;
    let part_speech;
    let defitition;
    let synonym;
 
    try{
        defitition = dic_win.getElementsByClassName("PNlCoe")[0].children[0];
        word_official = dic_win.getElementsByClassName("vk_ans")[0];
        voice = dic_win.getElementsByClassName("lr_dct_spkr")[0];
        part_speech = dic_win.getElementsByClassName("lr_dct_sf_h")[0];

        if(!word_official){
            word_official = dic_win.getElementsByClassName("dDoNo")[0];
        }
    }catch(e){
        defitition = null;
    }
    
    try{
        synonym = createSysnPlace(dic_win.getElementsByTagName("td")[1].childNodes);
        
    }catch{
        synonym = null;
    }

    dic_win.innerHTML = "";
    
    if(defitition != null){
        
        // style the elements
        word_sty = {
            "font-weight":":bold;",
            "display":":inline;",
            "font-size":":15px !important;"
        }

        word_official.style = cssConcat(word_sty);
        part_speech.style = "font-size:13px;";
        defitition.style = "font-size:13px;";
        
        if(voice){ 
            voice_sty = {
                "height":":16px;",
                "width":":15px;",
                "margin":":0 0 5px 5px;",
                "vertical-align":":middle;",
                "display":":inline-block;"
            }
            voice.childNodes[0].setAttribute("width",12);
            voice.childNodes[0].setAttribute("height",12);
            voice.style = cssConcat(voice_sty)   
            // edit the audio source combine with "http:"
            var voice_src = voice.lastChild.attributes[0].textContent;
            voice_src = "http:"+ voice_src;
            voice.lastChild.setAttribute("src",voice_src);
            
            //audio click event
            voice.addEventListener("click",function(){
                this.lastChild.play();
            })
        }
        
        if(word_official.childNodes.length > 1){ //remove the "<sup> 1 </sup>"
            word_official.children[1].remove();
        }
        
        dic_win.appendChild(word_official);
        if(voice){dic_win.appendChild(voice);};
        dic_win.appendChild(part_speech);
        dic_win.appendChild(defitition);

        // clear inherited css
        word_official.style.cssText += clearInheritedCSS(word_official);

        if(voice){
            voice.style.cssText += clearInheritedCSS(voice);
            voice.childNodes[0].style.cssText = clearInheritedCSS(voice.childNodes[0]);
        }

        if(synonym != null){
            dic_win.appendChild(synonym);
        }  
    }else{
        var p = document.createElement("p");
        p.style.fontSize = "13px";
        p.innerText = "No definition found !";
        dic_win.appendChild(p);
    }

    try{
        dic_win.childNodes.forEach(ele => {
            ele.setAttribute("class","");
        });
    }catch{
        var i =0;
    }
    createWindow(dic_win,selectedObj_Pos);
}
function getPosition(selectedObj_Pos){
    selectedObj_Pos = selectedObj_Pos.getRangeAt(0).getBoundingClientRect();
    let pos = {
        'top':selectedObj_Pos.top,
        'left':selectedObj_Pos.left,
        'height':selectedObj_Pos.height,
        'width':selectedObj_Pos.width,
        'scrollY':window.scrollY,
    }
    return pos;
}



var selectedPos;
function main(e=null){
    var selectedObj_in = window.getSelection();
    if(selectedObj_in.toString()){
        let word = selectedObj_in.toString();
        selectedObj_in = getPosition(selectedObj_in);
        let main_dic = document.getElementById("main_dictionary");
        if(main_dic){

            // if use dbclcik the word in the last window
            // then the the selected position will not change.
            if(isDescendant(main_dic,e.target)){
                selectedObj_in = selectedPos;
            }
            main_dic.remove();
        }
        selectedPos = selectedObj_in;
        createWindow(createLoading(),selectedPos); // create a loading page first
        requestWord(selectedPos,word);
    }
}

document.addEventListener("dblclick", e=> {
    main(e);
})

document.addEventListener("keypress",e=>{
    if(e.keyCode == 27){
        document.getElementById("main_dictionary").remove();
    }
    if(e.key == "s" && window.getSelection().type == "Range"){
        main();
    }
})

document.addEventListener("click",function(e){
    if(!(isDescendant(document.getElementById("main_dictionary"),e.target)) && e.target != document.getElementById("main_dictionary")){
        document.getElementById("main_dictionary").remove();
    }
})



