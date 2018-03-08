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

function showQuickButton(x, y, display = true) {
	let txtSel = getSelection().toString();

	let quickButton = document.getElementById("qdExt_quickButton");
	if (!txtSel || txtSel == "") {
		if (quickButton) {
			quickButton.setAttribute("style", "display: none;");
		}
	} else {
		if (display == true) {
			quickButton.setAttribute("style", `top: ${y - 48}px; left: ${x - 8}px;`);
		} else {
			quickButton.setAttribute("style", `top: ${y - 48}px; left: ${x - 8}px; display: none;`);
		}
		
		quickButton.setAttribute("data-selected-text", txtSel);
		quickButton.setAttribute("data-coord-x", x);
		quickButton.setAttribute("data-coord-y", y);
	}
}

async function smartMeaningShow(selectedText) {
	// Try sending message to the sidebar
	let sending;
	try {
		sending = await browser.runtime.sendMessage({ type: "search_for_meaning", text: selectedText });
	}
	catch (error) {
		sending = false;
	}

	// If the sidebar is not available, show "quick popup" instead
	if (sending != true) {
		// Show the cover
		let cover = document.getElementById("qdExt_cover");
		cover.setAttribute("style", "display: block;");

		// Take mouse coordinate (saved from "quick button" element attribute)
		let quickButton = document.getElementById("qdExt_quickButton");
		let x = Number(quickButton.getAttribute("data-coord-x"));
		let y = Number(quickButton.getAttribute("data-coord-y"));

		// Create the "quick popup"
		let quickPopup = document.createElement("iframe");
		quickPopup.setAttribute("id", "qdExt_quickPopup");
		quickPopup.src = browser.extension.getURL(`/quickpopup.html#input=${selectedText}`);
		quickPopup.setAttribute("style", `top: ${y + 16}px; left: ${x}px;`);
		document.getElementsByTagName("body")[0].appendChild(quickPopup);
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

		// Show the result
		smartMeaningShow(selectedText);
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
		let display = true;
		if (savedData.quickButton == false) {
			display = false;
		}
		
		let coords = getMouseCoords(event);
		setTimeout(function () {
			showQuickButton(coords.x, coords.y, display);
		}, 50);
	});

	browser.runtime.onMessage.addListener(function(request) {
		// Get selected text
		let selectedText = quickButton.getAttribute("data-selected-text").trim();

		// Show the result
		smartMeaningShow(selectedText);
	});
})();