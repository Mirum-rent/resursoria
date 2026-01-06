/**
 * Form Manager for Resursoria website
 * Version: 3.01.2026 - ОБНОВЛЕНО ДЛЯ ПЕРЕНОСА НА ОСНОВНОЙ САЙТ
 * Features: Валидация, маска телефона, отправка через WhatsApp
 */

class FormManager {
    constructor() {
        this.forms = [];
        this.init();
    }

    init() {
        console.log('FormManager initialized - Forms will submit via WhatsApp');
        this.setupFormValidation();
        this.setupPhoneMask();
        this.setupFormSubmission();
        this.setupInputEnhancements();
        this.setupWhatsAppForms();
    }

    // Form Validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            this.forms.push(form);
            
            if (!form.hasAttribute('novalidate')) {
                form.setAttribute('novalidate', '');
            }
            
            // Проверяем согласие на обработку данных
            const consentCheckbox = form.querySelector('.consent-checkbox input[type="checkbox"]');
            if (consentCheckbox) {
                consentCheckbox.required = true;
                
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && !consentCheckbox.checked) {
                    submitBtn.disabled = true;
                }
                
                consentCheckbox.addEventListener('change', (e) => {
                    if (submitBtn) {
                        submitBtn.disabled = !e.target.checked;
                    }
                });
            }
            
            form.addEventListener('submit', (e) => {
                const consent = window.privacyManager?.getCookie('resursoria_consent');
                if (consent !== 'accepted') {
                    e.preventDefault();
                    window.privacyManager?.showToast('Для отправки формы необходимо принять файлы cookie', 'warning');
                    return;
                }
                
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showFormErrors(form);
                } else {
                    // Перенаправляем в WhatsApp вместо AJAX отправки
                    e.preventDefault();
                    this.submitToWhatsApp(form);
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => {
                    this.clearError(input);
                    this.updateFieldStatus(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type || field.tagName.toLowerCase();
        const name = field.name || '';
        
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'Это поле обязательно для заполнения');
            return false;
        }

        if (type === 'email' && value && !this.isValidEmail(value)) {
            this.showError(field, 'Введите корректный email адрес');
            return false;
        }

        if ((type === 'tel' || name.includes('phone')) && value && !this.isValidPhone(value)) {
            this.showError(field, 'Введите корректный номер телефона');
            return false;
        }

        if ((name.includes('name') || name.includes('fio')) && value && !this.isValidName(value)) {
            this.showError(field, 'Введите корректное имя (только буквы и дефисы)');
            return false;
        }

        this.clearError(field);
        return true;
    }

    // Validation helpers
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
        const digits = phone.replace(/\D/g, '');
        return phoneRegex.test(phone) && digits.length === 11;
    }

    isValidName(name) {
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
        return nameRegex.test(name);
    }

    // Error handling
    showError(field, message) {
        this.clearError(field);
        
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        
        field.parentNode.appendChild(errorElement);
        
        if (!this.firstError) {
            this.firstError = field;
            setTimeout(() => {
                field.focus();
                this.firstError = null;
            }, 100);
        }
    }

    clearError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        
        const parent = field.parentNode;
        const errorElement = parent.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.remove();
        }
    }

    updateFieldStatus(field) {
        const value = field.value.trim();
        
        if (value) {
            field.classList.add('filled');
        } else {
            field.classList.remove('filled');
        }
    }

    showFormErrors(form) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            setTimeout(() => {
                firstError.focus();
            }, 500);
        }
    }

    // Phone Mask
    setupPhoneMask() {
        const phoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone"]');
        
        phoneInputs.forEach(input => {
            if (!input.placeholder) {
                input.placeholder = '+7 (___) ___-__-__';
            }
            
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length === 0) {
                    e.target.value = '';
                    return;
                }
                
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
                
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = formattedValue.length;
                }, 0);
            });

            input.addEventListener('blur', () => {
                if (input.value && input.value.replace(/\D/g, '').length < 10) {
                    input.value = '';
                }
            });
        });
    }

    // Отправка форм через WhatsApp
    setupWhatsAppForms() {
        // Находим все кнопки "Отправить через WhatsApp"
        const whatsappButtons = document.querySelectorAll('button[id*="whatsapp"], button[onclick*="whatsapp"]');
        
        whatsappButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const form = button.closest('form');
                if (form) {
                    e.preventDefault();
                    this.submitToWhatsApp(form);
                }
            });
        });
    }

    submitToWhatsApp(form) {
        if (!this.validateForm(form)) {
            this.showFormErrors(form);
            return;
        }
        
        // Получаем данные формы
        const formData = this.serializeForm(form);
        const message = this.formatWhatsAppMessage(formData, form);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/79581118514?text=${encodedMessage}`;
        
        // Показываем сообщение
        this.showSuccessMessage(form, '✅ Открываю WhatsApp для отправки сообщения...');
        
        // Открываем WhatsApp через 1 секунду
        setTimeout(() => {
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Сбрасываем форму через 2 секунды
            setTimeout(() => {
                this.resetForm(form);
                this.showSuccessMessage(form, '✅ Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
            }, 2000);
        }, 1000);
    }

    serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    formatWhatsAppMessage(formData, form) {
        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const formName = form.getAttribute('name') || form.id || 'contact_form';
        
        let message = `📋 Новая заявка с сайта resursoria.ru (перенесен на arenda-kovrov-mirum.ru)\n\n`;
        
        // Добавляем данные формы
        for (const [key, value] of Object.entries(formData)) {
            if (key === 'name' || key === 'fio') {
                message += `👤 Имя: ${value}\n`;
            } else if (key === 'phone' || key.includes('tel')) {
                message += `📞 Телефон: ${value}\n`;
            } else if (key === 'email') {
                message += `📧 Email: ${value}\n`;
            } else if (key === 'company') {
                message += `🏢 Компания: ${value}\n`;
            } else if (key === 'service') {
                const serviceNames = {
                    'outstaffing': 'Аутстаффинг персонала',
                    'rent': 'Аренда персонала',
                    'migrants': 'Легализация мигрантов',
                    'consulting': 'Кадровый консалтинг'
                };
                message += `📋 Услуга: ${serviceNames[value] || value}\n`;
            } else if (key === 'message') {
                message += `💬 Сообщение: ${value}\n`;
            }
        }
        
        message += `\n📄 Форма: ${formName}\n`;
        message += `🌐 Страница: ${pageTitle}\n`;
        message += `🔗 Ссылка: ${pageUrl}\n\n`;
        message += `Прошу связаться для консультации по услугам аутстаффинга.`;
        
        return message;
    }

    showSuccessMessage(form, message) {
        const oldMessages = form.querySelectorAll('.form-success, .form-error');
        oldMessages.forEach(msg => msg.remove());
        
        const successElement = document.createElement('div');
        successElement.className = 'form-success';
        successElement.textContent = message;
        successElement.setAttribute('role', 'alert');
        successElement.setAttribute('aria-live', 'polite');
        
        form.prepend(successElement);
        
        successElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        setTimeout(() => {
            successElement.style.opacity = '0';
            setTimeout(() => successElement.remove(), 300);
        }, 5000);
    }

    showErrorMessage(form, message) {
        const oldMessages = form.querySelectorAll('.form-success, .form-error');
        oldMessages.forEach(msg => msg.remove());
        
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'assertive');
        
        form.prepend(errorElement);
        
        errorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        setTimeout(() => {
            errorElement.style.opacity = '0';
            setTimeout(() => errorElement.remove(), 300);
        }, 5000);
    }

    // Форма Submission - для обратной совместимости
    setupFormSubmission() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            
            if (form.dataset.ajax === 'true' || form.classList.contains('ajax-form')) {
                e.preventDefault();
                this.submitFormAjax(form);
            }
        });
    }

    async submitFormAjax(form) {
        // Упрощенная версия для совместимости
        const formData = this.serializeForm(form);
        const message = this.formatWhatsAppMessage(formData, form);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/79581118514?text=${encodedMessage}`;
        
        this.showSuccessMessage(form, '✅ Отправляю данные в WhatsApp...');
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            setTimeout(() => {
                this.resetForm(form);
                this.showSuccessMessage(form, '✅ Данные отправлены! Мы свяжемся с вами.');
            }, 2000);
        }, 1000);
    }

    // Input Enhancements
    setupInputEnhancements() {
        document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
            const maxLength = parseInt(textarea.getAttribute('maxlength'));
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.textContent = `0/${maxLength}`;
            counter.style.cssText = `
                font-size: 0.8rem;
                color: #666;
                text-align: right;
                margin-top: 5px;
            `;
            
            textarea.parentNode.appendChild(counter);
            
            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                counter.textContent = `${length}/${maxLength}`;
                
                if (length > maxLength * 0.9) {
                    counter.style.color = '#f39c12';
                } else {
                    counter.style.color = '#666';
                }
            });
        });
    }

    // Public methods
    resetForm(form) {
        if (form) {
            form.reset();
            form.querySelectorAll('.error-message, .form-success, .form-error').forEach(el => {
                el.remove();
            });
            form.querySelectorAll('.error').forEach(el => {
                el.classList.remove('error');
            });
            
            const consentCheckbox = form.querySelector('.consent-checkbox input[type="checkbox"]');
            if (consentCheckbox) {
                consentCheckbox.checked = false;
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                }
            }
        }
    }

    validateFieldByName(form, fieldName) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            return this.validateField(field);
        }
        return false;
    }
}

// Form Utilities
class FormUtils {
    static serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
        return re.test(phone);
    }

    static formatPhone(phone) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
        }
        return phone;
    }

    static getFormDataAsJSON(form) {
        const data = this.serializeForm(form);
        return JSON.stringify(data, null, 2);
    }

    static formatForWhatsApp(formData) {
        let message = "📋 Новая заявка:\n\n";
        
        for (const [key, value] of Object.entries(formData)) {
            const label = this.getFieldLabel(key);
            message += `${label}: ${value}\n`;
        }
        
        message += "\nПрошу связаться для консультации.";
        return message;
    }

    static getFieldLabel(fieldName) {
        const labels = {
            'name': '👤 Имя',
            'fio': '👤 ФИО',
            'phone': '📞 Телефон',
            'email': '📧 Email',
            'company': '🏢 Компания',
            'service': '📋 Услуга',
            'message': '💬 Сообщение'
        };
        
        return labels[fieldName] || fieldName;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.formManager = new FormManager();
    window.formUtils = FormUtils;
    
    console.log('FormManager initialized - Все формы отправляются через WhatsApp');
});