"use strict";

async function getCurrentLanguage() {
	let currentLanguage = sessionStorage.getItem("currentLanguage");
	if (currentLanguage !== undefined) {
		return currentLanguage;
	} else {
		let savedData = await browser.storage.local.get({
			primLang: "vi",
			secoLang: "en"
		});
		return savedData.primLang;
	}
}

async function getWiktionarySuggestions(keyword,language) {
	let url = `https://${language}.wiktionary.org/w/api.php?action=opensearch&search=${keyword}&limit=10&namespace=0&format=json`;
	let rawResult = await makeRequest("GET", url);
	let jsonResult = JSON.parse(rawResult);
	return jsonResult[1];
}

async function applyResult(keyword, language) {
	document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");
	document.getElementById("result").innerHTML = await smartGetResult(keyword, language);

	var links = document.getElementsByTagName("a");
	for (let i = 0; i < links.length; i++) {
		let item = links[i];
		item.getAttribute("href") && item.hostname !== location.hostname && (item.target = "_blank");
		
		links[i].addEventListener("click", async function (event) {
			let hash = item.hash.substr(1).split("=");
			if (hash[0] == "input") {
				let qdInput = hash[1];
				if (qdInput === undefined) return;
				event.preventDefault();
				applyResult(qdInput, await getCurrentLanguage());
			} else if (item.hostname === location.hostname) {
				event.preventDefault();
				let jumpId = hash[0];
				if (jumpId !== undefined)
				window.location.hash = `#${jumpId}`;
			}
		});
	}
}

function submitHandle(savedData) {
	return async function (event) {
		if (event) event.preventDefault();
		let inputText = document.getElementById("inputframe").value.toLowerCase();
		applyResult(inputText, await getCurrentLanguage());
	};
}

/* When page is ready */
document.addEventListener("DOMContentLoaded", async function () {
	// Get saved preferences
	let savedData = await browser.storage.local.get({
		primLang: "vi",
		secoLang: "en"
	});

	// Get the elements of 'primary language' and 'secondary language' switch buttons
	let primLangButton = document.getElementById("primlang");
	let secoLangButton = document.getElementById("secolang");

	// Update saved value to switch buttons (primary button, secondary button)
	primLangButton.textContent = savedData.primLang;
	if (savedData.secolang == "") {
		secoLangButton.textContent = "n/a";
		secoLangButton.setAttribute("disabled", "disabled");
	} else {
		secoLangButton.textContent = savedData.secoLang;
	}

	// Set "current language" in sessionStorage to primary language after load
	sessionStorage.setItem("currentLanguage", savedData.primLang);

	// Detect click event to "primary language" button
	primLangButton.addEventListener("click", function () {
		sessionStorage.setItem("currentLanguage", savedData.primLang);
		primLangButton.classList.add("primary");
		secoLangButton.classList.remove("primary");
		let inputText = document.getElementById("inputframe").value;
		if (inputText != "") submitHandle(savedData)();
	});

	// Detect click event for "secondary language" button
	secoLangButton.addEventListener("click", function () {
		sessionStorage.setItem("currentLanguage", savedData.secoLang);
		primLangButton.classList.remove("primary");
		secoLangButton.classList.add("primary");
		let inputText = document.getElementById("inputframe").value;
		if (inputText != "") submitHandle(savedData)();
	});

	// Update word suggestions
	document.getElementById("inputframe").addEventListener("keyup", async function (event) {
		// A-Z and 0-9 keys only
		var code = (event.keyCode);
		if(code <48 || code > 90) return;

		// Clear old suggestions
		let suggestionsElement = document.getElementById("suggestions");
		suggestionsElement.textContent = "";

		// Get the suggestions from wiktionary API
		let suggestionsResult = await getWiktionarySuggestions(document.getElementById("inputframe").value, await getCurrentLanguage());
		
		// Apply
		suggestionsResult.map(function (item) {
			let suggest = document.createElement("option");
			suggest.setAttribute("value", item);
			suggestionsElement.appendChild(suggest);
		});
	});

	// If the search form is submitted
	document.getElementById("searchform").addEventListener("submit", submitHandle(savedData));

	// When the user clicked on any URL in the (wiktionary) result
	/*document.getElementById("result").addEventListener("click", async function (event) {
		if (event.target.href === undefined) return;
		console.log(event.target,location.hostname);
		let hash = event.target.hash.substr(1).split("=");
		if (hash[0] == "input") {
			let qdInput = hash[1];
			if (qdInput === undefined) return;
			event.preventDefault();
			document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");
			document.getElementById("result").innerHTML = await smartGetResult(qdInput, getCurrentLanguage() || savedData.primLang);
		} else if (event.target.hostname === location.hostname) {
			let jumpId = hash[0];
			if (jumpId !== undefined)
			window.location.hash = `#${jumpId}`;
		}
	});*/

	//
	

	// For sidebar, listen the click "quick button" event from content script
	browser.runtime.onMessage.addListener(async function (request) {
		if (request.type === "search_for_meaning") {
			let inputText = request.text;
			applyResult(inputText.toLowerCase(), await getCurrentLanguage());
		}
	});

	// Check the URL after loaded, if there is a #input then get the meaning
	let inputAtLoad =  window.location.hash.substr(1).split("=")[1];
	if(inputAtLoad !== undefined) {
		applyResult(inputAtLoad.toLowerCase(), await getCurrentLanguage());
	}

	document.getElementById("totop").addEventListener("click", function (){
		document.getElementById("main").scrollTo(0, 0);
	});
});