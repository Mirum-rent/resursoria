[file name]: /js/forms.js
[file content begin]
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
            
            form.addEventListener('submit', (e) => {
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
                
                // Add focus styling
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    input.parentElement.classList.remove('focused');
                });
            });
            
            // Add loading indicator
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.querySelector('.spinner')) {
                const spinner = document.createElement('span');
                spinner.className = 'spinner';
                spinner.style.display = 'none';
                submitBtn.prepend(spinner);
            }
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

        // Consent checkbox validation
        const consentCheckbox = form.querySelector('.consent-checkbox input[type="checkbox"]');
        if (consentCheckbox && !consentCheckbox.checked) {
            this.showError(consentCheckbox, 'Необходимо дать согласие на обработку персональных данных');
            isValid = false;
        }

        // Custom validation for specific forms
        if (form.id === 'calculator-form') {
            isValid = this.validateCalculatorForm(form) && isValid;
        }

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

        // Number validation
        if (type === 'number' && field.hasAttribute('min') && field.hasAttribute('max')) {
            const min = parseFloat(field.getAttribute('min'));
            const max = parseFloat(field.getAttribute('max'));
            const numValue = parseFloat(value);
            
            if (value && (numValue < min || numValue > max)) {
                this.showError(field, `Введите число от ${min} до ${max}`);
                return false;
            }
        }

        // Select validation
        if (type === 'select-one' && field.hasAttribute('required') && value === '') {
            this.showError(field, 'Пожалуйста, выберите вариант');
            return false;
        }

        this.clearError(field);
        return true;
    }

    validateCalculatorForm(form) {
        let isValid = true;
        
        // Check employee count
        const employeeCount = form.querySelector('[name="employee_count"]');
        if (employeeCount && employeeCount.value) {
            const count = parseInt(employeeCount.value);
            if (count < 1) {
                this.showError(employeeCount, 'Количество сотрудников должно быть не менее 1');
                isValid = false;
            }
            if (count > 1000) {
                this.showError(employeeCount, 'Для количества сотрудников более 1000 свяжитесь с нами напрямую');
                isValid = false;
            }
        }
        
        // Check average salary
        const avgSalary = form.querySelector('[name="average_salary"]');
        if (avgSalary && avgSalary.value) {
            const salary = parseFloat(avgSalary.value);
            if (salary < 15000) {
                this.showError(avgSalary, 'Средняя зарплата должна быть не менее 15,000 ₽');
                isValid = false;
            }
        }
        
        return isValid;
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
        
        // Insert after field or in parent
        const parent = field.parentElement;
        if (parent.classList.contains('form-group') || parent.classList.contains('input-group')) {
            parent.appendChild(errorElement);
        } else {
            field.after(errorElement);
        }
        
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
        
        const parent = field.parentElement;
        const errorElement = parent.querySelector('.error-message') || field.nextElementSibling;
        
        if (errorElement && errorElement.classList.contains('error-message')) {
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
                    e.target.value = '+7 (';
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

            // Handle backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    const cursorPosition = input.selectionStart;
                    if (cursorPosition <= 4) { // Before first digit
                        e.preventDefault();
                    } else if (input.value[cursorPosition - 1] === '-' || 
                               input.value[cursorPosition - 1] === ')' ||
                               input.value[cursorPosition - 1] === '(' ||
                               input.value[cursorPosition - 1] === ' ') {
                        // Skip formatting characters
                        e.preventDefault();
                        input.selectionStart = input.selectionEnd = cursorPosition - 1;
                    }
                }
            });
            
            // Format on blur if incomplete
            input.addEventListener('blur', () => {
                if (input.value && input.value.length < 6) {
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
        const spinner = submitButton ? submitButton.querySelector('.spinner') : null;

        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> Отправка...';
            if (spinner) spinner.style.display = 'inline-block';
        }

        // Add timestamp
        formData.append('submission_time', new Date().toISOString());
        formData.append('page_url', window.location.href);
        formData.append('user_agent', navigator.userAgent);

        try {
            // Simulate API call - replace with actual endpoint
            const response = await this.mockApiCall(formData);
            
            if (response.success) {
                this.showSuccessMessage(form, '✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
                form.reset();
                
                // Track conversion
                this.trackConversion(form, formData);
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
                if (spinner) spinner.style.display = 'none';
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
        let successElement = form.querySelector('.form-success');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'form-success';
            form.prepend(successElement);
        }
        
        successElement.textContent = message;
        successElement.setAttribute('role', 'alert');
        successElement.setAttribute('aria-live', 'polite');
        
        // Scroll to success message
        successElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Hide after 5 seconds
        setTimeout(() => {
            successElement.classList.add('fade-out');
            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
            }, 300);
        }, 5000);
    }

    showErrorMessage(form, message) {
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
            errorElement.classList.add('fade-out');
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
            }, 300);
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
            
            gtag('event', 'conversion', {
                'send_to': 'AW-123456789/AbC-D_EFgH12IjKlMnOpQ', // Replace with actual ID
                'value': 1.0,
                'currency': 'RUB'
            });
        }
        
        // Yandex Metrica
        if (typeof ym !== 'undefined') {
            ym('reachGoal', 'form_submit', {
                form: formName,
                type: formType
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead');
        }
    }

    handleFormSubmission(form, e) {
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
    }

    // Input Enhancements
    setupInputEnhancements() {
        // Add floating labels
        document.querySelectorAll('.form-group, .input-group').forEach(group => {
            const input = group.querySelector('input, select, textarea');
            const label = group.querySelector('label');
            
            if (input && label) {
                // Check if already has value
                if (input.value) {
                    group.classList.add('has-value');
                }
                
                input.addEventListener('input', () => {
                    if (input.value) {
                        group.classList.add('has-value');
                    } else {
                        group.classList.remove('has-value');
                    }
                });
                
                input.addEventListener('focus', () => {
                    group.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    group.classList.remove('focused');
                });
            }
        });
        
        // Character counters for textareas
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
    
    // Add form-related CSS
    const formStyles = document.createElement('style');
    formStyles.textContent = `
        /* Form enhancements */
        .form-group,
        .input-group {
            position: relative;
            margin-bottom: 20px;
        }
        
        .form-group.focused label,
        .input-group.focused label {
            color: var(--secondary-color);
        }
        
        .form-group.has-value label,
        .input-group.has-value label {
            transform: translateY(-20px) scale(0.9);
        }
        
        /* Character counter */
        .char-counter {
            font-size: 0.8rem;
            color: #666;
            text-align: right;
            margin-top: 5px;
            transition: color 0.3s ease;
        }
        
        /* Form messages */
        .form-error {
            background: rgba(230, 57, 70, 0.1);
            color: var(--accent-color);
            padding: 12px 15px;
            border-radius: var(--border-radius);
            margin: 15px 0;
            border-left: 3px solid var(--accent-color);
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Input states */
        input.filled,
        select.filled,
        textarea.filled {
            border-color: var(--success-color);
        }
        
        /* Calculator form specific */
        #calculator-form .form-group {
            background: #f8f9fa;
            padding: 15px;
            border-radius: var(--border-radius);
        }
        
        #calculator-form .result {
            background: linear-gradient(135deg, var(--success-color), #2a9d8f);
            color: white;
            padding: 20px;
            border-radius: var(--border-radius);
            text-align: center;
            margin-top: 20px;
            font-size: 1.2rem;
            font-weight: bold;
        }
    `;
    document.head.appendChild(formStyles);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FormManager, FormUtils };
}
[file content end]