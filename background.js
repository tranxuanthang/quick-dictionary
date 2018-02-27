browser.runtime.onMessage.addListener(checkMessage);

async function checkMessage(request,tabs) {
	console.log(request);
	if (request.type == "sidebar_status") {
		return new Promise(async function (resolve) {
			let gettingIsOpen = await browser.sidebarAction.isOpen({});
			//console.log(gettingIsOpen);
			resolve({ response: gettingIsOpen });
		});
	}

	if (request.type == "close_popup") {
		//console.log(await browser.tabs.getCurrent());
		//let currentTab = request.currentTab;
		browser.tabs.sendMessage(tabs[0].id,{ type: "content_close_popup" });
	}
}