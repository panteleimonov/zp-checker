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

// Щоб заокруглювати суми до двох знаків після крапки, але завжди вниз (до меншого)
function _floor2(num) {
	return Math.floor(num * 100) / 100
}

// Функція _formatMoney повертатиме красиво відформатовану грошову суму з двома
// знаками після крапки й роздільниками тисяч.
// 🔑 Пояснення:
// Використовується "Intl.NumberFormat" — це стандартний спосіб форматування чисел у JS.
// "minimumFractionDigits" і "maximumFractionDigits" гарантують два знаки після крапки.
function _formatMoney(num, currency = 'UAH') {
	return new Intl.NumberFormat('uk-UA', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num)
}

function salaryCalc(userData) {
	// Коефіціенти
	const PDFO_VZ_PROF = (100 - 18 - 5 - (userData.member_prof ? 1 : 0)) / 100
	const VIDP_1DAY_COEF = 0.1
	const COMP_1DAY_COEF = 0.1

	// Години
	const _planedHours = userData.planed_work_days * 8.25
	const _realHours = userData.real_work_days * 8.25
	const _evnHours = userData.evn_h
	const _nightHours = userData.night_h

	const accruals = {
		// Нарахування
		zpOklad: { code: 2, codeName: 'Оклад', amount: 0 },
		dopShkid: { code: 32, codeName: 'Доплата шкідливість', amount: 0 },
		dopBezpSt: { code: 150, codeName: 'Доплата б/п стаж', amount: 0 },
		premium: { code: 157, codeName: 'Премія', amount: 0 },
		dopEvenings: { code: 10, codeName: 'Доплата вечірні', amount: 0 },
		dopNights: { code: 11, codeName: 'Доплата нічні', amount: 0 },
		vidpOplata: { code: 0, codeName: 'Відпускні', amount: 0 },
		vidpMatDop: { code: 0, codeName: 'Мат. допомога (відпустка)', amount: 0 },
		mStrahMatDop: { code: 0, codeName: 'Мат. допомога (страховка)', amount: 0 },
		vidpKomp: { code: 0, codeName: 'Компенсація', amount: 0 },
		bonusGramPodjaka: { code: 0, codeName: 'Подяка / Грамота', amount: 0 },
		bonusTeaching: { code: 0, codeName: 'Підг. персоналу', amount: 0 },
		othersAccruals: { code: 0, codeName: 'Інші нарахування', amount: 0 },
		// Сума всіх нарахувань
		accrualsSum: { codeName: '<b>Всього нараховано</b>', amount: 0 },
	}

	const deductions = {
		// Відрахування
		pdfo: { code: 301, codeName: 'Податок - ПДФО', amount: 0 },
		fullAvans: { code: 330, codeName: 'Аванс', amount: 0 },
		profsp: { code: 339, codeName: 'Профспілка', amount: 0 },
		vZbir: { code: 378, codeName: 'Військовий збір', amount: 0 },
		vnesGO: { code: 379, codeName: 'Внески ГО', amount: 0 },
		vnesZSU: { code: 380, codeName: 'Внески ЗСУ', amount: 0 },
		medicsStrah: { code: 0, codeName: 'Медична страховка', amount: 0 },
		othersVidr: { code: 0, codeName: 'Інші відрахування', amount: 0 },
		// Сума всіх відрахувань
		deductionsSum: { codeName: '<b>Всього утримано</b>', amount: 0 },
	}

	function sumObjValues(object, valueName) {
		console.log('sumObjValues -->')
		return Object.values(object).reduce((acc, item) => {
			const currValue = item?.[valueName]
			console.log(item, currValue)
			return _floor2(acc + (typeof currValue === 'number' ? currValue : 0))
		}, 0)
	}

	// Розрахунок всіх надходжень
	// ==========================
	// Код - 2
	accruals.zpOklad.amount = _floor2((_realHours * userData.oklad) / _planedHours)
	// Код - 32
	accruals.dopShkid.amount = _floor2((accruals.zpOklad.amount * userData.shkid) / 100)
	// Код - 150
	accruals.dopBezpSt.amount = _floor2((accruals.zpOklad.amount * userData.bezper_stag) / 100)
	// Код - 10
	accruals.dopEvenings.amount = _floor2((accruals.zpOklad.amount / _realHours) * _evnHours * 0.2)
	// Код - 11
	accruals.dopNights.amount = _floor2((accruals.zpOklad.amount / _realHours) * _nightHours * 0.4)
	// Код - 157
	accruals.premium.amount = _floor2((userData.pop_oklad * userData.prem) / 100)
	// Код - ***
	accruals.vidpOplata.amount = _floor2(userData.vidp_days * VIDP_1DAY_COEF * accruals.zpOklad.amount)
	// Код - ***
	accruals.vidpMatDop.amount = _floor2(userData.mater_dop)
	// Код - ***
	accruals.mStrahMatDop.amount = _floor2(userData.med_polis)
	// Код - ***
	accruals.vidpKomp.amount = _floor2(userData.komp_days * COMP_1DAY_COEF * accruals.zpOklad.amount)
	// Код - ***
	accruals.bonusGramPodjaka.amount = _floor2(userData.gram_pod)
	// Код - ***
	accruals.bonusTeaching.amount = _floor2(userData.pidg_pers)
	// Код - ***
	accruals.othersAccruals.amount = _floor2(userData.others_nar)
	// Сума всіх нарахувань
	accruals.accrualsSum.amount = sumObjValues(accruals, 'amount')

	// Розрахунок всіх відрахувань
	// ===========================
	// Код - 330
	deductions.fullAvans.amount = _floor2((userData.days_for_avans * userData.oklad) / userData.planed_work_days)
	// Код - 301
	deductions.pdfo.amount = _floor2(0.18 * accruals.accrualsSum.amount)
	// Код - 339
	deductions.profsp.amount = _floor2(userData.member_prof ? 0.01 * accruals.accrualsSum.amount : 0)
	// Код - 378
	deductions.vZbir.amount = _floor2(0.05 * accruals.accrualsSum.amount)
	// Код - 379
	deductions.vnesGO.amount = _floor2(0.035 * accruals.accrualsSum.amount)
	// Код - 380
	deductions.vnesZSU.amount = _floor2(0.015 * accruals.accrualsSum.amount)
	// Код - ***
	deductions.medicsStrah.amount = _floor2(+userData.med_polis)
	// Код - Інше
	deductions.othersVidr.amount = _floor2(+userData.others_vidr)
	// Сума всіх відрахувань
	deductions.deductionsSum.amount = sumObjValues(deductions, 'amount')

	return { ...accruals, ...deductions }
}

