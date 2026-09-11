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
		// style: 'currency',
		style: undefined,
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num)
}

function _getCleanText(elem) {
	return (
		elem.textContent
			// видаляємо емодзі та інші символи поза базовим діапазоном
			.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
			// нормалізуємо пробіли
			.replace(/\s+/g, ' ')
			.trim()
	)
}
// Використання:
// const text = getCleanText('.details-text');
// console.log(text);

function salaryCalc(userData) {
	// Коефіціенти
	const PDFO_VZ_PROF__GO_ZSU = (100 - 23 - userData.blag_vnes_GO - userData.blag_vnes_ZSU - (userData.member_prof ? 1 : 0)) / 100

	// Години
	const _planedHours = userData.planed_work_days * 8.25
	const _realHours = userData.real_work_days * 8.25
	const _calendarHoursesNorm = userData.calendar_hourses_norm
	const _evnHours = userData.evn_h
	const _nightHours = userData.night_h

	const accruals = {
		// Нарахування
		zpOklad: { type: 'accruals', code: 2, codeName: 'Оклад', amount: 0 },
		dopShkid: { type: 'accruals', code: 32, codeName: 'Доплата шкідливість', amount: 0 },
		dopBezpSt: { type: 'accruals', code: 150, codeName: 'Доплата б/п стаж', amount: 0 },
		premium: { type: 'accruals', code: 157, codeName: 'Премія', amount: 0 },
		dopEvenings: { type: 'accruals', code: 10, codeName: 'Доплата вечірні', amount: 0 },
		dopNights: { type: 'accruals', code: 11, codeName: 'Доплата нічні', amount: 0 },
		vidpNarah: { type: 'accruals', code: 0, codeName: 'Відпускні (нарах)', amount: 0 },
		vidpMatDop: { type: 'accruals', code: 0, codeName: 'Мат. доп. відпустка', amount: 0 },
		mStrahMatDop: { type: 'accruals', code: 0, codeName: 'Мат. доп. страховка', amount: 0 },
		vidpKomp: { type: 'accruals', code: 0, codeName: 'Компенсація', amount: 0 },
		bonusGramPodjaka: { type: 'accruals', code: 0, codeName: 'Подяка / Грамота', amount: 0 },
		bonusTeaching: { type: 'accruals', code: 0, codeName: 'Підг. персоналу', amount: 0 },
		indexation: { type: 'accruals', code: 0, codeName: 'Iндексацiя', amount: 0 },
		othersAccruals: { type: 'accruals', code: 0, codeName: 'Інші нарахування', amount: 0 },
		// Сума всіх нарахувань
		accrualsSum: { type: 'accruals', codeName: '<b>Всього нараховано</b>', amount: 0 },
	}

	const deductions = {
		// Відрахування
		pdfo: { type: 'deductions', code: 301, codeName: 'Податок - ПДФО', amount: 0 },
		avans: { type: 'deductions', code: null, codeName: 'Аванс', amount: 0, plusMinus: null },
		vidp: { type: 'deductions', code: 359, codeName: 'Ощ/к відпускні', amount: 0 },
		profsp: { type: 'deductions', code: 339, codeName: 'Профспілка', amount: 0 },
		vZbir: { type: 'deductions', code: 378, codeName: 'Військовий збір', amount: 0 },
		vnesGO: { type: 'deductions', code: 379, codeName: 'Внески ГО', amount: 0 },
		vnesZSU: { type: 'deductions', code: 380, codeName: 'Внески ЗСУ', amount: 0 },
		medicsStrah: { type: 'deductions', code: 0, codeName: 'Медична страховка', amount: 0 },
		othersVidr: { type: 'deductions', code: 0, codeName: 'Інші відрахування', amount: 0 },
		// Сума всіх відрахувань
		deductionsSum: { type: 'deductions', codeName: '<b>Всього утримано</b>', amount: 0 },
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
	accruals.dopEvenings.amount = _floor2((userData.oklad / _calendarHoursesNorm) * _evnHours * 0.2)
	// Код - 11
	accruals.dopNights.amount = _floor2((userData.oklad / _calendarHoursesNorm) * _nightHours * 0.4)
	// Код - 157
	accruals.premium.amount = _floor2((userData.pop_oklad * userData.prem) / 100)
	// Код - ***
	accruals.vidpNarah.amount = _floor2(userData.vidp_narah)
	// Код - ***
	accruals.vidpMatDop.amount = _floor2(userData.mater_dop)
	// Код - ***
	accruals.mStrahMatDop.amount = _floor2(userData.med_polis)
	// Код - ***
	accruals.vidpKomp.amount = _floor2(userData.vidp_komp)
	// Код - ***
	accruals.bonusGramPodjaka.amount = _floor2(userData.gram_pod)
	// Код - ***
	accruals.bonusTeaching.amount = _floor2(userData.pidg_pers)
	// Код - ***
	accruals.indexation.amount = _floor2(userData.indexation)
	// Код - ***
	accruals.othersAccruals.amount = _floor2(userData.others_nar)
	// Сума всіх нарахувань
	accruals.accrualsSum.amount = sumObjValues(accruals, 'amount')

	// Розрахунок всіх відрахувань
	// ===========================
	// Код - 330
	deductions.avans.amount = userData.avans ? +userData.avans : PDFO_VZ_PROF__GO_ZSU * _floor2((userData.days_for_avans * userData.oklad) / userData.planed_work_days)
	deductions.avans.codeName = userData.avans ? 'Аванс (отримано)' : 'Аванс (можливий)'
	deductions.avans.plusMinus = userData.avans ? false : true
	deductions.avans.code = userData.avans ? 330 : null
	// Код - 301
	deductions.pdfo.amount = _floor2(0.18 * accruals.accrualsSum.amount)
	// Код - 359
	// deductions.vidp.amount = _floor2(accruals.vidpNarah.amount + accruals.vidpMatDop.amount) * PDFO_VZ_PROF__GO_ZSU
	deductions.vidp.amount = _floor2(userData.vidp_oplata)
	// Код - 339
	deductions.profsp.amount = _floor2(userData.member_prof ? 0.01 * accruals.accrualsSum.amount : 0)
	// Код - 378
	deductions.vZbir.amount = _floor2(0.05 * accruals.accrualsSum.amount)
	// Код - 379
	deductions.vnesGO.amount = _floor2((userData.blag_vnes_GO / 100) * accruals.accrualsSum.amount)
	// Код - 380
	deductions.vnesZSU.amount = _floor2((userData.blag_vnes_ZSU / 100) * accruals.accrualsSum.amount)
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
	const fullZP = salaryRes.accrualsSum.amount - salaryRes.deductionsSum.amount
	const avans = salaryRes.avans.amount

	// Автоматичне створення звіту про прочитані з інпутів дані користувача
	const salaryReportHTML = Object.entries(formValues)
		.map(([id, value]) => {
			// для чекбоксів показуємо "Так/Ні"
			const displayValue = typeof value === 'boolean' ? (value ? 'Так' : 'Ні') : value
			if (!displayValue) return

			const label = document.querySelector(`label[for="${id}"]`)
			let labelText = label ? label.textContent : id
			if (labelText === 'evn_h') {
				labelText = 'Вечірні години'
			} else if (labelText === 'night_h') {
				labelText = 'Нічні години'
			}

			return `<p><span>${labelText}</span><mark> ${id} </mark><b>${displayValue}</b></p>`
		})
		.join('')

	// Автоматичне створення звіту про результати розрахунку ЗП
	const salaryResultsHTML = Object.entries(salaryRes)
		.map(([key, val]) => {
			console.log(key, val.amount)
			return !val.amount
				? ''
				: `
			<p><span>${val.type === 'accruals' ? '🟢' : '🔴'} ${val.codeName}${val.code ? ' - <span class="hidemobile">код </span>' + val.code : ''}</span><b>${val.plusMinus ? '+/- ' + _formatMoney(val.amount) : _formatMoney(val.amount)}</b></p>
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
	document.querySelector('#salary-resume').innerHTML = `
    <div class="info-content">
     <h2>😎 Підсумок</h2>
		 <p><span>${salaryRes.avans.codeName}</span><b>${avans ? (salaryRes.avans.plusMinus ? '+/- ' + _formatMoney(avans) : _formatMoney(avans)) : 'Без авансу'}</b></p>
		 <p><span>Зарплата (до видачi)</span><b>${avans && salaryRes.avans.plusMinus ? '+/- ' + _formatMoney(fullZP) : _formatMoney(fullZP)}</b></p>
		 <p><span><b>Разом</b></span><b>${_formatMoney(fullZP + avans)}</b></p>
    </div>
  `
	document.querySelector('.main').classList.add('hidden')
	setTimeout(() => {
		document.querySelector('.main').classList.add('mxh_100vh')
		document.querySelector('.results-section').classList.add('active')
		document.querySelector('body').classList.add('not-overflow')
	}, 300)
})

const inputs = document.querySelectorAll('input[type="text"]')
const footerDetails = document.querySelector('.footer-details')
const footerDetailsHeader = footerDetails.querySelector('.header-footer-details')
const footerDetailsText = footerDetails.querySelector('.text-footer-details')
const footerDetailsCode = footerDetails.querySelector('.code-footer-details')
const footerDetailsHeader_defaultText = footerDetailsHeader.innerText
const footerDetailsText_defaultText = footerDetailsText.innerText
const footerDetailsCode_defaultText = footerDetailsCode.innerText

inputs.forEach((input) => {
	input.addEventListener('focus', () => {
		const inpDetails = input.closest('.input-wrapper').nextElementSibling
		if (inpDetails && inpDetails.classList.contains('inp-details')) {
			if (window.getComputedStyle(footerDetails).display !== 'none') {
				const inpLabel = _getCleanText(input.closest('.input-wrapper').querySelector('label'))
				const inpDetailsText = _getCleanText(inpDetails.querySelector('.details-text'))
				const inpDetailsCode = '🟠 ' + _getCleanText(inpDetails.querySelector('.code-details'))
				footerDetails.classList.add('hidden-content')
				setTimeout(() => {
					footerDetailsHeader.innerText = inpLabel
					footerDetailsText.innerText = inpDetailsText
					footerDetailsCode.innerText = inpDetailsCode
					footerDetails.classList.remove('hidden-content')
				}, 300) // CSS --> transition: all 300ms
			} else {
				inpDetails.classList.add('active')
				inpDetails.style.maxHeight = `calc(1.5em + ${inpDetails.scrollHeight}px)` // задаємо висоту контенту
			}
		}
	})

	input.addEventListener('blur', () => {
		const inpDetails = input.closest('.input-wrapper').nextElementSibling
		if (inpDetails && inpDetails.classList.contains('inp-details')) {
			if (window.getComputedStyle(footerDetails).display !== 'none') {
				footerDetails.classList.add('hidden-content')
				setTimeout(() => {
					// костиль, щоб при клiку за межi браузера поле footerDetails не пропадало
					footerDetails.classList.remove('hidden-content')
				}, 400)
				setTimeout(() => {
					if (!(document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'text')) {
						// перевіряємо чи спрацювання blur не є наслідком переходу в інше поле input.
						// Інакше ігноруємо скидання тексту на дефолтний (щоб не заважати обробці focus).
						// ! Припускаємо, що фокус може бути не на input - в такому разі скидаємо текст.
						footerDetailsHeader.innerText = footerDetailsHeader_defaultText
						footerDetailsText.innerText = footerDetailsText_defaultText
						footerDetailsCode.innerText = footerDetailsCode_defaultText
						footerDetails.classList.remove('hidden-content')
					}
				}, 300) // CSS --> transition: all 300ms
			} else {
				inpDetails.classList.remove('active')
				inpDetails.style.maxHeight = null
			}
		}
	})
})

// Автоматичний розрахунок вечірніх / нічних годин
// ============================================================================

const evnDays_input = document.querySelector('#evn_d')
const evnHours_input = document.querySelector('#evn_h')
const nightDays_input = document.querySelector('#night_d')
const nightHours_input = document.querySelector('#night_h')
const evn_h_after_span = document.querySelector('.evn_h-after')
const evn_d_after_span = document.querySelector('.evn_d-after')
const night_h_after_span = document.querySelector('.night_h-after')
const night_d_after_span = document.querySelector('.night_d-after')

function evnDaysToHourse_UI_effect() {
	evnDays_input.classList.add('short')
	evnHours_input.classList.add('short')
	evn_d_after_span.innerHTML = '='
	evn_h_after_span.innerHTML = '&nbsp;годин'
}

function evnDaysToHourse_UI_reset() {
	evnDays_input.classList.remove('short')
	evnHours_input.classList.remove('short')
	evn_h_after_span.innerHTML = ''
	evn_d_after_span.innerHTML = 'або'
}

function nightDaysToHourse_UI_effect() {
	nightDays_input.classList.add('short')
	nightHours_input.classList.add('short')
	night_d_after_span.innerHTML = '='
	night_h_after_span.innerHTML = '&nbsp;годин'
}

function nightDaysToHourse_UI_reset() {
	nightDays_input.classList.remove('short')
	nightHours_input.classList.remove('short')
	night_h_after_span.innerHTML = ''
	night_d_after_span.innerHTML = 'або'
}

evnDays_input.addEventListener('blur', (e) => {
	if (e.target.value > 20 || e.target.value === '') {
		e.target.value = evnHours_input.value = ''
		evnDaysToHourse_UI_reset()
	} else {
		evnHours_input.value = 8.25 * e.target.value
		evnDaysToHourse_UI_effect()
	}
})

evnHours_input.addEventListener('blur', (e) => {
	if (e.target.value > 200 || e.target.value === '') {
		e.target.value = evnDays_input.value = ''
		evnDaysToHourse_UI_reset()
	} else {
		evnDays_input.value = Math.round(e.target.value / 8.25)
		evnDaysToHourse_UI_effect()
	}
})

nightDays_input.addEventListener('blur', (e) => {
	if (e.target.value > 20 || e.target.value === '') {
		e.target.value = nightHours_input.value = ''
		nightDaysToHourse_UI_reset()
	} else {
		nightHours_input.value = 8.25 * e.target.value
		nightDaysToHourse_UI_effect()
	}
})

nightHours_input.addEventListener('blur', (e) => {
	if (e.target.value > 200 || e.target.value === '') {
		e.target.value = nightDays_input.value = ''
		nightDaysToHourse_UI_reset()
	} else {
		nightDays_input.value = Math.round(e.target.value / 8.25)
		nightDaysToHourse_UI_effect()
	}
})

document.getElementById('app-form').addEventListener('reset', () => {
	evnDaysToHourse_UI_reset()
	nightDaysToHourse_UI_reset()
})

// ****************************************************************************

// Автозаповнення: оклад --> оклад за поп. мисяць (для зручност користувача)
// ============================================================================

setTimeout(() => {
	document.querySelector('#pop_oklad').value = document.querySelector('#oklad').value
}, 0)

document.querySelector('#oklad').addEventListener('change', () => {
	document.querySelector('#pop_oklad').value = document.querySelector('#oklad').value
})

function closeResults() {
	document.querySelector('.results-section').classList.remove('active')
	document.querySelector('body').classList.remove('not-overflow')
	setTimeout(() => {
		document.querySelector('.main').classList.remove('mxh_100vh')
		document.querySelector('.main').classList.remove('hidden')
	}, 300)
}
document.querySelector('.results-close-btn').addEventListener('click', closeResults)
document.addEventListener('keydown', function (event) {
	if (event.key === 'Escape') {
		closeResults()
	}
})

// Вiдключення неактуального поля для авансу (вже отримано чи +/- прогнозований)
// =============================================================================

const avansField = document.querySelector('#avans')
const daysForAvansField = document.querySelector('#days_for_avans')

function disableDaysForAvans(e) {
	if (e.target.value !== '') {
		daysForAvansField.setAttribute('disabled', true)
	} else {
		daysForAvansField.removeAttribute('disabled')
	}
}

function disableAvans(e) {
	if (e.target.value !== '') {
		avansField.setAttribute('disabled', true)
	} else {
		avansField.removeAttribute('disabled')
	}
}

avansField.addEventListener('input', disableDaysForAvans)
daysForAvansField.addEventListener('input', disableAvans)

// *****************************************************************************
