function getFormValues(formId) {
	const form = document.querySelector(formId)
	const formData = new FormData(form)
	const values = Object.fromEntries(formData.entries())

	// чекбокси треба обробити окремо
	form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
		values[cb.name] = cb.checked
	})

	return values
}

function saleryCalc(fvalues) {
// Години
const _planedHours = fvalues.planed_work_days * 8.25;
const	_realHours = fvalues.real_work_days * 8.25;
const _evnHours = fvalues.evn_h;
const	_nightHours = fvalues.night_h;
const POD_VZ_PROF = (100 - 18 - 5 - (fvalues.member_prof ? 1 : 0)) / 100;
let allNarahSum = null;
let allVidrahSum = null;
	
	const narah = {
		// Нарахування
		zpOklad: {code: 2, codeName: "Оклад", value: 0},
		dopShkid: {code: 32, codeName: "Доплата шкідливість", value: 0},
		dopBezpSt: {code: 150, codeName: "Доплата б/п стаж", value: 0},
		premium: {code: 157, codeName: "Премія", value: 0},
		dopEvenings: {code: 10, codeName: "Доплата вечірні", value: 0},
		dopNights: {code: 11, codeName: "Доплата нічні", value: 0},
		vidpOplata: {code: 0, codeName: "Відпускні", value: 0},
		vidpMatDop: {code: 0, codeName: "Мат. допомога (відпустка)", value: 0},
		mStrahMatDop: {code: 0, codeName: "Мат. допомога (страховка)", value: 0},
		vidpKomp: {code: 0, codeName: "Компенсація", value: 0},
		bonusGramPodjaka: {code: 0, codeName: "Подяка / Грамота", value: 0},
		bonusTeaching: {code: 0, codeName: "Підг. персоналу", value: 0},
		othersNarah: {code: 0, codeName: "Інші нарахування", value: 0},
	};
	
	const vidrah = {
		// Відрахування
		pdfo: {code:301, codeName: "Податок - ПДФО", value: 0},
		fullAvans: {code:330, codeName: "Аванс", value: 0},
		profsp: {code: 339, codeName: "Профспілка", value: 0},
		vZbir: {code: 378, codeName: "Військовий збір", value: 0},
		vnesGO: {code: 379, codeName: "Внески ГО", value: 0},
		vnesZSU: {code: 380, codeName: "Внески ЗСУ", value: 0},
		medicsStrah: {code: 0, codeName: "Медична страховка", value: 0},
		othersVidr: {code: 0, codeName: "Інші відрахування", value: 0}
	};
	
	function calcValuesSum(object) {
		let sum = 0;
		for (key in object) {
			console.log(key, object[key]["value"])
			sum += object[key]["value"];
		}
		return sum
	}
	
	// Розрахунок всіх надходжень
	// ==========================
	// 2
	narah.zpOklad.value = _realHours * fvalues.oklad / _planedHours;
	// 32
	narah.dopShkid.value = narah.zpOklad.value * fvalues.shkid / 100;
	// 150
	narah.dopBezpSt.value = narah.zpOklad.value * fvalues.bezper_stag / 100;
	// 10
	narah.dopEvenings.value = (narah.zpOklad.value / _realHours) * _evnHours * 0.2;
  // 11
	narah.dopNights.value = (narah.zpOklad.value / _realHours) * _nightHours * 0.4;
	// 157
	narah.premium.value = narah.zpOklad.value * fvalues.prem / 100;
  // Сума всіх нарахувань 
  allNarahSum = calcValuesSum(narah);
  
  
  // Розрахунок всіх відрахувань 
  // ===========================
  // 330
	vidrah.fullAvans.value = fvalues.days_for_avans * fvalues.oklad / fvalues.planed_work_days;
	vidrah.pdfo.value = 0.18 * allNarahSum;
	vidrah.profsp.value = 0.01 * allNarahSum;
	vidrah.vZbir = 0.05 * allNarahSum;
	vidrah.vnesGO = 0.035 * allNarahSum;
	vidrah.vnesZSU = 0.015 * allNarahSum;
	vidrah.medicsStrah = fvalues.med_polis;
	
	console.log(vidrah.pdfo.value)
	return {...narah, ...vidrah}
}

document.querySelector('#app-form').addEventListener('submit', (e) => {
	e.preventDefault()
	const formValues = getFormValues('#app-form')
  const narahult = saleryCalc(formValues)

	// Автоматичне створення звіту про прочитані з інпутів дані
	const reportContent = Object.entries(formValues)
		.map(([id, value]) => {
			// для чекбоксів показуємо "Так/Ні"
			const displayValue =
				typeof value === 'boolean' ? (value ? 'Так' : 'Ні') : value
			const label = document.querySelector(`label[for="${id}"]`)
			const labelText = label ? label.textContent : id

			return `<p><span>${labelText}</span><mark> ${id} </mark><b>${displayValue}</b></p>`
		})
		.join('')

	const tableHTML = `
    <div class="info-content">
    <h2>⏳ Для розрахунку</h2>
      ${reportContent}
    </div>
		<div class="info-content">
     <h2>🎯 Результат</h2>
     ${reportContent}
    </div>
  `

	document.querySelector('#report').innerHTML = tableHTML
})
