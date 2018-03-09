function saveOptions (event) {
	event.preventDefault();
	if (document.querySelector("#primlang").value != document.querySelector("#secolang").value && document.querySelector("#primlang").value != "") {
		chrome.storage.local.set({
			primLang: document.querySelector("#primlang").value,
			secoLang: document.querySelector("#secolang").value,
			quickButton: document.querySelector("input[name=\"quickButton\"]:checked").value,
			appearanceScale: document.querySelector("#appearanceScale").value,
			popupWidth: document.querySelector("#popupWidth").value,
			popupHeight: document.querySelector("#popupHeight").value
		});
		document.getElementById("error").textContent = "";
		document.getElementById("note").textContent = chrome.i18n.getMessage("config_success");
		setTimeout(function () { document.getElementById("note").textContent = ""; }, 1800);
	} else if (document.querySelector("#primlang").value != document.querySelector("#secolang").value) {
		document.getElementById("error").textContent = chrome.i18n.getMessage("config_error_1");
		document.getElementById("note").textContent = "";
		setTimeout(function () { document.getElementById("error").textContent = ""; }, 1800);
		restoreOptions();
	} else {
		document.getElementById("error").textContent = chrome.i18n.getMessage("config_error_2");
		document.getElementById("note").textContent = "";
		setTimeout(function () { document.getElementById("error").textContent = ""; }, 1800);
		restoreOptions();
	}
}

async function restoreOptions() {
	let savedData = await browser.storage.local.get({
		primLang: "en",
		secoLang: "",
		quickButton: true,
		appearanceScale: 62.5,
		popupWidth: 360,
		popupHeight: 240
	});

	document.querySelector("#primlang").value = savedData.primLang || "vi";
	document.querySelector("#secolang").value = savedData.secoLang || "";

	document.querySelector("#appearanceScale").value = savedData.appearanceScale || "62.5";

	document.querySelector("#popupWidth").value = savedData.popupWidth || "360";
	document.querySelector("#popupHeight").value = savedData.popupHeight || "240";

	if (savedData.quickButton == true) {
		document.getElementById("quickButtonYes").checked = savedData.quickButton;
	} else {
		document.getElementById("quickButtonNo").checked = savedData.quickButton;
	}
}

document.addEventListener("DOMContentLoaded", function () {
	restoreOptions();
	document.getElementById("form").addEventListener("submit", saveOptions);
	document.getElementById("goback").addEventListener("click", function (event) {
		event.preventDefault();
		window.close();
	});
});
