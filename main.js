"use strict";

async function wiktionary(keyword, language, lower = false) {
	
	if (lower == true) keyword = keyword.toLowerCase();
	
	let url = "https://" + language + ".wiktionary.org/w/api.php?action=parse&format=json&contentmodel=wikitext&redirects=true&prop=text&page=" + keyword;
	let rawResult = await fetch(url);
	let jsonResult = await rawResult.json();
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
	let rawResult = await fetch(url);
	let jsonResult = await rawResult.json();
	return jsonResult[0].map(
		function (element) {
			return element[0];
		}
	).join("").replace(/(?:\r\n|\r|\n)/g, "<br />");
}

async function smartGetResult(keyword, language, lower = false) {
	// Get wiktionary result and put it to #result
	try {
		let wiktionaryResult = await wiktionary(keyword, language, lower);
		return { type: "wiktionary", result: wiktionaryResult };
	}

	// If detect any error, try to get the meaning with Google Translate
	catch (error) {
		try {
			let googleTranslateResult = await googleTranslate(keyword, language);
			return { type: "gtranslate", result: `<div id="googletranslate">${googleTranslateResult}</div>` };
		}
		catch(error) {
			throw new Error(error);
		}
	}
}

async function getSavedData() {
	return await browser.storage.local.get({
		primLang: "en",
		secoLang: "",
		appearanceScale: 62.5
	});
}

function getCurrentLanguage() {
	return sessionStorage.getItem("currentLanguage");
}

async function getWiktionarySuggestions(keyword, language) {
	let url = `https://${language}.wiktionary.org/w/api.php?action=opensearch&search=${keyword}&limit=10&namespace=0&format=json`;
	let rawResult = await fetch(url);
	let jsonResult = await rawResult.json();
	return jsonResult[1];
}

async function applyResult(keyword, language, lower = false, jumpTo = null) {
	// Replace underscores "_" with spaces " "
	keyword = decodeURI(keyword).replace(/_/g, " ").trim();

	// Put the searching keyword to #inputframe
	document.getElementById("inputframe").value = keyword;

	// Put the result to #result element
	document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");

	try {
		if (keyword.length < 1) throw new Error("qd_error_text_too_short");
		if (keyword.length > 1500) throw new Error("qd_error_text_too_long");
		let response = await smartGetResult(keyword, language, lower);
		
		// Reupdate the input frame to lower case, if lower = true and the result is wiktionary
		if (response.type == "wiktionary") {
			if (lower == true) {
				document.getElementById("inputframe").value = keyword.toLowerCase();
			}
		}

		// Just print the result
		document.getElementById("result").innerHTML = response.result;

		// If there is hash like #English or #Japanese,...
		if(jumpTo != null) {
			window.location.hash = `#${jumpTo}`;
		}

		// Add event listener for all links in the printed result
		var links = document.getElementsByTagName("a");
		for (let i = 0; i < links.length; i++) {
			let item = links[i];

			// Open all external links in new tab
			item.getAttribute("href") && item.hostname !== location.hostname && (item.target = "_blank");

			// Search for result after clicked a link, without reloading the page
			links[i].addEventListener("click", async function (event) {
				let hash = item.hash.substr(1).split("#");
				let firsthash = hash[0].split("=");
				if (firsthash[0] == "input") {
					// Check if there is another hash
					let jump = null;
					if(hash[1] != undefined) {
						jump = hash[1];
					}

					// Now find the input from URL
					let qdInput = firsthash[1];
					if (qdInput === undefined) {
						return;
					}
					qdInput = decodeURI(qdInput);

					// Apply
					event.preventDefault();
					applyResult(qdInput, getCurrentLanguage(), false, jump);
				} else if (item.hostname === location.hostname) {
					// If the first hash is not #input=
					event.preventDefault();
					let jumpId = firsthash[0];
					if (jumpId !== undefined) {
						window.location.hash = `#${jumpId}`;
					}
				}
			});
		}
	}

	catch (error) {
		if (error.message == "qd_error_text_too_short") {
			document.getElementById("result").textContent = `${browser.i18n.getMessage("popup_error_text_too_short")} (${error})`;
		} else if (error.message == "qd_error_text_too_long") {
			document.getElementById("result").textContent = `${browser.i18n.getMessage("popup_error_text_too_long")} (${error})`;
		} else if (error.message == "qd_error_unvailable") {
			document.getElementById("result").textContent = `${browser.i18n.getMessage("popup_error_unavailable")} (${error})`;
		} else {
			document.getElementById("result").textContent = `${browser.i18n.getMessage("popup_error_unknown")} (${error})`;
		}
	}
}

async function submitHandle(event) {
	if (event) event.preventDefault();
	let inputText = document.getElementById("inputframe").value;
	applyResult(inputText, getCurrentLanguage(), false);
}

async function applySavedData() {
	// Get saved preferences
	let savedData = await getSavedData();

	// Apply appearance scale customization
	document.documentElement.style.fontSize = savedData.appearanceScale+"%";

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

async function init() {
	// Saved config/data must be loaded before we can do anything
	await applySavedData();

	// Listen for submit button click event
	document.getElementById("searchform").addEventListener("submit", submitHandle);

	// Update word suggestions
	document.getElementById("inputframe").addEventListener("keyup", async function (event) {
		if (!document.getElementById("suggestions")) {
			let sugDataList = document.createElement("datalist");
			sugDataList.setAttribute("id", "suggestions");
			document.getElementById("sugwarp").appendChild(sugDataList);
		}
		var code = (event.keyCode);

		// Submit when the user press enter in input form
		if (event.keyCode == 13) {
			//event.preventDefault();
			//submitHandle();
			document.getElementById("sugwarp").removeChild(document.getElementById("suggestions"));
		} else if (code < 48 || code > 90) {
			// Is not A-Z and 0-9 keys
			document.getElementById("sugwarp").removeChild(document.getElementById("suggestions"));
		} else {
			// Clear old suggestions
			let suggestionsElement = document.getElementById("suggestions");
			suggestionsElement.textContent = "";

			try {
				// Get the suggestions from wiktionary API
				let suggestionsResult = await getWiktionarySuggestions(document.getElementById("inputframe").value, getCurrentLanguage());

				// Apply
				suggestionsResult.map(function (item) {
					let suggest = document.createElement("option");
					suggest.setAttribute("value", item);
					suggestionsElement.appendChild(suggest);
				});
			}
			catch (error) {
				document.getElementById("sugwarp").removeChild(document.getElementById("suggestions"));
			}
		}
	});

	// For sidebar, listen the click "quick button" event from content script
	browser.runtime.onMessage.addListener(function (request) {
		return new Promise(async function (resolve) {
			let currentWindow = await browser.windows.getCurrent();
			if (request.type === "search_for_meaning" && currentWindow.focused == true) {
				let inputText = request.text;
				applyResult(inputText, getCurrentLanguage(), true);
				resolve(true);
			}
		});
	});

	// Check the URL after loaded, if there is a #input then get the meaning
	let urlHash = window.location.hash.substr(1).split("#");
	let inputAtLoad = urlHash[0].split("=")[1];
	if (inputAtLoad) {
		inputAtLoad = decodeURI(inputAtLoad);
		applyResult(inputAtLoad, getCurrentLanguage(), true);

	}

	// Handle "go to top" button, at bottom right of page
	document.getElementById("totop").addEventListener("click", function () {
		document.getElementById("main").scrollTo(0, 0);
	});
}

/* When page is ready */
document.addEventListener("DOMContentLoaded", function () {
	init();
});
