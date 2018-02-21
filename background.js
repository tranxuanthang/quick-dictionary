browser.runtime.onMessage.addListener(checkMessage);

function checkMessage(request) {
	if (request.type == "sidebar_status") {
		return new Promise(async function (resolve) {
			let gettingIsOpen = await browser.sidebarAction.isOpen({});
			resolve({ response: gettingIsOpen });
		});
	}
}