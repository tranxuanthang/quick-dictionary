window.onload = function(){
	if((searchInput = document.getElementById('inputframe')) !==null)searchInput.placeholder=chrome.i18n.getMessage("popup_input_placeholder");
	if((searchButton = document.getElementById('submitbutton')) !==null)searchButton.value=chrome.i18n.getMessage("popup_input_submit");
	if((configLink = document.getElementById('configLink')) !==null)configLink.textContent=chrome.i18n.getMessage("popup_config_link");
	if((quickButtonDesc = document.getElementById('quickButtonDesc')) !==null)quickButtonDesc.textContent=chrome.i18n.getMessage("config_quickButton_desc");
	if((textQuickButtonYes = document.getElementById('textQuickButtonYes')) !==null)textQuickButtonYes.textContent=chrome.i18n.getMessage("config_yes");
	if((textQuickButtonNo = document.getElementById('textQuickButtonNo')) !==null)textQuickButtonNo.textContent=chrome.i18n.getMessage("config_no");
	if((wiktionaryLangDesc = document.getElementById('wiktionaryLangDesc')) !==null)wiktionaryLangDesc.textContent=chrome.i18n.getMessage("config_wiktionary_language_desc");
	if((wiktionaryLang1 = document.getElementById('wiktionaryLang1')) !==null)wiktionaryLang1.textContent=chrome.i18n.getMessage("config_wiktionary_language_1");
	if((wiktionaryLang2 = document.getElementById('wiktionaryLang2')) !==null)wiktionaryLang2.textContent=chrome.i18n.getMessage("config_wiktionary_language_2");
	if((configSubmit = document.getElementById('submit')) !==null)configSubmit.textContent=chrome.i18n.getMessage("config_submit");
	if((configGoBack = document.getElementById('goback')) !==null)configGoBack.textContent=chrome.i18n.getMessage("config_goback");
	if((nothing = document.getElementById('nothing')) !==null)nothing.textContent=chrome.i18n.getMessage("popup_nothing_here");
	if((configTitle = document.getElementById('configTitle')) !==null)configTitle.textContent=chrome.i18n.getMessage("config_title");
	if ((nothing = document.getElementById('appearanceScaleDesc')) !== null) nothing.textContent = chrome.i18n.getMessage("config_appearance_scale_desc");
	if ((nothing = document.getElementById('globalSizeDesc')) !== null) nothing.textContent = chrome.i18n.getMessage("config_global_size_desc");
	if ((nothing = document.getElementById('popupWidthDesc')) !== null) nothing.textContent = chrome.i18n.getMessage("config_popup_width_desc");
	if ((nothing = document.getElementById('popupHeightDesc')) !== null) nothing.textContent = chrome.i18n.getMessage("config_popup_height_desc");
};
