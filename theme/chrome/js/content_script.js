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

//防止重复点击
function clickAble(bool = true){
    $("#johns").attr("clickable",bool)
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
    chrome.runtime.sendMessage({from:"content_js",action: "follow",data:info}, function(response) {});

    setTimeout(function (){
        buildButton(info.detail)
        clickAble(true)
    },1000)
}

getUrl();