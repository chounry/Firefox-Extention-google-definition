

function listenForEvent(){
    $('#box')[0].focus();

    var temWord;
    var frame = $("#frame");

    function changeiFramAction(word) {
        
        // if the old word still there we do nothing
        if ($("input[type=text]")[0].value == temWord){
            return;
        }

        temWord = word;
        if(word){
            frame.css("display", "none");
            var action = `http://127.0.0.1:8000/api/${word}/`
            $("#form").attr("action", action);
            document.getElementById("frame").onload = function(e){
                loadingImg(false);
                frame.css("display","unset");
            }
            $("#form").submit();
        }
    }
    function loadingImg(bool){
        if(bool){
            $("#loading").css("display","unset");
            return;
        }
        $("#loading").css("display","none");

    }

    document.addEventListener("click",(e)=>{
        if(e.target.id=="search_butt"){
            var word = $("input[type=text]")[0].value;
            changeiFramAction(word);
        }
    })
    
    document.addEventListener("keypress",(e)=>{
        document.onkeydown = function(e){
            if(e.key =="Enter"){
                loadingImg(true);
                $("#search_butt").addClass("search_click");
            }
        }
        document.onkeyup = function(){
            $("#search_butt").removeClass("search_click");
        }
        if(e.keyCode == 13){ //if pressing the enter
            loadingImg(true);
            var word = $("input[type=text]")[0].value;
            changeiFramAction(word);  
        }
    })
}
listenForEvent();

