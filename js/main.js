// /js/main.js
class PrivacyManager {
    constructor() {
        this.cookieName = 'resursoria_consent';
        this.init();
    }

    init() {
        this.checkCookieConsent();
        this.setupEventListeners();
        this.setupScrollToTop();
        this.setupSmoothScroll();
        this.setupWhatsAppTracking();
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    }

    checkCookieConsent() {
        const consent = this.getCookie(this.cookieName);
        if (!consent) {
            this.showCookieNotice();
        }
    }

    showCookieNotice() {
        const notice = document.getElementById('cookieNotice');
        if (notice) {
            setTimeout(() => {
                notice.classList.add('visible');
            }, 1000);
        }
    }

    acceptCookies() {
        this.setCookie(this.cookieName, 'accepted', 365);
        this.hideCookieNotice();
        this.enableAnalytics();
        this.enableForms();
    }

    rejectCookies() {
        this.setCookie(this.cookieName, 'rejected', 30);
        this.hideCookieNotice();
        this.disableAnalytics();
        this.disableForms();
    }

    hideCookieNotice() {
        const notice = document.getElementById('cookieNotice');
        if (notice) {
            notice.classList.remove('visible');
        }
    }

    enableAnalytics() {
        // Включение аналитики после согласия
        console.log('Analytics enabled - user accepted cookies');
        
        // Здесь будет код для включения Google Analytics, Яндекс.Метрики и т.д.
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    disableAnalytics() {
        // Отключение аналитики
        console.log('Analytics disabled - user rejected cookies');
        
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    }

    enableForms() {
        // Активация форм после согласия
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
        });
        
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });
    }

    disableForms() {
        // Блокировка форм при отказе
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '0.5';
            form.style.pointerEvents = 'none';
        });
        
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
        });
    }

    setupEventListeners() {
        // Обработчики для кнопок куки
        const acceptBtn = document.getElementById('cookieAccept');
        const rejectBtn = document.getElementById('cookieReject');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptCookies());
        }
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.rejectCookies());
        }

        // Обработчик для форм с согласием
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const consentCheckbox = form.querySelector('.consent-checkbox input');
            
            if (consentCheckbox && !consentCheckbox.checked) {
                e.preventDefault();
                this.showConsentError(consentCheckbox);
            }
        });

        // Проверка согласия при клике на WhatsApp
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('a[href*="wa.me"]');
            if (whatsappLink) {
                const consent = this.getCookie(this.cookieName);
                if (!consent) {
                    e.preventDefault();
                    this.showCookieNotice();
                }
            }
        });
    }

    showConsentError(checkbox) {
        // Показываем ошибку, если согласие не дано
        let errorElement = checkbox.parentNode.querySelector('.consent-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'consent-error';
            errorElement.style.cssText = `
                color: var(--accent-color);
                font-size: 0.8rem;
                margin-top: 5px;
            `;
            errorElement.textContent = 'Необходимо дать согласие на обработку персональных данных';
            checkbox.parentNode.appendChild(errorElement);
        }
        
        // Удаляем ошибку через 5 секунд
        setTimeout(() => {
            if (errorElement && errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 5000);
    }

    setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        
        if (!scrollBtn) return;
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupWhatsAppTracking() {
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
                link.addEventListener('click', function(e) {
                    // Проверяем согласие на обработку данных
                    const consent = document.cookie.includes('resursoria_consent=accepted');
                    if (!consent) {
                        e.preventDefault();
                        return;
                    }

                    // Логируем событие для аналитики
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'whatsapp_click', {
                            'event_category': 'engagement',
                            'event_label': this.href,
                            'transport_type': 'beacon'
                        });
                    }

                    // Яндекс.Метрика
                    if (typeof ym !== 'undefined') {
                        ym('reachGoal', 'whatsapp_click');
                    }

                    console.log('WhatsApp click tracked:', this.href);
                });
            });
        });
    }
}

// Дополнительные утилиты
class SiteUtils {
    static init() {
        this.setupPhoneLinks();
        this.setupExternalLinks();
        this.setupLazyLoading();
    }

    static setupPhoneLinks() {
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                link.addEventListener('click', function(e) {
                    // Логирование звонков
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'phone_click', {
                            'event_category': 'engagement',
                            'event_label': this.href
                        });
                    }
                });
            });
        });
    }

    static setupExternalLinks() {
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a[href^="http"]').forEach(link => {
                if (link.hostname !== window.location.hostname) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                }
            });
        });
    }

    static setupLazyLoading() {
        // Ленивая загрузка изображений
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new PrivacyManager();
    SiteUtils.init();
    
    // Добавляем стили для ленивой загрузки
    const style = document.createElement('style');
    style.textContent = `
        img.lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        img.lazy.loaded {
            opacity: 1;
        }
        .consent-error {
            color: var(--accent-color) !important;
            font-size: 0.8rem !important;
            margin-top: 5px !important;
        }
    `;
    document.head.appendChild(style);
});

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Site error:', e.error);
});

// Сохранение позиции скролла при переходе между страницами
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// PWA функциональность
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}