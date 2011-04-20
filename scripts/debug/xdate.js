/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * Some date-manipulation functions
 *
 * Links dateFrom & dateTo elements to each other & provides correct dates for them.
 *
 */

Date.prototype.midnight = function() { this.setHours(0); this.setMinutes(0); this.setSeconds(0); this.setMilliseconds(0); return this; }

today = new Date().midnight();
dformat = "%d.%m.%Y";

function checkDate(f) {
	var dd;
	if (dd = ((typeof(f) == "string") ? document.getElementById(f).value : f.value).match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/)) {
		res = new Date();
		res.setYear(dd[3]);
		res.setMonth(dd[2] - 1);
		res.setDate(dd[1]);
		return res.midnight();
	}
	else return false;
}

function fixDate(field) {
	var dfrom, dto;

	var el = (typeof(field) == "string") ? document.getElementById(field) : field;

	switch (field.id || field) {

		case 'dateFrom':
		
			if (!(dfrom = checkDate(field)) || (dfrom.getTime() < today.getTime())) 
				dfrom = today;

			el.value = dfrom.print(dformat);
	
			if (!(dto = checkDate("dateTo")) || (dto.getTime() < dfrom.getTime() + Date.DAY)) {
				dto = new Date(dfrom.getTime() + Date.DAY);
			}
			document.getElementById("dateTo").value = dto.print(dformat);
			
			break;

		case 'dateTo':
		
			if (!(dto = checkDate(field)) || (dto.getTime() < today.getTime() + Date.DAY)) 
				dto = new Date(today.getTime() + Date.DAY);

			el.value = dto.print(dformat);
	
			if (!(dfrom = checkDate("dateFrom")) || (dfrom.getTime() > dto.getTime() - Date.DAY)) {
				dfrom = new Date(dto.getTime() - Date.DAY);
			}
			document.getElementById("dateFrom").value = dfrom.print(dformat);
			
			break;

		case 'order_from':
		
			if (!(dfrom = checkDate(field)) || (dfrom.getTime() < today.getTime())) 
				dfrom = today;

			el.value = dfrom.print(dformat);
	
			if (!(dto = checkDate("order_to")) || (dto.getTime() < dfrom.getTime() + Date.DAY)) {
				dto = new Date(dfrom.getTime() + Date.DAY);
			}
			document.getElementById("order_to").value = dto.print(dformat);
			
			break;

		case 'order_to':
		
			if (!(dto = checkDate(field)) || (dto.getTime() < today.getTime() + Date.DAY)) 
				dto = new Date(today.getTime() + Date.DAY);

			el.value = dto.print(dformat);
	
			if (!(dfrom = checkDate("order_from")) || (dfrom.getTime() > dto.getTime() - Date.DAY)) {
				dfrom = new Date(dto.getTime() - Date.DAY);
			}
			document.getElementById("order_from").value = dfrom.print(dformat);
			
			break;

	}
	
	nights = Math.floor((dto.getTime() - dfrom.getTime()) / Date.DAY);
	var lang = (window.xApp != undefined) ? window.xApp.state.language : "en";
	
	
	var form = $(el).parents("form");
	form.find(".search_nights_num").text(nights);
	//form.find(".search_nights_word").text(l18n.spell("nights", {lang: lang, nights: nights}));
}

function disableFromDate(d) { return d.midnight().getTime() < today.getTime() }
function disableToDate(d) { return d.midnight().getTime() < today.getTime() + Date.DAY }

var ieMustDieForever;

function fixDateOpen(cal) {}

function fixDateClose(cal) {
	cal.hide();
}