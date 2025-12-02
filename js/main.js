[file name]: /js/main.js
[file content begin]
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
        this.checkCookieConsent();
        this.setupEventListeners();
        this.setupScrollToTop();
        this.setupSmoothScroll();
        this.setupWhatsAppTracking();
        this.setupMobileMenu();
        this.setupLazyLoading();
        this.setupAccessibility();
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
        if (consent === null) {
            setTimeout(() => this.showCookieNotice(), 1000);
        } else if (consent === 'accepted') {
            this.enableAnalytics();
            this.enableForms();
        } else if (consent === 'rejected') {
            this.disableAnalytics();
            this.disableForms();
        }
    }

    showCookieNotice() {
        const notice = document.getElementById('cookieNotice');
        if (notice) {
            notice.classList.add('visible');
            notice.setAttribute('aria-hidden', 'false');
            this.trapFocus(notice);
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
        this.showToast('Спасибо! Настройки сохранены.', 'success');
    }

    rejectCookies() {
        this.setCookie(this.cookieName, 'rejected', 30);
        this.hideCookieNotice();
        this.disableAnalytics();
        this.disableForms();
        this.showToast('Настройки сохранены. Файлы cookie отключены.', 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
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
        
        // Send pageview if analytics were blocked
        this.sendDelayedPageview();
    }

    disableAnalytics() {
        console.log('Analytics disabled');
        
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
            });
        }
        
        this.deleteCookie('_ga');
        this.deleteCookie('_gid');
        this.deleteCookie('_ym_uid');
    }

    sendDelayedPageview() {
        if (typeof gtag !== 'undefined') {
            setTimeout(() => {
                gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname
                });
            }, 100);
        }
    }

    // Forms Management
    enableForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            form.removeAttribute('aria-disabled');
        });
        
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
            link.removeAttribute('aria-disabled');
        });
    }

    disableForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.opacity = '0.5';
            form.style.pointerEvents = 'none';
            form.setAttribute('aria-disabled', 'true');
        });
        
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            link.setAttribute('aria-disabled', 'true');
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

        // Form consent validation
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const consentCheckbox = form.querySelector('.consent-checkbox input[type="checkbox"]');
            
            if (consentCheckbox && !consentCheckbox.checked) {
                e.preventDefault();
                this.showConsentError(consentCheckbox);
                
                // Scroll to checkbox
                consentCheckbox.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Focus checkbox
                setTimeout(() => {
                    consentCheckbox.focus();
                }, 500);
            }
        });

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

    showConsentError(checkbox) {
        let errorElement = checkbox.parentNode.querySelector('.consent-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'consent-error';
            errorElement.style.cssText = `
                color: var(--accent-color);
                font-size: 0.9rem;
                margin-top: 8px;
                padding: 8px 12px;
                background: rgba(230, 57, 70, 0.1);
                border-radius: var(--border-radius);
                border-left: 3px solid var(--accent-color);
            `;
            errorElement.textContent = 'Необходимо дать согласие на обработку персональных данных';
            errorElement.setAttribute('role', 'alert');
            checkbox.parentNode.appendChild(errorElement);
        }
        
        setTimeout(() => {
            if (errorElement && errorElement.parentNode) {
                errorElement.classList.add('fade-out');
                setTimeout(() => {
                    if (errorElement.parentNode) {
                        errorElement.parentNode.removeChild(errorElement);
                    }
                }, 300);
            }
        }, 5000);
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
            const whatsappLink = e.target.closest('a[href*="wa.me"]');
            if (!whatsappLink) return;
            
            const consent = this.getCookie(this.cookieName);
            
            // If no consent, show notice and prevent click
            if (consent !== 'accepted') {
                e.preventDefault();
                e.stopPropagation();
                
                if (consent === null) {
                    this.showCookieNotice();
                } else {
                    this.showToast('Для перехода в WhatsApp необходимо принять файлы cookie', 'warning');
                }
                return;
            }
            
            // Track click if consent given
            const href = whatsappLink.href;
            const linkText = whatsappLink.textContent.trim() || 'WhatsApp link';
            const pageLocation = window.location.pathname;
            
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    'event_category': 'engagement',
                    'event_label': `${pageLocation} - ${linkText}`,
                    'event_callback': () => {
                        // Open WhatsApp after tracking
                        setTimeout(() => {
                            window.open(href, '_blank', 'noopener,noreferrer');
                        }, 100);
                    }
                });
            } else {
                // If no GA, open directly with safety delay
                setTimeout(() => {
                    window.open(href, '_blank', 'noopener,noreferrer');
                }, 50);
            }
            
            // Yandex Metrica
            if (typeof ym !== 'undefined') {
                ym('reachGoal', 'whatsapp_click', {
                    page: pageLocation,
                    link: linkText
                });
            }
            
            // Prevent default if we're handling the click
            if (typeof gtag !== 'undefined') {
                e.preventDefault();
            }
        });
    }

    // Mobile Menu (placeholder for future implementation)
    setupMobileMenu() {
        // This will be implemented when mobile menu is added to HTML
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            console.log('Mobile menu toggle found - setup here');
        }
    }

    // Lazy Loading
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                        img.removeAttribute('data-srcset');
                        
                        // Dispatch load event
                        img.dispatchEvent(new Event('load'));
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                img.classList.add('loaded');
            });
        }
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
        const mainContent = document.querySelector('main') || document.querySelector('.main-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
        
        // Trap focus in cookie notice
        this.setupFocusTrap();
    }

    setupFocusTrap() {
        // Will be implemented when needed
    }

    trapFocus(element) {
        // Simple focus trap for modal-like elements
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            element.addEventListener('keydown', (e) => {
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
            });
            
            // Focus first element
            setTimeout(() => {
                firstElement.focus();
            }, 50);
        }
    }
}

