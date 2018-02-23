"use strict";

function getCurrentLanguage() {
	return sessionStorage.getItem("currentLanguage");
}

function submitHandle(savedData) {
	return async function (event) {
		if (event) event.preventDefault();
		let inputText = document.getElementById("inputframe").value;
		document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");
		document.getElementById("result").innerHTML = await smartGetResult(inputText, getCurrentLanguage() || savedData.primLang);
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

	// If the search form is submitted
	document.getElementById("searchform").addEventListener("submit", submitHandle(savedData));

	// When the user clicked on any URL in the (wiktionary) result
	document.getElementById("result").addEventListener("click", async function (event) {
		if (event.target.href === undefined) return;
		let qdInput = event.target.hash.substr(1).split("=")[1];
		if (qdInput === undefined) return;
		document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");
		document.getElementById("result").innerHTML = await smartGetResult(qdInput, getCurrentLanguage() || savedData.primLang);
		event.preventDefault();
	});

	// For sidebar, listen the click "quick button" event from content script
	browser.runtime.onMessage.addListener(async function (request) {
		if (request.type === "search_for_meaning") {
			let inputText = request.text;
			document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");
			document.getElementById("result").innerHTML = await smartGetResult(inputText, getCurrentLanguage() || savedData.primLang);
		}
	});

	// Check the URL after loaded, if there is a #input then get the meaning
	let inputAtLoad =  window.location.hash.substr(1).split("=")[1];
	if(inputAtLoad !== undefined) {
		document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_getting_result");
		document.getElementById("result").innerHTML = await smartGetResult(inputAtLoad, getCurrentLanguage() || savedData.primLang);
	}

	document.getElementById("totop").addEventListener("click", function (){
		document.getElementById("main").scrollTo(0, 0);
	});
});