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

document.querySelector('#app-form').addEventListener('submit', (e) => {
	e.preventDefault()
	const inpValues = getFormValues('#app-form')

	// Автоматичне створення рядків таблиці
	const rows = Object.entries(inpValues)
		.map(([id, value]) => {
			// для чекбоксів показуємо "Так/Ні"
			const displayValue =
				typeof value === 'boolean' ? (value ? 'Так' : 'Ні') : value
			const label = document.querySelector(`label[for="${id}"]`)
			const labelText = label ? label.textContent : id

			return `<tr><td>${labelText}</td><td>${displayValue}</td></tr>`
		})
		.join('')

	const tableHTML = `
    <h2>Дані для розрахунку ЗП</h2>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Поле</th><th>Значення</th></tr>
      ${rows}
    </table>
  `

	document.querySelector('#result').innerHTML = tableHTML
})
