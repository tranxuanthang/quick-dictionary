"use strict";

/* From https://stackoverflow.com/a/26495188 */
/*
function getSelectionCoords() {
	var sel = document.selection, range, rect;
	var x = 0, y = 0;
	if (window.getSelection) {
		sel = window.getSelection();
		if (sel.rangeCount) {
			range = sel.getRangeAt(0).cloneRange();
			if (range.getClientRects) {
				range.collapse(true);
				if (range.getClientRects().length > 0) {
					rect = range.getClientRects()[0];
					console.log(range.getBoundingClientRect());
					x = rect.left;
					y = rect.top;
				}
			}
			// Fall back to inserting a temporary element
			if (x == 0 && y == 0) {
				var span = document.createElement("span");
				if (span.getClientRects) {
					// Ensure span has dimensions and position by
					// adding a zero-width space character
					span.appendChild(document.createTextNode("\u200b"));
					range.insertNode(span);
					rect = span.getClientRects()[0];
					x = rect.left;
					y = rect.top;
					var spanParent = span.parentNode;
					spanParent.removeChild(span);

					// Glue any broken text nodes back together
					spanParent.normalize();
				}
			}
		}
	}
	return { x: x, y: y };
}*/

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
	return {x: event.pageX, y: event.pageY};
	// Use event.pageX / event.pageY here
}

function ShowQuickButton(x,y) {
	let txtSel = getSelection().toString();

	let quickButton = document.getElementById("qdExt_quickButton");
	if (!txtSel || txtSel == "") {
		if (quickButton) {
			quickButton.setAttribute("style", "display: none;");
		}
	} else {
		/*
		let coords = getSelectionCoords();

		var range = window.getSelection().getRangeAt(0);
		range.collapse(false);
		var dummy = document.createElement("span");
		range.insertNode(dummy);
		var rect = dummy.getBoundingClientRect();
		console.log('rect: ',rect);
		dummy.parentNode.removeChild(dummy);
		*/
		quickButton.setAttribute("style", `top: ${y - 48}px; left: ${x}px;`);
		quickButton.setAttribute("data-selected-text", txtSel);
		quickButton.setAttribute("data-coord-x", x);
		quickButton.setAttribute("data-coord-y", y);
	}
}

(function init() {
	let quickButton = document.createElement("div");
	quickButton.setAttribute("id", "qdExt_quickButton");
	quickButton.setAttribute("style", "display: none;");
	document.getElementsByTagName("body")[0].appendChild(quickButton);
	
	var quickPopup = document.createElement("div");
	quickPopup.setAttribute("id", "qdExt_quickPopup");
	quickPopup.setAttribute("class", "qdExt_result");
	quickPopup.setAttribute("style", "display: none;");
	quickPopup.innerHTML = `<div id="container">
    <div id="header">
        <div id="options"><button id="primlang" class="primary">n/a</button><button id="secolang">n/a</button></div>
    </div>
    <div id="main">
        <div id="result" class="qdExt_result">
                <h3>The standard Lorem Ipsum passage, used since the 1500s</h3><p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</p><h3>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</h3><p>"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"</p>
                <h3>1914 translation by H. Rackham</h3>
                <p>"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"</p>
                <h3>Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</h3>
                <p>"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."</p>
                <h3>1914 translation by H. Rackham</h3>
                <p>"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."</p>
        </div>
    </div>
    <button id="totop" title="Go to top">&#9650;</button>
</div>`;
	document.getElementsByTagName("body")[0].appendChild(quickPopup);
	
	quickButton.addEventListener("click", async function () {
		let selectedText = encodeURIComponent(quickButton.getAttribute("data-selected-text").toLowerCase());
		chrome.runtime.sendMessage({ type: "search_for_meaning", text: selectedText });

		var sending = await browser.runtime.sendMessage({ type: "sidebar_status" });
		
		if (!sending.response) {
			let x = Number(quickButton.getAttribute("data-coord-x"));
			let y = Number(quickButton.getAttribute("data-coord-y"));
			quickPopup.setAttribute("style", `top: ${y + 48}px; left: ${x}px;`);
			quickPopup.innerHTML = await smartGetResult(selectedText,"vi");
		}
	});

	document.addEventListener("mouseup", function (event) {
		let coords = getMouseCoords(event);
		ShowQuickButton(coords.x, coords.y);
	});
})();