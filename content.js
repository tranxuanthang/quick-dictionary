"use strict";

function getMouseCoords(event) {
	var eventDoc, doc, body;

	event = event || window.event; // IE-ism

	// If pageX/Y aren't available and clientX/Y are,
	// calculate pageX/Y - logic taken from jQuery.
	// (This is to support old IE)
	if (event.pageX == null && event.clientX != null) {
		eventDoc = (event.target && event.target.ownerDocument) || document;
		doc = eventDoc.documentElement;
		body = eventDoc.body;

		event.pageX = event.clientX +
			(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
			(doc && doc.clientLeft || body && body.clientLeft || 0);
		event.pageY = event.clientY +
			(doc && doc.scrollTop || body && body.scrollTop || 0) -
			(doc && doc.clientTop || body && body.clientTop || 0);
	}
	return { x: event.pageX, y: event.pageY };
	// Use event.pageX / event.pageY here
}

function showQuickButton(x, y) {
	let txtSel = getSelection().toString();

	let quickButton = document.getElementById("qdExt_quickButton");
	if (!txtSel || txtSel == "") {
		if (quickButton) {
			quickButton.setAttribute("style", "display: none;");
		}
	} else {
		quickButton.setAttribute("style", `top: ${y - 48}px; left: ${x - 8}px;`);
		quickButton.setAttribute("data-selected-text", txtSel);
		quickButton.setAttribute("data-coord-x", x);
		quickButton.setAttribute("data-coord-y", y);
	}
}

(function init() {
	// Create "cover" element (a full-page size element to detect clicks outside "quick popup")
	let cover = document.createElement("div");
	cover.setAttribute("id", "qdExt_cover");
	cover.setAttribute("style", "display: none;");
	document.getElementsByTagName("body")[0].appendChild(cover);

	// Create "quick button" element on load
	let quickButton = document.createElement("div");
	quickButton.setAttribute("id", "qdExt_quickButton");
	quickButton.setAttribute("style", "display: none;");
	document.getElementsByTagName("body")[0].appendChild(quickButton);

	// Listen click event for "quick button"
	quickButton.addEventListener("click", async function () {
		// Get selected text
		let selectedText = quickButton.getAttribute("data-selected-text").trim();

		// Send message to the sidebar (assuming sidebar is available)
		chrome.runtime.sendMessage({ type: "search_for_meaning", text: selectedText });

		// Check sidebar status
		let getSidebarStatus = await browser.runtime.sendMessage({ type: "sidebar_status" });
		if (getSidebarStatus === undefined) getSidebarStatus = {response: true};
		console.log(getSidebarStatus);

		// If sidebar is not available
		if (getSidebarStatus.response == false) {
			// Show the cover
			cover.setAttribute("style", "display: block;");

			// Take mouse coordinate (saved from "quick button" element attribute)
			let x = Number(quickButton.getAttribute("data-coord-x"));
			let y = Number(quickButton.getAttribute("data-coord-y"));

			// Create the "quick popup"
			let quickPopup = document.createElement("iframe");
			quickPopup.setAttribute("id", "qdExt_quickPopup");
			quickPopup.setAttribute("sandbox", "allow-same-origin allow-scripts");
			quickPopup.src = browser.extension.getURL(`/quickpopup.html#input=${selectedText}`);
			quickPopup.setAttribute("style", `top: ${y + 16}px; left: ${x}px;`);
			document.getElementsByTagName("body")[0].appendChild(quickPopup);
		}
	});

	// Listen click event to "cover" element
	cover.addEventListener("click", function () {
		// Remove the "quick popup"
		document.getElementsByTagName("body")[0].removeChild(document.getElementById("qdExt_quickPopup"));

		// Hide the "cover"
		cover.setAttribute("style", "display: none;");
	});

	// Handle Quick Button
	document.addEventListener("mouseup", async function (event) {
		let savedData = await browser.storage.local.get({
			quickButton: true
		});
		if (savedData.quickButton == false) {
			let quickButton = document.getElementById("qdExt_quickButton");
			if (quickButton) {
				quickButton.setAttribute("style", "display: none;");
			}
			return;
		}
		
		let coords = getMouseCoords(event);
		setTimeout(function () {
			showQuickButton(coords.x, coords.y);
		}, 50);
	});
})();