// Additional Utilities
class SiteUtils {
    static init() {
        this.setupPhoneLinks();
        this.setupExternalLinks();
        this.setupCurrentYear();
        this.setupFormEnhancements();
        this.setupErrorHandling();
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

    static setupFormEnhancements() {
        // Add loading states to forms
        document.querySelectorAll('form').forEach(form => {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                form.addEventListener('submit', () => {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="spinner"></span> Отправка...';
                });
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
            
            // Don't show to user, just log
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }
}

// Performance Monitoring
class PerformanceMonitor {
    static init() {
        if ('performance' in window) {
            // Log page load performance
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('Performance metrics:', {
                            'DNS lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                            'TCP connect': perfData.connectEnd - perfData.connectStart,
                            'TTFB': perfData.responseStart - perfData.requestStart,
                            'DOM load': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                            'Page load': perfData.loadEventEnd - perfData.loadEventStart,
                            'Total time': perfData.duration
                        });
                    }
                }, 0);
            });
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Resursoria');
    
    // Initialize managers
    new PrivacyManager();
    SiteUtils.init();
    PerformanceMonitor.init();
    
    // Add CSS for dynamic elements
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        /* Toast notifications */
        .toast {
            position: fixed;
            bottom: 100px;
            right: 25px;
            background: var(--dark-color);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            z-index: 1002;
            transform: translateY(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            max-width: 350px;
        }
        
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast-success {
            background: var(--success-color);
        }
        
        .toast-warning {
            background: var(--warning-color);
        }
        
        .toast-info {
            background: var(--secondary-color);
        }
        
        /* Loading spinner */
        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Lazy loading */
        img.lazy {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        img.lazy.loaded {
            opacity: 1;
        }
        
        /* Fade animations */
        .fade-out {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        /* Print styles enhancement */
        @media print {
            .no-print {
                display: none !important;
            }
            
            a[href]:after {
                content: " (" attr(href) ")";
                font-size: 0.9em;
                font-weight: normal;
            }
            
            .btn, .whatsapp-float, .scroll-to-top {
                display: none !important;
            }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            .spinner {
                animation: none;
                border: none;
                background: white;
            }
        }
    `;
    document.head.appendChild(dynamicStyles);
    
    // Dispatch custom event for other scripts
    document.dispatchEvent(new CustomEvent('resursoria:ready'));
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

// Service Worker Registration (Progressive Web App)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Offline detection
window.addEventListener('online', function() {
    console.log('App is online');
    document.documentElement.classList.remove('offline');
});

window.addEventListener('offline', function() {
    console.log('App is offline');
    document.documentElement.classList.add('offline');
});

// Viewport units fix for mobile
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
setVH(); // Initial call
[file content end]