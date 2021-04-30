let href

let host

let iqiyi_json

let relation_map = {
    "v.qq.com":vqq,
    "www.bilibili.com":bilibili,
    "www.iqiyi.com":iqiyi
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

function buildButton(detail){

    // chrome.runtime.sendMessage({from:"content_js",action:"check",data:detail}, function(response) {
    //     response.then(function (res){
    //         console.log(res)
    //     })
    // });

    chrome.storage.sync.get([detail], (items) => {
        // Pass any observed errors down the promise chain.
        // Pass the data retrieved from storage down the promise chain.
        let info = items[detail]
        let str = '一键追剧'

        $("#johns").parent().remove()

        if(info){
            str = '取消追剧'

            info.href = href

            chrome.storage.sync.set({[detail]:info})
        }

        $("body").append("<div style='z-index: 10000000;border: none;width: 100px;height: 50px;position: fixed;right: 1px;top: 100px'><button id='johns' style='cursor: pointer;\n" +
            "    position: relative;\n" +
            "    color: #fff;\n" +
            "    font-size: 14px;\n" +
            "    display: block;\n" +
            "    width: 70px;\n" +
            "    height: 40px;\n" +
            "    line-height: 36px;\n" +
            "    text-align: center;\n" +
            "    background: #fbc4c4;\n" +
            "    border-radius: 4px;border: none\n'>"+str+"</button></div>")
    });
}

//防止重复点击
function clickAble(bool = true){
    $("#johns").attr("clickable",bool)
}

function vqq(){
    let regex = /x\/cover\/[\w\/]+\.html/

    if(regex.test(href)){
        //添加元素标签 按钮
        // $(".video_base,._base").prepend("<button _stat='intro:tag' target='_blank' id='johns' class='tag_item'>一键追剧</button>")
        buildButton('https://'+host+$(".player_title").children('a').attr('href'))

        $(document).on('click','#johns',function (){
            clickAble(false)
            followQqVideo();
        })
    }
}

function bilibili(){
    let regex = /\/bangumi\/play\/\w+/

    if(regex.test(href)){
        //添加元素标签 按钮
        buildButton('https:'+$(".media-right>.media-title").attr('href'))

        $(document).on('click','#johns',function (){
            clickAble(false)
            followBiliVideo();
        })
    }
}

function iqiyi(){
    let regex = /www\.iqiyi\.com\/[\w_]+\.html/

    if(regex.test(href) && $(".content-paragraph").text()){
        //添加元素标签 按钮
        iqiyi_json =  (new Function("return " + $("div[is='i71-play-ab']").attr(':page-info')))()

        // console.log(iqiyi_json)

        if(iqiyi_json.albumUrl){
            detail = ('https:'+iqiyi_json.albumUrl).replace(/\/\/\/\//,'//')
        }else{
            detail = iqiyi_json.pageUrl
        }

        buildButton(detail)

        $(document).on('click','#johns',function (){
            clickAble(false)
            followIqiyi();
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
       info.lastNew =  $("ul.figure_list:first").children('.list_item').length
    }

    info.lastNew = info.lastNew.toString()

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

    info.lastNew = info.lastNew.toString()

    sendBackgroud(info)
}

function followIqiyi(){
//匹配通过，是iqiyi播放页面
    info.href = href.replace(/\?.*$/,'')

    info.title = iqiyi_json.albumName

    if(iqiyi_json.albumUrl){
        info.detail = ('https:'+iqiyi_json.albumUrl).replace(/\/\/\/\//,'//')
    }else{
        info.detail = iqiyi_json.pageUrl
    }

    info.desc = $(".content-paragraph").text();
    info.images = 'https:'+($('.intro-img').attr('src')?$('.intro-img').attr('src'):iqiyi_json.imageUrl)
    info.lastNew = $(".update-tip").text().match(/(?<=更新至)\d+(?=集\/)/)

    info.type = iqiyi_json.categoryName

    if(!info.lastNew){
        info.lastNew =  $('div.side-content>div:first').find("ul.qy-play-list").children("li.play-list-item").length
    }else{
        info.lastNew = info.lastNew[0]
    }

    info.lastNew = info.lastNew.toString()

    sendBackgroud(info)
}

function sendBackgroud(info){
    if(info.lastNew === '0'){
        info.lastNew = '1'
    }
    chrome.runtime.sendMessage({from:"content_js",action: "follow",data:info}, function(response) {});

    setTimeout(function (){
        buildButton(info.detail)
        clickAble(true)
    },1000)
}

getUrl();