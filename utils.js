export async function getDefaultLanguages() {
	const browserLangs = (await browser.i18n.getAcceptLanguages())
		  .map(lang => lang.slice(0, 2));
	return [...new Set(browserLangs)];
}

export async function getSavedData() {
	let langs = await getDefaultLanguages();
	let primLang = "";
	let secoLang = "";
	if (langs.length >= 2) {
		primLang = langs[0];
		secoLang = langs[1];
	} else if (langs.length === 1) {
		primLang = langs[0];
	}

	return await browser.storage.local.get({
		primLang,
		secoLang,
		quickButton: true,
		appearanceScale: 62.5,
		popupWidth: 360,
		popupHeight: 240
	});
}
