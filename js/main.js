/**
 * Main JavaScript for Resursoria website
 * Version: 2.12.2025
 * Features: Cookie consent, smooth scroll, WhatsApp tracking, accessibility
 */

class PrivacyManager {
    constructor() {
        this.cookieName = 'resursoria_consent';
        this.cookieVersion = 'v2';
        this.cookieExpiryDays = 365;
        this.init();
    }

    init() {
        console.log('PrivacyManager initialized');
        this.setupEventListeners();
        this.checkCookieConsent();
        this.setupScrollToTop();
        this.setupSmoothScroll();
        this.setupWhatsAppTracking();
        this.setupAccessibility();
        this.setupForms();
    }

    // Cookie Management
    getCookie(name) {
        try {
            const cookies = document.cookie.split('; ');
            const cookie = cookies.find(row => row.startsWith(name + '='));
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
        } catch (error) {
            console.error('Error reading cookie:', error);
            return null;
        }
    }

    setCookie(name, value, days) {
        try {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            const cookieValue = encodeURIComponent(value);
            const sameSite = 'SameSite=Lax';
            const path = 'path=/';
            
            document.cookie = `${name}=${cookieValue}; ${expires}; ${path}; ${sameSite}`;
            console.log(`Cookie set: ${name}=${value}`);
        } catch (error) {
            console.error('Error setting cookie:', error);
        }
    }

    deleteCookie(name) {
        try {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            console.log(`Cookie deleted: ${name}`);
        } catch (error) {
            console.error('Error deleting cookie:', error);
        }
    }

    checkCookieConsent() {
        const consent = this.getCookie(this.cookieName);
        const notice = document.getElementById('cookieNotice');
        
        if (consent === null && notice) {
            // Показываем уведомление с задержкой
            setTimeout(() => {
                notice.classList.add('visible');
                notice.setAttribute('aria-hidden', 'false');
                this.trapFocus(notice);
                
                // Блокируем элементы до согласия
                document.body.classList.add('cookies-blocked');
            }, 1000);
        } else if (consent === 'accepted') {
            this.enableAnalytics();
            this.enableForms();
            document.body.classList.remove('cookies-blocked');
        } else if (consent === 'rejected') {
            this.disableAnalytics();
            this.disableForms();
            document.body.classList.add('cookies-blocked');
        }
    }

    hideCookieNotice() {
        const notice = document.getElementById('cookieNotice');
        if (notice) {
            notice.classList.remove('visible');
            notice.setAttribute('aria-hidden', 'true');
        }
    }

    acceptCookies() {
        this.setCookie(this.cookieName, 'accepted', this.cookieExpiryDays);
        this.hideCookieNotice();
        this.enableAnalytics();
        this.enableForms();
        document.body.classList.remove('cookies-blocked');
        this.showToast('Спасибо! Настройки сохранены.', 'success');
        
        // Включаем все элементы
        this.enableAllElements();
    }

    rejectCookies() {
        this.setCookie(this.cookieName, 'rejected', 30);
        this.hideCookieNotice();
        this.disableAnalytics();
        this.disableForms();
        document.body.classList.add('cookies-blocked');
        this.showToast('Файлы cookie отключены. Некоторые функции могут быть недоступны.', 'info');
    }

