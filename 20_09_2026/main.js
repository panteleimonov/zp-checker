console.log('Hello World!')

document.querySelectorAll('input[inputmode="numeric"]').forEach((input) => {
	input.addEventListener('input', function () {
		let val = this.value

		// Залишаємо тільки цифри, крапку та кому
		val = val.replace(/[^0-9.,]/g, '')

		// Якщо є і крапка, і кома → залишаємо лише перший роздільник
		const firstDot = val.indexOf('.')
		const firstComma = val.indexOf(',')

		if (firstDot !== -1 && firstComma !== -1) {
			// Якщо перша була крапка → видаляємо всі коми
			if (firstDot < firstComma) {
				val = val.replace(/,/g, '')
			} else {
				// Якщо перша була кома → видаляємо всі крапки
				val = val.replace(/\./g, '')
			}
		}

		// Якщо кілька крапок → залишаємо тільки першу
		val = val.replace(/(\..*)\./g, '$1')
		// Якщо кілька ком → залишаємо тільки першу
		val = val.replace(/(,.*),/g, '$1')

		// Автоматично замінюємо кому на крапку
		val = val.replace(/,/g, '.')

		this.value = val
	})

	// Курсор завжди в кінці
	input.addEventListener('focus', function () {
		const len = this.value.length
		setTimeout(() => {
			this.setSelectionRange(len, len)
		}, 0)
	})
})

// ===================
// Поля з класом .main-field для localStorage
// ===================
const savedInputs = document.querySelectorAll('input[type="text"].toLocalStorege')

// ===================
// Всі текстові input для перевірки на коректні числа
// ===================
const allTextInputs = document.querySelectorAll('input[type="text"]')

// ===================
// Функція для перевірки і очищення числового значення
// ===================
function validateNumber(input) {
	let value = input.value.replace(',', '.') // кома → крапка

	// Для полів без класу large відразу повертаємо максимум двозначне число.
	if (!input.classList.contains('large')) {
		value = value.replace(/[^\d]/g, '').slice(0, 2)
		input.value = value
		return value // повертаємо числове значення
	}

	// Залишаємо лише цифри та крапку для полів з класом large.
	value = value.replace(/[^\d.]/g, '')

	// Крапка не може бути першим символом
	if (value.startsWith('.')) value = value.slice(1)

	// Крапка не може бути останнім символом
	if (value.endsWith('.')) value = value.slice(0, -1)

	const parts = value.split('.')
	if (parts.length > 1) {
		value = parts[0] + '.' + parts[1].slice(0, 2) // максимум 2 цифри після крапки
	}

	// Якщо поле порожнє або тільки крапка → очищаємо
	if (value.trim() === '' || value === '.') {
		input.value = ''
		return null
	}

	input.value = value
	return value // повертаємо числове значення
}

// ===================
// Функція для збереження в localStorage
// ===================
function saveMainFieldOnBlur(e) {
	const input = e.target
	const value = validateNumber(input)
	if (value) {
		localStorage.setItem(input.id, value)
	}
}

// ===================
// Підвантаження значень з localStorage для .main-field
// ===================
function loadMainFieldNumbers() {
	savedInputs.forEach((input) => {
		const savedValue = localStorage.getItem(input.id)
		if (savedValue !== null) {
			input.value = savedValue
			input.setAttribute('value', savedValue)
		}
	})
}

// ===================
// Додаємо обробники
// ===================

// Для всіх input перевіряємо числове значення на blur
allTextInputs.forEach((input) => {
	input.addEventListener('blur', () => validateNumber(input))
})

// Для input у .main-field зберігаємо в localStorage
savedInputs.forEach((input) => {
	input.addEventListener('blur', saveMainFieldOnBlur)
})

// Завантаження при старті сторінки
window.addEventListener('DOMContentLoaded', loadMainFieldNumbers)

// +380 67 298 0594
