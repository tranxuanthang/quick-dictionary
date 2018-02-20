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
	let url = 'https://' + language + '.wiktionary.org/w/api.php?action=parse&format=json&contentmodel=wikitext&redirects=true&prop=text&page=' + keyword;
	let rawResult = await makeRequest('GET',url);
	let jsonResult = JSON.parse(rawResult);
	let htmlResult = jsonResult.parse.text["*"];

	/* Fix URLs */
	var replace = "\"//" + lang + ".wiktionary.org";
	var re = new RegExp(replace, "g");
	htmlResult = htmlResult.replace(re, "\"https://" + lang + ".wiktionary.org");
	htmlResult = htmlResult.replace(/\"\/\/upload.wikimedia.org/g, "\"https://upload.wikimedia.org");
	htmlResult = htmlResult.replace(/\"\/\/commons.wikimedia.org/g, "\"https://commons.wikimedia.org");
	htmlResult = htmlResult.replace(/\"\/static\//g, "\"https://" + lang + ".wiktionary.org/static/");
	htmlResult = htmlResult.replace(/\"\/wiki\/(.*?)\"/g, "\"" + location.pathname + "?nolower=1&lang=" + lang + "&text=$1\"");
	htmlResult = htmlResult.replace(/\"\/wiki\//g, "\"https://" + lang + ".wiktionary.org/wiki/");
	htmlResult = htmlResult.replace(/\"\/w\//g, "\"https://" + lang + ".wiktionary.org/w/");
	return htmlResult;
}

async function printResult(keyword,language){
	document.getElementById('result').innerHTML = await wiktionary(keyword,language);
	return 0;
}