    enableAllElements() {
        // Включаем все кнопки WhatsApp
        const whatsappElements = document.querySelectorAll('[data-consent-required], .btn-whatsapp, .whatsapp-link');
        whatsappElements.forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            el.removeAttribute('aria-disabled');
        });
        
        // Включаем формы
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            form.removeAttribute('aria-disabled');
        });
    }

    showToast(message, type = 'info') {
        // Удаляем старые тосты
        const oldToasts = document.querySelectorAll('.toast');
        oldToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        // Стили для тоста
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 25px;
            background: ${type === 'success' ? 'var(--success-color)' : 
                         type === 'warning' ? 'var(--warning-color)' : 
                         'var(--secondary-color)'};
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            z-index: 1002;
            transform: translateY(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            max-width: 350px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(100%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Analytics
    enableAnalytics() {
        console.log('Analytics enabled');
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted'
            });
        }
        
        // Yandex Metrica
        if (typeof ym !== 'undefined') {
            ym('setUserProperties', { cookie_consent: 'accepted' });
        }
    }

    disableAnalytics() {
        console.log('Analytics disabled');
        
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
            });
        }
        
        // Удаляем cookies аналитики
        this.deleteCookie('_ga');
        this.deleteCookie('_gid');
        this.deleteCookie('_ym_uid');
    }

    // Forms Management
    enableForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            form.removeAttribute('aria-disabled');
        });
    }

    disableForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '0.5';
            form.style.pointerEvents = 'none';
            form.setAttribute('aria-disabled', 'true');
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Cookie buttons
        const acceptBtn = document.getElementById('cookieAccept');
        const rejectBtn = document.getElementById('cookieReject');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptCookies());
            acceptBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.acceptCookies();
                }
            });
        }
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.rejectCookies());
            rejectBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.rejectCookies();
                }
            });
        }

        // Cookie notice close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const notice = document.getElementById('cookieNotice');
                if (notice && notice.classList.contains('visible')) {
                    this.rejectCookies();
                }
            }
        });
    }

    // Scroll to Top
    setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        if (!scrollBtn) return;
        
        const checkScroll = () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
                scrollBtn.setAttribute('aria-hidden', 'false');
            } else {
                scrollBtn.classList.remove('visible');
                scrollBtn.setAttribute('aria-hidden', 'true');
            }
        };
        
        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll(); // Initial check
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            scrollBtn.blur();
        });
        
        scrollBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollBtn.click();
            }
        });
    }

    // Smooth Scroll
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            // Skip if anchor has specific classes or attributes
            if (anchor.classList.contains('no-smooth-scroll') || 
                anchor.getAttribute('data-no-smooth')) {
                return;
            }
            
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const header = document.querySelector('.main-header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                    
                    // Focus target for accessibility
                    setTimeout(() => {
                        if (!target.hasAttribute('tabindex')) {
                            target.setAttribute('tabindex', '-1');
                        }
                        target.focus();
                    }, 500);
                }
            });
        });
    }

    // WhatsApp Tracking
    setupWhatsAppTracking() {
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('a[href*="wa.me"], .btn-whatsapp, .whatsapp-link');
            if (!whatsappLink) return;
            
            // Проверяем, заблокирован ли элемент
            if (whatsappLink.style.pointerEvents === 'none' || 
                whatsappLink.getAttribute('aria-disabled') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            const consent = this.getCookie(this.cookieName);
            
            // Если нет согласия, показываем уведомление и блокируем
            if (consent !== 'accepted') {
                e.preventDefault();
                e.stopPropagation();
                
                if (consent === null) {
                    const notice = document.getElementById('cookieNotice');
                    if (notice) {
                        notice.classList.add('visible');
                        notice.setAttribute('aria-hidden', 'false');
                        this.trapFocus(notice);
                    }
                } else {
                    this.showToast('Для перехода в WhatsApp необходимо принять файлы cookie', 'warning');
                }
                return;
            }
            
            // Трекинг клика если согласие дано
            const href = whatsappLink.href;
            const linkText = whatsappLink.textContent.trim() || 'WhatsApp link';
            const pageLocation = window.location.pathname;
            
            // Добавляем параметры для трекинга
            const trackingParams = new URLSearchParams({
                source: 'website',
                page: pageLocation,
                medium: 'whatsapp_button',
                campaign: 'organic',
                content: linkText
            });
            
            const whatsappUrl = new URL(href);
            whatsappUrl.searchParams.set('text', 
                `Здравствуйте! Пишу с сайта resursoria.ru\nСтраница: ${pageLocation}\n\nМеня интересуют услуги аутстаффинга. Пожалуйста, предоставьте консультацию.`
            );
            
            // Открываем WhatsApp
            window.open(whatsappUrl.toString(), '_blank', 'noopener,noreferrer');
            
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    'event_category': 'engagement',
                    'event_label': `${pageLocation} - ${linkText}`,
                    'value': 1
                });
            }
            
            // Yandex Metrica
            if (typeof ym !== 'undefined') {
                ym('reachGoal', 'whatsapp_click', {
                    page: pageLocation,
                    link: linkText
                });
            }
        });
    }

    // Accessibility
    setupAccessibility() {
        // Skip to main content
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-main';
        skipLink.textContent = 'Перейти к основному содержанию';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content id if not exists
        const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.querySelector('.container');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    setupForms() {
        // Обработка чекбоксов согласия
        document.querySelectorAll('.consent-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const form = checkbox.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = !e.target.checked;
                    }
                }
            });
        });
    }

    trapFocus(element) {
        // Simple focus trap for modal-like elements
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            const keydownHandler = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };
            
            element.addEventListener('keydown', keydownHandler);
            
            // Focus first element
            setTimeout(() => {
                firstElement.focus();
            }, 50);
            
            // Cleanup
            element._keydownHandler = keydownHandler;
        }
    }

    removeFocusTrap(element) {
        if (element._keydownHandler) {
            element.removeEventListener('keydown', element._keydownHandler);
            delete element._keydownHandler;
        }
    }
}

// Additional Utilities
class SiteUtils {
    static init() {
        this.setupPhoneLinks();
        this.setupExternalLinks();
        this.setupCurrentYear();
        this.setupErrorHandling();
        this.setupActiveNav();
    }

    static setupPhoneLinks() {
        document.addEventListener('click', (e) => {
            const phoneLink = e.target.closest('a[href^="tel:"]');
            if (phoneLink) {
                const phoneNumber = phoneLink.href.replace('tel:', '');
                
                // Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'phone_click', {
                        'event_category': 'engagement',
                        'event_label': phoneNumber,
                        'value': 1
                    });
                }
                
                // Yandex Metrica
                if (typeof ym !== 'undefined') {
                    ym('reachGoal', 'phone_call', {
                        number: phoneNumber
                    });
                }
                
                console.log('Phone call tracked:', phoneNumber);
            }
        });
    }

    static setupExternalLinks() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (link.hostname !== window.location.hostname && 
                !link.href.includes('wa.me') && 
                !link.href.includes('avito.ru')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                link.setAttribute('aria-label', `${link.textContent} (откроется в новом окне)`);
            }
        });
    }

    static setupCurrentYear() {
        const yearElements = document.querySelectorAll('.current-year');
        if (yearElements.length > 0) {
            const currentYear = new Date().getFullYear();
            yearElements.forEach(el => {
                el.textContent = currentYear;
            });
        }
    }

    static setupActiveNav() {
        // Устанавливаем активный пункт меню на основе текущей страницы
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath || 
                (currentPath.includes(linkPath) && linkPath !== '/')) {
                link.classList.add('active');
            }
        });
    }

    static setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', function(e) {
            console.error('Global error:', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Resursoria');
    
    // Initialize managers
    window.privacyManager = new PrivacyManager();
    SiteUtils.init();
    
    // Dispatch custom event for other scripts
    document.dispatchEvent(new CustomEvent('resursoria:ready'));
    
    // Убираем preloader если есть
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 300);
        }, 500);
    }
});

// Handle browser back/forward with smooth scroll
window.addEventListener('popstate', function() {
    const hash = window.location.hash;
    if (hash) {
        const element = document.querySelector(hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Viewport units fix for mobile
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
setVH(); // Initial call