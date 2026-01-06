/**
 * Main JavaScript for Resursoria website
 * Version: 3.01.2026 - ОБНОВЛЕНО ДЛЯ ПЕРЕНОСА НА ОСНОВНОЙ САЙТ
 * Features: Cookie consent, WhatsApp консультации, доступность
 */

class PrivacyManager {
    constructor() {
        this.cookieName = 'resursoria_consent';
        this.cookieVersion = 'v3';
        this.cookieExpiryDays = 365;
        this.init();
    }

    init() {
        console.log('PrivacyManager initialized - Site migrated to arenda-kovrov-mirum.ru');
        this.setupEventListeners();
        this.checkCookieConsent();
        this.setupScrollToTop();
        this.setupSmoothScroll();
        this.setupWhatsAppTracking();
        this.setupAccessibility();
        this.setupForms();
        this.setupMigrationNotice();
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
            setTimeout(() => {
                notice.classList.add('visible');
                notice.setAttribute('aria-hidden', 'false');
                this.trapFocus(notice);
                document.body.classList.add('cookies-blocked');
            }, 1000);
        } else if (consent === 'accepted') {
            this.enableForms();
            document.body.classList.remove('cookies-blocked');
        } else if (consent === 'rejected') {
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
        this.enableForms();
        document.body.classList.remove('cookies-blocked');
        this.showToast('✅ Спасибо! Файлы cookie приняты. Теперь можете использовать все функции сайта.');
        
        // Включаем все элементы
        this.enableAllElements();
    }

    rejectCookies() {
        this.setCookie(this.cookieName, 'rejected', 30);
        this.hideCookieNotice();
        this.disableForms();
        document.body.classList.add('cookies-blocked');
        this.showToast('ℹ️ Файлы cookie отключены. Для консультации напишите в WhatsApp: +7 (958) 111-85-14', 'info');
    }

    enableAllElements() {
        const whatsappElements = document.querySelectorAll('[data-consent-required], .btn-whatsapp, .whatsapp-link');
        whatsappElements.forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            el.removeAttribute('aria-disabled');
        });
        
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            form.removeAttribute('aria-disabled');
        });
    }

    showToast(message, type = 'info') {
        const oldToasts = document.querySelectorAll('.toast');
        oldToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        const bgColor = type === 'success' ? '#16a085' : 
                        type === 'warning' ? '#f39c12' : '#1abc9c';
        
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 25px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
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

    // Analytics - УПРОЩЕНО (сайт не индексируется)
    enableAnalytics() {
        console.log('Site migrated to arenda-kovrov-mirum.ru - analytics simplified');
    }

    disableAnalytics() {
        console.log('Analytics disabled for migrated site');
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
        checkScroll();
        
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
                    
                    history.pushState(null, null, href);
                    
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

    // WhatsApp Tracking - ОБНОВЛЕНО ДЛЯ ПЕРЕНОСА САЙТА
    setupWhatsAppTracking() {
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('a[href*="wa.me"], .btn-whatsapp, .whatsapp-link');
            if (!whatsappLink) return;
            
            // Проверяем блокировку
            if (whatsappLink.style.pointerEvents === 'none' || 
                whatsappLink.getAttribute('aria-disabled') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                this.showToast('Для связи через WhatsApp необходимо принять файлы cookie', 'warning');
                return;
            }
            
            const consent = this.getCookie(this.cookieName);
            
            // Если нет согласия
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
            
            // Определяем контекст сообщения
            let message = this.getWhatsAppMessage(whatsappLink);
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/79581118514?text=${encodedMessage}`;
            
            // Открываем WhatsApp
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Логируем переход
            console.log('WhatsApp opened with message:', message);
        });
    }

    // Генерация сообщений для WhatsApp
    getWhatsAppMessage(whatsappLink) {
        const currentPage = window.location.pathname;
        let context = '';
        
        // Определяем контекст по странице
        if (currentPage.includes('/calculator')) {
            context = 'Консультация по расчету экономии на аутстаффинге';
        } else if (currentPage.includes('/services')) {
            const activeService = document.querySelector('.service-card:hover h2') || 
                                document.querySelector('.service-card:focus-within h2');
            context = activeService ? `Консультация по услуге: ${activeService.textContent}` : 
                                    'Консультация по услугам аутстаффинга';
        } else if (currentPage.includes('/contacts')) {
            context = 'Вопрос с страницы контактов';
        } else if (currentPage.includes('/blog')) {
            const articleTitle = document.querySelector('h1') || document.querySelector('h2');
            context = articleTitle ? `Вопрос по статье: ${articleTitle.textContent}` : 
                                   'Вопрос по материалам блога';
        } else {
            context = 'Консультация по аутстаффингу';
        }
        
        // Добавляем информацию о переносе сайта
        return `Здравствуйте! Пишу с сайта resursoria.ru (контент перенесен на основной сайт arenda-kovrov-mirum.ru)

${context}

Меня интересуют услуги аутстаффинга. Пожалуйста, предоставьте консультацию.`;
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

    // Информация о переносе сайта
    setupMigrationNotice() {
        // Добавляем динамическое уведомление о переносе
        const noticeExists = document.querySelector('.migration-notice');
        if (!noticeExists && !window.location.pathname.includes('/privacy')) {
            const migrationNotice = document.createElement('div');
            migrationNotice.className = 'migration-notice';
            migrationNotice.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="font-size: 1.2rem;">📢</span>
                    <strong>Контент перенесен на основной сайт</strong>
                </div>
                <p>Все услуги аутстаффинга теперь доступны на <a href="https://arenda-kovrov-mirum.ru/outstaffing.html" style="color: #16a085; font-weight: bold;">arenda-kovrov-mirum.ru</a></p>
            `;
            migrationNotice.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fef9e7;
                border-left: 5px solid #f39c12;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                z-index: 1003;
                max-width: 300px;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(migrationNotice);
            
            // Автоматически скрываем через 10 секунд
            setTimeout(() => {
                migrationNotice.style.opacity = '0';
                setTimeout(() => migrationNotice.remove(), 300);
            }, 10000);
        }
    }

    trapFocus(element) {
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
            
            setTimeout(() => {
                firstElement.focus();
            }, 50);
            
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
        this.setupMigrationLinks();
    }

    static setupPhoneLinks() {
        document.addEventListener('click', (e) => {
            const phoneLink = e.target.closest('a[href^="tel:"]');
            if (phoneLink) {
                const phoneNumber = phoneLink.href.replace('tel:', '');
                console.log('Phone call initiated:', phoneNumber);
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

    static setupMigrationLinks() {
        // Обновляем ссылки на основной сайт
        document.querySelectorAll('a[href*="arenda-kovrov-mirum.ru"]').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }

    static setupErrorHandling() {
        window.addEventListener('error', function(e) {
            console.error('Global error:', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error
            });
        });

        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Resursoria (migrated to arenda-kovrov-mirum.ru)');
    
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
setVH();