const inpValues = {}

function getinpValues() {
	// Головне
	inpValues.oklad = document.querySelector('#oklad').value
	inpValues.shkid = document.querySelector('#shkid').value
	inpValues.bezper_stag = document.querySelector('#bezper_stag').value
	// Табелювання
	inpValues.planed_work_days = document.querySelector('#planed_work_days').value
	inpValues.real_work_days = document.querySelector('#real_work_days').value
	inpValues.days_for_avans = document.querySelector('#days_for_avans').value

	inpValues.evn_d = document.querySelector('#evn_d').value
	inpValues.evn_h = document.querySelector('#evn_h').value
	inpValues.night_d = document.querySelector('#night_d').value
	inpValues.night_h = document.querySelector('#night_h').value
	// Нарахування
	inpValues.prem = document.querySelector('#prem').value
	inpValues.pop_oklad = document.querySelector('#pop_oklad').value
	inpValues.vidp_days = document.querySelector('#vidp_days').value
	inpValues.komp_days = document.querySelector('#komp_days').value
	inpValues.mater_dop = document.querySelector('#mater_dop').value
	inpValues.gram_pod = document.querySelector('#gram_pod').value
	inpValues.pidg_pers = document.querySelector('#pidg_pers').value
	inpValues.others_nar = document.querySelector('#others_nar').value
	// Відрахування
	inpValues.member_prof = document.querySelector('#member_prof').checked
	inpValues.blag_vnes = document.querySelector('#blag_vnes').checked
	inpValues.med_polis = document.querySelector('#med_polis').value
	inpValues.others_vidr = document.querySelector('#others_vidr').value

	// Виводимо результат у div
	document.querySelector('#result').innerHTML = `
    <h2>Дані для розрахунку ЗП</h2>
    <p>Оклад (поточний) грн. - <b>${inpValues.oklad}</b></p>
    <p>Надбавка за шкідливість % - <b>${inpValues.shkid}</b></p>
    <p>Доплата за б/п стаж % - <b>${inpValues.bezper_stag}</b></p>
    <hr>
    <p>Заплановано робочих днів - <b>${inpValues.planed_work_days}</b></p>
    <p>Відпрацьовано днів (змін) - <b>${inpValues.real_work_days}</b></p>
    <p>Днів (змін) до 15-го числа (включно) - <b>${inpValues.days_for_avans}</b></p>
    <p>Вечірні зміни - <b>${inpValues.evn_d}</b></p>
    <p>Вечірні години - <b>${inpValues.evn_h}</b></p>
    <p>Нічні зміни - <b>${inpValues.night_d}</b></p>
    <p>Нічні години - <b>${inpValues.night_h}</b></p>
    <hr>
    <p>Премія % - <b>${inpValues.prem}</b></p>
    <p>Оклад за попередній місяць - <b>${inpValues.pop_oklad}</b></p>
    <p>Відпустка (кількість днів) - <b>${inpValues.vidp_days}</b></p>
    <p>Компенсація (кількість днів) - <b>${inpValues.komp_days}</b></p>
    <p>Матеріальна допомога - <b>${inpValues.mater_dop}</b></p>
    <p>Премія за грамоту / подяку - <b>${inpValues.gram_pod}</b></p>
    <p>Доплата за підг. персоналу - <b>${inpValues.pidg_pers}</b></p>
    <p>Інші нарахування (грн.) - <b>${inpValues.others_nar}</b></p>
    <hr>    
    <p>Членство у профспілці (1%) - <b>${inpValues.member_prof ? 'Так' : 'Без членства'}</b></p>
    <p>Благодійні внески (1.5% / 3.5%) - <b>${inpValues.blag_vnes ? 'Так' : 'Без внесків'}</b></p>
    <p>Медичне страхування (поліс) - <b>${inpValues.med_polis}</b></p>
    <p>Інші відрахування (грн.) - <b>${inpValues.others_vidr}</b></p>
  `
}

document.querySelector('#app-form').addEventListener('submit', (e) => {
	e.preventDefault()
	getinpValues()
})
