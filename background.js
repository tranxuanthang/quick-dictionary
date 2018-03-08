browser.browserAction.onClicked.addListener(function() {
	browser.sidebarAction.open();
});

browser.menus.create({
	id: "context_find_meaning",
	title: chrome.i18n.getMessage("translate")+" %s",
	contexts: ["selection"]
});

browser.menus.onClicked.addListener(function (info, tab) {
	if (info.menuItemId == "context_find_meaning") {
		console.log(info.selectionText);
		browser.tabs.sendMessage(
			tab.id,
			{type: "show_meaning", text: info.selectionText}
		);
	}
});

browser.runtime.onInstalled.addListener(function () {
	browser.tabs.create({
		url: "https://tranxuanthang.github.io/quick-dictionary/index.html"
	});
});

browser.commands.onCommand.addListener(async function (cmd) {
	let tab = await browser.tabs.query({currentWindow: true, active: true});
	console.log(tab[0]);
	if (cmd == "show_meaning") {
		browser.tabs.sendMessage(
			tab[0].id,
			{ type: "show_meaning" }
		);
	}
});