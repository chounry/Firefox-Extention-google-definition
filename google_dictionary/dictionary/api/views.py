from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import os,re

def home(request):
    return HttpResponse("<h2>Welcome</h2>")

def api(request,word):
    word = word.strip().lower()
    word = re.findall(r"\w+",word)

    if(not word):
        return render(request,'no-def-100.html')
    word = '-'.join(word)
    # print(settings.BASE_DIR+"/templates/")
    try:
        tmp = open(settings.BASE_DIR+"/templates/"+word+".html",mode='r')
        tmp.close()
    except:
        tmp = False
    if(tmp):
        return render(request,word+'.html')
    else:
        import requests
        import io
        param = {
            "vet": "10ahUKEwjorNXTrM_ZAhXEF5QKHdNYCGQQg4MCCCcwAA..i",
            "ved": "2ahUKEwi8p8forM_ZAhXIQpQKHd0aB4AQu-gBegQIABAC",
            "client": "firefox-b-ab",
            "yv": "2",
            "oq": word,
            "gs_l": "dictionary-widget.3..0l8.47536.47770.0.47906.3.3.0.0.0.0.290.290.2-1.1.0....0....1.64.dictionary-widget..2.1.289....0.GPPrtMip6cY",
            "async": "term:" + word + ",corpus:en,hwdgt:true,wfp:true,xpnd:true,ttl:,tsl:en,ftclps:false,_id:dictionary-modules,_pms:s,_fmt:pc"
        }
        try:
            dic_request = requests.get(
            url="https://www.google.com/async/dictw", params=param,timeout=5)
        except dic_request.exceptions.Timeout:
            return render(request,'no-def-100.html')
        except dic_request.exceptions.TooManyRedirects:
            return render(request,'no-def-100.html')
        except dic_request.exceptions.RequestException:
            return render(request,'no-def-100.html')

        with io.open(settings.BASE_DIR+"/templates/"+word+".html",'w', encoding="utf-8") as file:
            file.write("""
        <html>
            <head>
                <meta charset='utf-8'/>
                <style>/* Synonym word */
                    td.lr_dct_nyms_ttl{
                        color:#878787 !important;
                    }

                    .lr_dct_spkr_off{
                        display: unset !important;
                    }
                </style>
            </head>
            <body>
                %s
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
            <script type='text/javascript'>
                $(document).ready(function(){
                    var div = $("<div id='place'></div>")
                    $("body").append(div);
                    var except = $(".lr_dct_ent");
                    var place = $("#place");

                    // take it to "#place" and delete everything except "#place"
                    place.append(except);
                    $('.kp-blk').remove();

                    // delete child of "#place" that has class ".xpdxpnd";
                    // cosole.log($(".vk_ans").next().next());
                    var xpdxpnd = $(".lr_dct_ent").children();
                    xpdxpnd.each(function(e,s){
                    if(s.className != "vmod" && s.className != "dDoNo" && s.className != "vk_ans"){
                           console.log(s);
                           s.remove();    
                    }});
                    
                    // check if there is definition
                    if(!place.text()){
                        place.text("No definition");   
                    }
                        
                    // remove annoying text
                    $("body").contents()[0].remove();
                    $("body").contents()[1].remove();
                    var audioes = $("audio");
                    
                    // change value of audio src
                    for(var i=0;i<audioes.length;i++){
                        var audio = audioes[i];
                        var temAttr = audio.getAttribute('src');
                        temAttr = 'http:' + temAttr;
                        audio.setAttribute('src',temAttr);
                    }
                    
                    // audio click event
                    var span_audio = $("span.lr_dct_spkr");
                    span_audio.click(function(){
                        $(this).children().last()[0].play();
                    })

                    // remove phonetic symbols
                    $("span.lr_dct_ph").remove();

                    //create "synonym" word 
                    var synonym = $("td.lr_dct_nyms_ttl");
                    synonym.text("Synonym :");  


                    // table css synonym font size
                    $("table.vk_tbl").css("font-size","14px");

                    //list style
                    $("ol.lr_dct_sf_sens,ul").css("list-style-type","none");
                })
            </script>
            <body>
        </html>""" % dic_request.text)
            file.close()
            # print(os.stat(settings.BASE_DIR+"/templates/"+word+".html").st_size,"size")
            if(os.stat(settings.BASE_DIR+"/templates/"+word+".html").st_size > 10300):
                print("111111")
                return render(request,word +'.html')
            else:
                print("2222222")
                os.remove(settings.BASE_DIR+"/templates/"+word+".html")
                return render(request,'no-def-100.html')
                   
# if the word exist it will get from database
# if not it will create an entity only if the file size(word exist 
#  google server) is greater than 10KB
