// /js/forms.js
class FormManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupConsentCheckboxes();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate="true"]');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Валидация в реальном времени
            const inputs = form.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearError(input));
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Проверка согласия
        const consentCheckbox = form.querySelector('.consent-checkbox input');
        if (consentCheckbox && !consentCheckbox.checked) {
            this.showError(consentCheckbox, 'Необходимо дать согласие на обработку данных');
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

    setupConsentCheckboxes() {
        const checkboxes = document.querySelectorAll('.consent-checkbox input');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Логируем согласие
                    console.log('User gave consent for data processing');
                }
            });
        });
    }
}

// Инициализация менеджера форм
document.addEventListener('DOMContentLoaded', function() {
    new FormManager();
});