// /js/forms.js
class FormManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupPhoneMask();
        this.setupFormSubmission();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate="true"]');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                } else {
                    this.handleFormSubmission(form, e);
                }
            });

            // Валидация в реальном времени
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearError(input));
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Проверка согласия
        const consentCheckbox = form.querySelector('.consent-checkbox input');
        if (consentCheckbox && !consentCheckbox.checked) {
            this.showError(consentCheckbox, 'Необходимо дать согласие на обработку персональных данных');
            isValid = false;
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        
        if (!value) {
            this.showError(field, 'Это поле обязательно для заполнения');
            return false;
        }

        if (field.type === 'email' && !this.isValidEmail(value)) {
            this.showError(field, 'Введите корректный email адрес');
            return false;
        }

        if (field.type === 'tel' && !this.isValidPhone(value)) {
            this.showError(field, 'Введите корректный номер телефона');
            return false;
        }

        if (field.type === 'text' && field.name === 'name' && !this.isValidName(value)) {
            this.showError(field, 'Введите корректное имя (только буквы)');
            return false;
        }

        this.clearError(field);
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[78][-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    isValidName(name) {
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
        return nameRegex.test(name);
    }

    showError(field, message) {
        this.clearError(field);
        
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--accent-color);
            font-size: 0.8rem;
            margin-top: 5px;
        `;
        
        field.parentNode.appendChild(errorElement);
    }

    clearError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    setupPhoneMask() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length === 0) return;
                
                // Убираем первую цифру если это 7 или 8
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(1);
                }
                
                let formattedValue = '+7 (';
                
                if (value.length > 0) {
                    formattedValue += value.substring(0, 3);
                }
                if (value.length > 3) {
                    formattedValue += ') ' + value.substring(3, 6);
                }
                if (value.length > 6) {
                    formattedValue += '-' + value.substring(6, 8);
                }
                if (value.length > 8) {
                    formattedValue += '-' + value.substring(8, 10);
                }
                
                e.target.value = formattedValue;
            });

            // Сохраняем позицию курсора
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    const cursorPosition = input.selectionStart;
                    if (cursorPosition <= 4) {
                        e.preventDefault();
                    }
                }
            });
        });
    }

    setupFormSubmission() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.dataset.ajax === 'true') {
                e.preventDefault();
                this.submitFormAjax(form);
            }
        });
    }

    submitFormAjax(form) {
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Показываем индикатор загрузки
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';
        submitButton.style.opacity = '0.7';

        // Здесь будет реальная отправка на сервер
        // Временно имитируем успешную отправку
        setTimeout(() => {
            this.showSuccessMessage(form);
            form.reset();
            
            // Восстанавливаем кнопку
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.style.opacity = '1';

            // Логируем отправку формы
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'engagement',
                    'event_label': form.id || 'contact_form'
                });
            }
        }, 2000);
    }

    showSuccessMessage(form) {
        let successElement = form.querySelector('.form-success');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'form-success';
            successElement.style.cssText = `
                background: #e8f5e9;
                color: var(--success-color);
                padding: 15px;
                border-radius: var(--border-radius);
                margin: 20px 0;
                text-align: center;
            `;
            form.appendChild(successElement);
        }
        
        successElement.textContent = '✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.';
        successElement.classList.add('visible');

        // Прячем сообщение через 5 секунд
        setTimeout(() => {
            successElement.classList.remove('visible');
        }, 5000);
    }

    handleFormSubmission(form, e) {
        // Логирование отправки формы
        const formName = form.getAttribute('name') || form.id || 'unknown_form';
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'lead',
                'event_label': formName,
                'value': 1
            });
        }

        console.log('Form submitted:', formName);
    }
}

// Инициализация менеджера форм
document.addEventListener('DOMContentLoaded', function() {
    new FormManager();
});

// Утилиты для работы с формами
class FormUtils {
    static serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\+]?[78][-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
}