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

async function wiktionary(keyword, language) {
	let url = "https://" + language + ".wiktionary.org/w/api.php?action=parse&format=json&contentmodel=wikitext&redirects=true&prop=text&page=" + keyword;
	let rawResult = await makeRequest("GET",url);
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

async function googleTranslate(keyword,language) {
	var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
	+ "auto" + "&tl=" + language + "&dt=t&q=" + encodeURI(keyword);
	let rawResult = await makeRequest("GET",url);
	let jsonResult = JSON.parse(rawResult);
	return jsonResult[0].map(
		function(element){
			return element[0];
		}
	).join("");
}

async function printResult(keyword,language) {
	// Replace underscores "_" with spaces " "
	keyword = decodeURI(keyword).replace(/_/g, " ");

	// Put the searching keyword to #inputframe
	document.getElementById("inputframe").value = keyword;

	// Get wiktionary result and put it to #result
	try{
		let wiktionaryResult = await wiktionary(keyword,language);
		document.getElementById("result").innerHTML = wiktionaryResult;

	}

	// If detect any error, try to get the meaning with Google Translate
	catch (error){
		document.getElementById("result").innerHTML = chrome.i18n.getMessage("popup_wiktionary_not_found")+` Error: ${error}`;
		let googleTranslateResult = await googleTranslate(keyword, language);
		document.getElementById("result").innerHTML = googleTranslateResult;
	}
}

/* When page is ready */
document.addEventListener("DOMContentLoaded",function () {
	// If the search form is submitted
	document.getElementById("searchform").addEventListener("submit",async function(event){
		let inputText = document.getElementById("inputframe").value;
		printResult(inputText,"vi");
		event.preventDefault();
	});

	// When the user clicked on any URL in the (wiktionary) result
	document.getElementById("result").addEventListener("click", function (event) {
		if(event.target.href === undefined) return;
		let qdInput = event.target.hash.substr(1).split("=")[1];
		if(qdInput === undefined) return;
		printResult(qdInput,"vi");
		event.preventDefault();
	});
});