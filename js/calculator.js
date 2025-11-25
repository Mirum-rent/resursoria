// /js/calculator.js
class TaxCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.calculate(); // Первоначальный расчет
        this.setupComparisonChart();
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('#calculator input[type="number"], #calculator select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
            input.addEventListener('change', () => this.calculate());
        });

        // Кнопки быстрого выбора
        const quickButtons = document.querySelectorAll('.quick-select');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const employees = btn.dataset.employees;
                document.getElementById('employees').value = employees;
                this.calculate();
            });
        });
    }

    calculate() {
        const salary = parseFloat(document.getElementById('salary').value) || 0;
        const employees = parseInt(document.getElementById('employees').value) || 1;
        const region = document.getElementById('region') ? document.getElementById('region').value : 'moscow';
        
        const results = {
            staff: this.calculateStaff(salary, employees, region),
            gph: this.calculateGPH(salary, employees, region),
            selfemployed: this.calculateSelfEmployed(salary, employees, region),
            outstaffing: this.calculateOutstaffing(salary, employees, region)
        };

        this.displayResults(results);
        this.updateComparisonChart(results);
        this.updateSavingSummary(results);
    }

    calculateStaff(salary, employees, region) {
        const totalSalary = salary * employees;
        
        // НДФЛ 13%
        const ndfl = totalSalary * 0.13;
        
        // Страховые взносы 30%
        const insurance = totalSalary * 0.30;
        
        // Налог на прибыль (условно 20% от ФОТ)
        const profitTax = totalSalary * 0.20;
        
        const totalTax = ndfl + insurance + profitTax;
        const totalCost = totalSalary + totalTax;
        
        return {
            total: totalCost,
            tax: totalTax,
            net: totalSalary,
            breakdown: {
                ndfl,
                insurance,
                profitTax
            },
            percentage: 43
        };
    }

    calculateGPH(salary, employees, region) {
        const totalSalary = salary * employees;
        
        // НДФЛ 13%
        const ndfl = totalSalary * 0.13;
        
        // Взносы по ГПХ (упрощенные)
        const insurance = totalSalary * 0.10;
        
        const totalTax = ndfl + insurance;
        const totalCost = totalSalary + totalTax;
        
        return {
            total: totalCost,
            tax: totalTax,
            net: totalSalary,
            breakdown: {
                ndfl,
                insurance
            },
            percentage: 23
        };
    }

    calculateSelfEmployed(salary, employees, region) {
        const totalSalary = salary * employees;
        
        // Налог для самозанятых 6%
        const tax = totalSalary * 0.06;
        
        // Комиссия платформы 2%
        const serviceFee = totalSalary * 0.02;
        
        const totalTax = tax + serviceFee;
        const totalCost = totalSalary + totalTax;
        
        return {
            total: totalCost,
            tax: totalTax,
            net: totalSalary,
            breakdown: {
                tax,
                serviceFee
            },
            percentage: 8
        };
    }

    calculateOutstaffing(salary, employees, region) {
        const totalSalary = salary * employees;
        
        // Наша эффективная налоговая ставка 9%
        const ourTax = totalSalary * 0.09;
        
        // Наша комиссия за услуги 3%
        const serviceFee = totalSalary * 0.03;
        
        const totalTax = ourTax + serviceFee;
        const totalCost = totalSalary + totalTax;
        
        return {
            total: totalCost,
            tax: totalTax,
            net: totalSalary,
            breakdown: {
                ourTax,
                serviceFee
            },
            percentage: 12
        };
    }

    displayResults(results) {
        // Обновляем все блоки с результатами
        Object.keys(results).forEach(type => {
            const result = results[type];
            const element = document.getElementById(`result-${type}`);
            
            if (element) {
                element.innerHTML = this.createResultHTML(type, result);
            }
        });

        // Показываем сравнение
        this.showComparison(results.outstaffing, results.selfemployed);
    }

    createResultHTML(type, result) {
        const titles = {
            staff: 'Штатные сотрудники',
            gph: 'Договоры ГПХ',
            selfemployed: 'Самозанятые',
            outstaffing: 'Наш аутстаффинг'
        };

        const isBest = type === 'outstaffing';
        const bestClass = isBest ? 'best-option' : '';

        return `
            <div class="result-header ${bestClass}">
                <h4>${titles[type]}</h4>
                ${isBest ? '<span class="best-badge">🚀 Лучший вариант</span>' : ''}
            </div>
            <div class="result-total ${bestClass}">${this.formatCurrency(result.total)}</div>
            <div class="result-tax">Налоги: ${this.formatCurrency(result.tax)}</div>
            <div class="result-net">Сотрудникам: ${this.formatCurrency(result.net)}</div>
            <div class="result-percentage">Нагрузка: ${result.percentage}%</div>
        `;
    }

    updateSavingSummary(results) {
        const summaryElement = document.getElementById('saving-summary');
        if (!summaryElement) return;

        const staffTotal = results.staff.total;
        const ourTotal = results.outstaffing.total;
        const saving = staffTotal - ourTotal;
        const savingPercent = ((saving / staffTotal) * 100).toFixed(1);

        summaryElement.innerHTML = `
            <div class="saving-card">
                <h3>💎 Ваша экономия</h3>
                <div class="saving-amount">${this.formatCurrency(saving)}/месяц</div>
                <div class="saving-percent">${savingPercent}% экономии</div>
                <div class="saving-yearly">${this.formatCurrency(saving * 12)}/год</div>
                <a href="https://wa.me/79581118514" class="btn btn-whatsapp" data-consent-required style="margin-top: 15px; display: block;">
                    📱 Получить расчет
                </a>
            </div>
        `;
    }

    showComparison(outstaffing, selfemployed) {
        const comparisonElement = document.getElementById('comparison');
        if (!comparisonElement) return;

        const advantages = [
            '✅ Полная юридическая защита при проверках',
            '✅ Мы берем на себя все риски и общение с проверяющими',
            '✅ Работа с мигрантами (самозанятые - только россияне)',
            '✅ Отсутствие лимита по численности',
            '✅ Бухгалтерское и кадровое сопровождение',
            '✅ Защита от штрафов до 1 млн рублей за сотрудника',
            '✅ Оформление за 1-3 дня',
            '✅ Персональный менеджер 24/7'
        ];

        comparisonElement.innerHTML = `
            <div class="comparison-header">
                <h3>🎯 Почему аутстаффинг лучше самозанятых</h3>
                <p>При одинаковой налоговой нагрузке вы получаете полный пакет услуг</p>
            </div>
            <div class="advantages-grid">
                ${advantages.map(adv => `
                    <div class="advantage-item">
                        ${adv}
                    </div>
                `).join('')}
            </div>
            <div class="comparison-note">
                <strong>💡 Важно:</strong> Самозанятые подходят только для простых задач без юридических рисков. 
                Для бизнеса с иностранными сотрудниками и защитой от проверок - только аутстаффинг через ЧАЗ.
            </div>
        `;
    }

    setupComparisonChart() {
        // Создаем контейнер для графика, если его нет
        let chartContainer = document.getElementById('comparison-chart');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.id = 'comparison-chart';
            chartContainer.style.cssText = `
                margin: 30px 0;
                padding: 20px;
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--box-shadow);
            `;
            
            const calculator = document.getElementById('calculator');
            if (calculator) {
                calculator.appendChild(chartContainer);
            }
        }
    }

    updateComparisonChart(results) {
        const chartContainer = document.getElementById('comparison-chart');
        if (!chartContainer) return;

        const data = [
            { name: 'Штатные', value: results.staff.total, color: '#e63946' },
            { name: 'ГПХ', value: results.gph.total, color: '#ff9f1c' },
            { name: 'Самозанятые', value: results.selfemployed.total, color: '#2a9d8f' },
            { name: 'Наш аутстаффинг', value: results.outstaffing.total, color: '#25D366' }
        ];

        const maxValue = Math.max(...data.map(item => item.value));
        
        chartContainer.innerHTML = `
            <h3 style="margin-bottom: 20px; text-align: center;">📊 Сравнение общей стоимости</h3>
            <div class="chart-bars">
                ${data.map(item => `
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="
                            height: ${(item.value / maxValue) * 100}%;
                            background: ${item.color};
                            width: 60px;
                            margin: 0 auto;
                            border-radius: 4px 4px 0 0;
                            position: relative;
                        "></div>
                        <div class="chart-label" style="
                            text-align: center;
                            margin-top: 10px;
                            font-size: 0.9rem;
                            font-weight: bold;
                            color: ${item.color};
                        ">${item.name}</div>
                        <div class="chart-value" style="
                            text-align: center;
                            font-size: 0.8rem;
                            color: #666;
                            margin-top: 5px;
                        ">${this.formatCurrency(item.value)}</div>
                    </div>
                `).join('')}
            </div>
            <style>
                .chart-bars {
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-end;
                    height: 200px;
                    padding: 20px 0;
                }
                .chart-bar-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
            </style>
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    exportToPDF() {
        // Экспорт результатов в PDF (заглушка для будущей реализации)
        console.log('Export to PDF functionality will be implemented');
        alert('Функция экспорта в PDF будет доступна в ближайшее время');
    }

    shareResults() {
        // Поделиться результатами (заглушка)
        if (navigator.share) {
            navigator.share({
                title: 'Расчет экономии на аутстаффинге',
                text: 'Посчитайте свою экономию на сайте Ресурсория',
                url: window.location.href
            });
        } else {
            // Fallback - копирование ссылки
            navigator.clipboard.writeText(window.location.href);
            alert('Ссылка скопирована в буфер обмена');
        }
    }
}

// Упрощенный калькулятор для главной страницы
class SimpleCalculator {
    constructor() {
        this.init();
    }

    init() {
        const salaryInput = document.getElementById('salary');
        const employeesInput = document.getElementById('employees');
        
        if (salaryInput && employeesInput) {
            salaryInput.addEventListener('input', () => this.calculate());
            employeesInput.addEventListener('input', () => this.calculate());
            this.calculate();
        }
    }

    calculate() {
        const salary = parseFloat(document.getElementById('salary').value) || 0;
        const employees = parseInt(document.getElementById('employees').value) || 1;
        const totalSalary = salary * employees;

        // Расчет для штатных сотрудников
        const staffTax = totalSalary * 0.43;
        const staffTotal = totalSalary + staffTax;

        // Расчет для аутстаффинга
        const outstaffingTax = totalSalary * 0.12;
        const outstaffingTotal = totalSalary + outstaffingTax;

        // Экономия
        const saving = staffTax - outstaffingTax;
        const savingPercent = ((saving / staffTax) * 100).toFixed(1);

        // Обновление результатов
        const staffResult = document.getElementById('result-staff');
        const outstaffingResult = document.getElementById('result-outstaffing');
        const savingElement = document.getElementById('saving');

        if (staffResult) staffResult.textContent = this.formatCurrency(staffTotal);
        if (outstaffingResult) outstaffingResult.textContent = this.formatCurrency(outstaffingTotal);
        if (savingElement) savingElement.textContent = `Экономия: ${this.formatCurrency(saving)} в месяц (${savingPercent}%)`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }
}

// Инициализация калькуляторов
document.addEventListener('DOMContentLoaded', function() {
    // Полный калькулятор на странице услуг
    if (document.getElementById('calculator')) {
        new TaxCalculator();
    }
    
    // Упрощенный калькулятор на главной
    if (document.getElementById('salary') && document.getElementById('employees')) {
        new SimpleCalculator();
    }
    
    // Региональный калькулятор
    if (document.getElementById('moscow-salary')) {
        new SimpleCalculator(); // Можно адаптировать под регионы
    }
});

// Утилиты для работы с числами
class CalculatorUtils {
    static formatNumber(number) {
        return new Intl.NumberFormat('ru-RU').format(number);
    }

    static calculateMonthlySaving(staffCost, ourCost) {
        return staffCost - ourCost;
    }

    static calculateYearlySaving(monthlySaving) {
        return monthlySaving * 12;
    }

    static calculateROI(initialCost, monthlySaving) {
        if (initialCost === 0) return 0;
        return (monthlySaving * 12) / initialCost * 100;
    }
}