let href

let host

let relation_map = {
    "v.qq.com":vqq
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

function sendBackgroud(info){
    chrome.runtime.sendMessage({from:"content_js",data:info}, function(response) {});
}

getUrl();