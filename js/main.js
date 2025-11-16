// /js/main.js
// Управление куками и согласиями
class PrivacyManager {
    constructor() {
        this.cookieName = 'resursoria_consent';
        this.init();
    }

    init() {
        this.checkCookieConsent();
        this.setupEventListeners();
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
    }

    rejectCookies() {
        this.setCookie(this.cookieName, 'rejected', 30);
        this.hideCookieNotice();
        this.disableAnalytics();
    }

    hideCookieNotice() {
        const notice = document.getElementById('cookieNotice');
        if (notice) {
            notice.classList.remove('visible');
        }
    }

    enableAnalytics() {
        // Здесь будет код для включения аналитики
        console.log('Analytics enabled');
    }

    disableAnalytics() {
        // Здесь будет код для отключения аналитики
        console.log('Analytics disabled');
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
                alert('Пожалуйста, дайте согласие на обработку персональных данных');
                consentCheckbox.focus();
            }
        });
    }
}

// Управление навигацией и общими функциями
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollToTop();
        this.setupSmoothScroll();
        this.setupMobileMenu();
    }

    setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn?.classList.add('visible');
            } else {
                scrollBtn?.classList.remove('visible');
            }
        });

        scrollBtn?.addEventListener('click', () => {
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
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        // Будущая реализация мобильного меню
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new PrivacyManager();
    new NavigationManager();
});

// Отслеживание кликов по WhatsApp
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Проверяем согласие на обработку данных
            const consent = document.querySelector('.consent-checkbox input');
            if (consent && !consent.checked) {
                e.preventDefault();
                alert('Пожалуйста, дайте согласие на обработку персональных данных перед отправкой сообщения');
                return;
            }

            // Логируем событие для аналитики
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    'event_category': 'engagement',
                    'event_label': this.href
                });
            }
        });
    });
});