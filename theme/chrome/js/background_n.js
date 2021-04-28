let relation_map = {
	"v.qq.com":vqq
};

let update_relation_map = {
	"v.qq.com":vqqUpdate
};

let notification_url = {}

/**
 * 腾讯视频 订阅资料补全
 * @param info
 * @returns {Promise<*>}
 */
async function vqq(info){
	let html = await getHtml(info.detail)

	let dom = new DOMParser().parseFromString(html,'text/html')

	info.images = dom.querySelector("img[class='figure_pic']").src.replace(/^chrome-extension/,'https')

	info.desc = dom.querySelector("span[class='txt _desc_txt_lineHight']").textContent

	return info;
}

/**
 * 新增订阅
 * @param info
 */
function listStorage(info)
{
	chrome.storage.sync.get(['video_list_keys'], function(res) {

		let list = res.video_list_keys

		if(list){
			if(!list.some((v)=>v=== info.detail)){
				list.push(info.detail)
				chrome.storage.sync.set({video_list_keys:list},function (){
					alertNotify(info.desc,info.title+' 追剧成功',info.images,true)
				});
			}
		}else{
			chrome.storage.sync.set({video_list_keys:[info.detail]},function (){
				alertNotify(info.desc,info.title+' 追剧成功',info.images,true)
			});
		}
	});

	let detail = info.detail

	chrome.storage.sync.set({[detail]:info})
}

/**
 * 缓存变更监听
 */
chrome.storage.onChanged.addListener(function (changes, namespace) {
	for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
		if(namespace === 'sync'){
			chrome.storage.sync.get([key],function (res){
				console.log(res)
			})
		}
		// console.log(
		// 	`Storage key "${key}" in namespace "${namespace}" changed.`,
		// 	`Old value was "${oldValue}", new value is "${newValue}".`
		// );
	}
});

/**
 * 获取指定url地址的HTML页面
 * @param url
 * @returns {Promise<string>}
 */
function getHtml(url){
	return fetch(url,{
		headers: {
			'content-type': 'text/html'
		},
	}).then(function(response){
		return response.text()
	}).then(function (string){
		return string
	})
}

/**
 * 通信
 */
chrome.runtime.onMessage.addListener(
	async function(request, sender, sendResponse) {
		if(request.from === 'content_js'){
			let info = request.data;

			info = await relation_map[info.station](info)

			listStorage(info)
		}
	}
);

/**
 * 腾讯视频 资源检查更新
 * @param info
 * @returns {Promise<void>}
 */
async function vqqUpdate(info){
	let html = await getHtml(info.href)

	let dom = new DOMParser().parseFromString(html,'text/html')

	let lastNew = $(dom).find(".episode_header").find('.item:last').text()

	if(!lastNew){
		lastNew =  $(dom).find(".mod_column ul[class='figure_list']").children('.list_item').length
	}

	if(lastNew && lastNew!==info.lastNew){
		//有更新
		info.lastNew = lastNew

		chrome.storage.sync.set({[info.detail]:info})

		let id = alertNotify(info.desc,info.title+' 第'+lastNew+'(集/期)已更新',info.images,true,[{title:'立刻查看'},{title:'取消'}],10000)

		notification_url[id] = info.href;
	}
}


/**
 * 通知弹出
 * @param messages
 * @param titles
 * @param image
 * @param consistent
 * @param buttons
 * @param clear_time
 */
function alertNotify(messages,titles,image,consistent,buttons = [],clear_time=5000) {
	let id = Date.parse(new Date()).toString();

	let opt = {
		type: "basic",
		title: titles,
		message: messages,
		// iconUrl: "img/logo.png",
		iconUrl: image,
		requireInteraction:consistent,
		priority: 1,
		isClickable: false
	}

	if(buttons.length){
		opt.buttons = buttons
	}

	chrome.notifications.create(id,opt,function () {});

	setTimeout(function(){
		chrome.notifications.clear(id);
		delete notification_url[id]
	}, clear_time);

	return id
}

 chrome.contextMenus.create({
     title: "查看追剧列表",
     onclick: function (){
		 chrome.tabs.create({url:'config.html'});
	 },
 });

/**
 * 跳跃到播放页
 */
chrome.notifications.onButtonClicked.addListener((id,index)=>{
	if(notification_url[id] && index=== 0){
		chrome.tabs.create({url:notification_url[id]})
	}
});

chrome.runtime.onInstalled.addListener(function (info) {
    // chrome.tabs.create({url:'config.html'});
})

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === 'checkVideoUpdate') {
		chrome.storage.sync.get(['video_list_keys'], function(res) {

			let list = res.video_list_keys

			if(list){
				for (let i = 0;i<list.length;i++){
					chrome.storage.sync.get([list[i]],async function (info){
						info = info[list[i]]
						if(info){
							try{
								await update_relation_map[info.station](info)
							}catch (e) {
								console.log(e)
							}
						}
					})
				}
			}
		});
	}
});

//创建定时任务，每分钟执行一次
chrome.alarms.create('checkVideoUpdate',{when:Date.now(),periodInMinutes:1})

