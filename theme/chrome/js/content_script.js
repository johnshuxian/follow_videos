let href

let host

let relation_map = {
    "v.qq.com":vqq,
    "www.bilibili.com":bilibili
};

let info = {
    href:'',
    title:'',
    lastNew:'',
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

function buildButton(){
    $("body").append("<div style='z-index: 10000000;border: none;width: 100px;height: 50px;position: fixed;left: 1px;top: 100px'><button id='johns' style='cursor: pointer;\n" +
        "    position: relative;\n" +
        "    color: #fff;\n" +
        "    font-size: 14px;\n" +
        "    display: block;\n" +
        "    width: 50px;\n" +
        "    height: 40px;\n" +
        "    line-height: 36px;\n" +
        "    text-align: center;\n" +
        "    background: #fbc4c4;\n" +
        "    border-radius: 4px;border: none\n'>追剧</button></div>")
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

function bilibili(){
    let regex = /\/bangumi\/play\/\w+/

    if(regex.test(href)){
        //添加元素标签 按钮
        buildButton()

        $(document).on('click','#johns',function (){
            followBiliVideo();
        })
    }
}

function followQqVideo(){
    //匹配通过，是腾讯播放页面
    info.href = href
    info.title = $(".player_title").children('a').text()
    info.detail = 'https://'+host+$(".player_title").children('a').attr('href')
    info.desc = '';
    info.images = '';
    info.lastNew = $(".episode_header").find('.item:last').text()

    info.type = $(".site_channel").find(".current").attr('data-key')

    if(!info.lastNew){
       info.lastNew =  $(".mod_column ul[class='figure_list']").children('.list_item').length
    }

    console.log(info)
    sendBackgroud(info)
}

function followBiliVideo(){
    //匹配通过，是bilibili播放页面
    info.href = href
    info.title = $(".media-right>.media-title").attr('title')
    info.detail = 'https:'+$(".media-right>.media-title").attr('href')
    info.desc = $("span.absolute").text()
    info.images = 'https:'+$("#media_module").find('img').attr("src")
    info.lastNew = $('.ep-list-progress').text()

    info.type = $(".pub-wrapper").find('a:first').text()

    if(info.lastNew){
       info.lastNew =  info.lastNew.split('/')[1]
    }else{
        info.lastNew = 0;
    }

    sendBackgroud(info)
}

function sendBackgroud(info){
    chrome.runtime.sendMessage({from:"content_js",data:info}, function(response) {});
}

getUrl();