document.querySelector('#app-form').addEventListener('submit', (e) => {
	e.preventDefault()
	const formValues = getFormValues('#app-form')
	const salaryRes = salaryCalc(formValues)

	// Автоматичне створення звіту про прочитані з інпутів дані користувача
	const salaryReportHTML = Object.entries(formValues)
		.map(([id, value]) => {
			// для чекбоксів показуємо "Так/Ні"
			const displayValue = typeof value === 'boolean' ? (value ? 'Так' : 'Ні') : value
			const label = document.querySelector(`label[for="${id}"]`)
			const labelText = label ? label.textContent : id

			return `<p><span>${labelText}</span><mark> ${id} </mark><b>${displayValue}</b></p>`
		})
		.join('')

	// Автоматичне створення звіту про результати розрахунку ЗП
	const salaryResultsHTML = Object.entries(salaryRes)
		.map(([key, val]) => {
			console.log(key, val)
			return `
			<p><span>${val.codeName}</span><mark>${val.amount}</mark><b>${_formatMoney(val.amount)}</b></p>
			`
		})
		.join('')

	document.querySelector('#salary-report').innerHTML = `
    <div class="info-content">
    <h2>⏳ Для розрахунку</h2>
      ${salaryReportHTML}
    </div>
  `
	document.querySelector('#salary-results').innerHTML = `
    <div class="info-content">
     <h2>🎯 Результат</h2>
     ${salaryResultsHTML}
    </div>
  `
})
