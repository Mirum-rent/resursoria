/**
 * Form Manager for Resursoria website
 * Version: 2.12.2025
 * Features: Validation, phone masking, AJAX submission
 */

class FormManager {
    constructor() {
        this.forms = [];
        this.init();
    }

    init() {
        console.log('FormManager initialized');
        this.setupFormValidation();
        this.setupPhoneMask();
        this.setupFormSubmission();
        this.setupInputEnhancements();
    }

    // Form Validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            this.forms.push(form);
            
            // Add novalidate to use custom validation
            if (!form.hasAttribute('novalidate')) {
                form.setAttribute('novalidate', '');
            }
            
            // Проверяем согласие на обработку данных
            const consentCheckbox = form.querySelector('.consent-checkbox input[type="checkbox"]');
            if (consentCheckbox) {
                consentCheckbox.required = true;
                
                // Отключаем кнопку отправки если чекбокс не отмечен
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
                // Проверяем согласие на куки
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
                    this.handleFormSubmission(form, e);
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
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'Это поле обязательно для заполнения');
            return false;
        }

        // Email validation
        if (type === 'email' && value && !this.isValidEmail(value)) {
            this.showError(field, 'Введите корректный email адрес');
            return false;
        }

        // Phone validation
        if ((type === 'tel' || name.includes('phone')) && value && !this.isValidPhone(value)) {
            this.showError(field, 'Введите корректный номер телефона');
            return false;
        }

        // Name validation
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
        // Russian phone numbers: +7 (XXX) XXX-XX-XX or 8XXXXXXXXXX
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
        
        // Insert after field
        field.parentNode.appendChild(errorElement);
        
        // Focus first error
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
            // Set initial placeholder
            if (!input.placeholder) {
                input.placeholder = '+7 (___) ___-__-__';
            }
            
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                // If empty, set to +7 (
                if (value.length === 0) {
                    e.target.value = '';
                    return;
                }
                
                // Remove 7 or 8 at start
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
                
                // Move cursor to end
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = formattedValue.length;
                }, 0);
            });

            // Format on blur if incomplete
            input.addEventListener('blur', () => {
                if (input.value && input.value.replace(/\D/g, '').length < 10) {
                    input.value = '';
                }
            });
        });
    }

    // Form Submission
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
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.innerHTML : 'Отправить';

        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '⏳ Отправка...';
        }

        // Add tracking data
        formData.append('submission_time', new Date().toISOString());
        formData.append('page_url', window.location.href);
        formData.append('form_name', form.getAttribute('name') || form.id || 'contact_form');

        try {
            // Здесь будет реальный API call
            const response = await this.mockApiCall(formData);
            
            if (response.success) {
                this.showSuccessMessage(form, '✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
                form.reset();
                
                // Track conversion
                this.trackConversion(form, formData);
                
                // Сбрасываем чекбокс согласия
                const consentCheckbox = form.querySelector('.consent-checkbox input[type="checkbox"]');
                if (consentCheckbox) {
                    consentCheckbox.checked = false;
                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                }
            } else {
                this.showErrorMessage(form, 'Ошибка отправки. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(form, 'Ошибка соединения. Пожалуйста, проверьте интернет и попробуйте еще раз.');
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    }

    async mockApiCall(formData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Convert FormData to object for logging
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        console.log('Form data submitted:', data);
        
        // Simulate successful response
        return {
            success: true,
            message: 'Form submitted successfully',
            timestamp: new Date().toISOString()
        };
    }

    showSuccessMessage(form, message) {
        // Удаляем старые сообщения
        const oldMessages = form.querySelectorAll('.form-success, .form-error');
        oldMessages.forEach(msg => msg.remove());
        
        const successElement = document.createElement('div');
        successElement.className = 'form-success';
        successElement.textContent = message;
        successElement.setAttribute('role', 'alert');
        successElement.setAttribute('aria-live', 'polite');
        
        form.prepend(successElement);
        
        // Scroll to success message
        successElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Hide after 5 seconds
        setTimeout(() => {
            successElement.style.opacity = '0';
            setTimeout(() => successElement.remove(), 300);
        }, 5000);
    }

    showErrorMessage(form, message) {
        // Удаляем старые сообщения
        const oldMessages = form.querySelectorAll('.form-success, .form-error');
        oldMessages.forEach(msg => msg.remove());
        
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'assertive');
        
        form.prepend(errorElement);
        
        // Scroll to error
        errorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Remove after 5 seconds
        setTimeout(() => {
            errorElement.style.opacity = '0';
            setTimeout(() => errorElement.remove(), 300);
        }, 5000);
    }

    trackConversion(form, formData) {
        const formName = form.getAttribute('name') || form.id || 'contact_form';
        const formType = form.dataset.formType || 'general';
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'lead',
                'event_label': formName,
                'event_value': 1,
                'form_type': formType
            });
        }
        
        // Yandex Metrica
        if (typeof ym !== 'undefined') {
            ym('reachGoal', 'form_submit', {
                form: formName,
                type: formType
            });
        }
    }

    handleFormSubmission(form, e) {
        // Если форма не AJAX, просто трекаем
        const formName = form.getAttribute('name') || form.id || 'unknown_form';
        
        console.log('Form submitted (non-AJAX):', formName);
        
        // Track form submission
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'lead',
                'event_label': formName,
                'value': 1
            });
        }
        
        // Показываем сообщение об успехе перед переходом
        this.showSuccessMessage(form, '✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
    }

    // Input Enhancements
    setupInputEnhancements() {
        // Add character counters for textareas
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
                    counter.style.color = 'var(--accent-color)';
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
            
            // Сбрасываем чекбокс согласия
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
            // Handle multiple values for same key
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.formManager = new FormManager();
    window.formUtils = FormUtils;
    
    console.log('FormManager initialized');
});