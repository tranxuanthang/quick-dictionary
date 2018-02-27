"use strict";

function makeRequest(method, url) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send();
	});
}

async function wiktionary(keyword, language, lower = false) {
	
	if (lower == true) keyword = keyword.toLowerCase();
	
	let url = "https://" + language + ".wiktionary.org/w/api.php?action=parse&format=json&contentmodel=wikitext&redirects=true&prop=text&page=" + keyword;
	
	let rawResult = await makeRequest("GET", url);
	let jsonResult = JSON.parse(rawResult);

	let error = jsonResult.error;
	
	if (error !== undefined) throw new Error("wiktionary_not_found");

	let htmlResult = jsonResult.parse.text["*"];

	/* Fix URLs */
	var replace = "\"//" + language + ".wiktionary.org";
	var re = new RegExp(replace, "g");
	htmlResult = htmlResult.replace(re, "\"https://" + language + ".wiktionary.org");
	htmlResult = htmlResult.replace(/"\/\/upload.wikimedia.org/g, "\"https://upload.wikimedia.org");
	htmlResult = htmlResult.replace(/"\/\/commons.wikimedia.org/g, "\"https://commons.wikimedia.org");
	htmlResult = htmlResult.replace(/"\/static\//g, "\"https://" + language + ".wiktionary.org/static/");
	htmlResult = htmlResult.replace(/"\/wiki\/(.*?)"/g, "\"" + location.pathname + "#input=$1\"");
	htmlResult = htmlResult.replace(/"\/wiki\//g, "\"https://" + language + ".wiktionary.org/wiki/");
	htmlResult = htmlResult.replace(/"\/w\//g, "\"https://" + language + ".wiktionary.org/w/");
	return htmlResult;
}

async function googleTranslate(keyword, language) {
	var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
		+ "auto" + "&tl=" + language + "&dt=t&q=" + encodeURI(keyword);
	let rawResult = await makeRequest("GET", url);
	let jsonResult = JSON.parse(rawResult);
	return jsonResult[0].map(
		function (element) {
			return element[0];
		}
	).join("").replace(/(?:\r\n|\r|\n)/g, "<br />");
}

async function smartGetResult(keyword, language, lower = false) {
	// Replace underscores "_" with spaces " "
	keyword = decodeURI(keyword).replace(/_/g, " ");

	// Get wiktionary result and put it to #result
	try {
		let wiktionaryResult = await wiktionary(keyword, language, lower);
		return { type: "wiktionary", result: wiktionaryResult };
	}

	// If detect any error, try to get the meaning with Google Translate
	catch (error) {
		//return chrome.i18n.getMessage("popup_wiktionary_not_found") + ` Error: ${error}`;
		let googleTranslateResult = await googleTranslate(keyword, language);
		return { type: "gtranslate", result: `<div id="googletranslate">${googleTranslateResult}</div>` };
	}
}

async function getCurrentLanguage() {
	let currentLanguage = sessionStorage.getItem("currentLanguage");
	//console.log(currentLanguage);
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

async function getWiktionarySuggestions(keyword, language) {
	let url = `https://${language}.wiktionary.org/w/api.php?action=opensearch&search=${keyword}&limit=10&namespace=0&format=json`;
	let rawResult = await makeRequest("GET", url);
	let jsonResult = JSON.parse(rawResult);
	return jsonResult[1];
}

async function applyResult(keyword, language, lower = false) {
	
	// Put the searching keyword to #inputframe
	document.getElementById("inputframe").value = keyword;

	// Put the result to #result element
	document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");
	let response = await smartGetResult(keyword, language, lower);
	//console.log(response.type);
	if (response.type == "wiktionary") {
		// Reupdate, if lower = true and the result is wiktionary
		if (lower == true) {
			document.getElementById("inputframe").value = keyword.toLowerCase();
		}
	}
	document.getElementById("result").innerHTML = response.result;

	var links = document.getElementsByTagName("a");
	for (let i = 0; i < links.length; i++) {
		let item = links[i];
		item.getAttribute("href") && item.hostname !== location.hostname && (item.target = "_blank");

		links[i].addEventListener("click", async function (event) {
			let hash = item.hash.substr(1).split("=");
			if (hash[0] == "input") {
				let qdInput = hash[1];
				if (qdInput === undefined) return;
				qdInput = decodeURI(qdInput);
				event.preventDefault();
				applyResult(qdInput, await getCurrentLanguage(), false);
			} else if (item.hostname === location.hostname) {
				event.preventDefault();
				let jumpId = hash[0];
				if (jumpId !== undefined)
					window.location.hash = `#${jumpId}`;
			}
		});
	}
}

async function submitHandle(event) {
	if (event) event.preventDefault();
	let inputText = document.getElementById("inputframe").value;
	applyResult(inputText, await getCurrentLanguage(), false);
}

async function applySavedData() {
	// Get saved preferences
	let savedData = await browser.storage.local.get({
		primLang: "en",
		secoLang: ""
	});

	// Get the elements of 'primary language' and 'secondary language' switch buttons
	let primLangButton = document.getElementById("primlang");
	let secoLangButton = document.getElementById("secolang");

	// Update saved value to switch buttons (primary button, secondary button)
	primLangButton.textContent = savedData.primLang;
	if (savedData.secoLang == "") {
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
		if (inputText != "") submitHandle();
	});

	// Detect click event for "secondary language" button
	secoLangButton.addEventListener("click", function () {
		sessionStorage.setItem("currentLanguage", savedData.secoLang);
		primLangButton.classList.remove("primary");
		secoLangButton.classList.add("primary");
		let inputText = document.getElementById("inputframe").value;
		if (inputText != "") submitHandle();
	});
}
/* When page is ready */
document.addEventListener("DOMContentLoaded", async function () {
	// Saved config/data must be loaded before we can do anything
	await applySavedData();
	//
	document.getElementById("searchform").addEventListener("submit", submitHandle);

	// Update word suggestions
	document.getElementById("inputframe").addEventListener("keyup", async function (event) {
		
		var code = (event.keyCode);

		// Submit when the user press enter in input form
		if (event.keyCode == 13) {
			event.preventDefault();
			submitHandle();
			return;
		} else if (code < 48 || code > 90) {
			// A-Z and 0-9 keys only
			return;
		}

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

	// For sidebar, listen the click "quick button" event from content script
	browser.runtime.onMessage.addListener(async function (request) {
		if (request.type === "search_for_meaning") {
			let inputText = request.text;
			applyResult(inputText, await getCurrentLanguage(), true);
		}
	});

	// Check the URL after loaded, if there is a #input then get the meaning
	let inputAtLoad = window.location.hash.substr(1).split("=")[1];
	if (inputAtLoad !== undefined) {
		inputAtLoad = decodeURI(inputAtLoad);
		applyResult(inputAtLoad, await getCurrentLanguage(), true);
	}

	document.getElementById("totop").addEventListener("click", function () {
		document.getElementById("main").scrollTo(0, 0);
	});
});