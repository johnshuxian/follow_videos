let relation_map = {
	"v.qq.com":vqq
};

async function vqq(info){
	let html = await getHtml(info.detail)

	let dom = new DOMParser().parseFromString(html,'text/html')

	info.images = dom.querySelector("img[class='figure_pic']").src.replace(/^chrome-extension/,'https')

	info.desc = dom.querySelector("span[class='txt _desc_txt_lineHight']").textContent

	return info;
}

function listStorage(info)
{
	chrome.storage.sync.get(['video_list_keys'], function(res) {

		let list = res.video_list_keys

		if(list){
			if(!list.some((v)=>v=== info.detail)){
				list.push(info.detail)
				chrome.storage.sync.set({video_list_keys:list});
			}
		}else{
			chrome.storage.sync.set({video_list_keys:[info.detail]});
		}
	});

	let detail = info.detail

	chrome.storage.sync.set({[detail]:info})

	chrome.storage.sync.get(['video_list_keys'],function (res){
		console.log(res)
	})
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
	for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
		if(namespace === 'sync'){
			chrome.storage.sync.get([key],function (res){
				console.log(res)
			})
		}
		console.log(
			`Storage key "${key}" in namespace "${namespace}" changed.`,
			`Old value was "${oldValue}", new value is "${newValue}".`
		);
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

chrome.runtime.onMessage.addListener(
	async function(request, sender, sendResponse) {
		if(request.from === 'content_js'){
			let info = request.data;

			info = await relation_map[info.station](info)

			alertNotify(info.desc,info.title,info.images,true)

			listStorage(info)
		}
	}
);


function alertNotify(messages,titles,image,consistent) {
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

	chrome.notifications.create(id,opt,function () {});

	setTimeout(function(){
		chrome.notifications.clear(id);
	}, 5000);
}

 chrome.contextMenus.create({
     title: "Call : %s with "+chrome.runtime.getManifest().name,
     contexts: ["selection"],
     onclick: '',
 });

chrome.runtime.onInstalled.addListener(function (info) {
    // chrome.tabs.create({url:'config.html'});
})

