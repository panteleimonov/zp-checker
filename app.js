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

function saleryCalc(values) {
	const saleryResult = {}
	return saleryResult
}

document.querySelector('#app-form').addEventListener('submit', (e) => {
	e.preventDefault()
	const formValues = getFormValues('#app-form')
	const saleryResult = saleryCalc(formValues)

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
