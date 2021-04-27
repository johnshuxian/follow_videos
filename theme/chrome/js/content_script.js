let href

let host

let relation_map = {
    "v.qq.com":vqq
};

let info = {
    href:'',
    title:'',
    num:'',
    images:'',
    desc:"",
    detail:'',
    station:'',
    type:''
}

function getUrl (){
    href = location.href;

    host = location.host;

    let method = relation_map[host];

    if(method){
        info.station = host
        method(href);
    }
}

function vqq(){
    let regex = /x\/cover\/[\w\/]+\.html/

    if(regex.test(href)){
        //添加元素标签 按钮
        $(".video_base,._base").prepend("<button _stat='intro:tag' target='_blank' id='johns' class='tag_item'>一键追剧</button>")

        $(document).on('click','#johns',function (){
            followQqVideo();
        })
    }
}

function followQqVideo(){
    //匹配通过，是腾讯播放页面
    info.href = href
    info.title = $(".player_title").children('a').text()
    info.detail = 'https://'+host+$(".player_title").children('a').attr('href')
    info.num = $("span[class='item current']").find("a").text();
    info.desc = '';
    info.images = '';
    info.type = $(".site_channel").find(".current").attr('data-key')

    if(!info.num){
        info.desc   = $("li[class='list_item current']").find(".figure").attr("title")
        info.num    = $("li[class='list_item current']").find(".figure_count>.num").eq(0).text()
        info.images = 'https:'+$("li[class='list_item current']").find(".figure_pic").attr("src");
    }else{
        info.num = info.num.replace(/[\n\s]/g,"")
    }

    sendBackgroud(info)
}

function sendBackgroud(info){
    chrome.runtime.sendMessage({from:"content_js",data:info}, function(response) {});
}



window.addEventListener("message", function (event) {

    if (event.source !== window) return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        if(!port) port = chrome.runtime.connect({name:"websocket"});

        port.onMessage.addListener(function (data) {
        });
    }
}, false);

getUrl();