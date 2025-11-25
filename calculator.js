// /js/calculator.js
class TaxCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.calculate();
        this.setupComparisonChart();
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('#calculator input[type="number"], #calculator select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
            input.addEventListener('change', () => this.calculate());
        });

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

    calculateStaff(salaryNet, employees, region) {
        // salaryNet - зарплата на руки (нетто)
        const totalSalaryNet = salaryNet * employees;
        
        // Расчет НДФЛ и брутто-зарплаты
        const ndflRate = 0.13;
        const salaryBrutto = salaryNet / (1 - ndflRate);
        const ndfl = salaryBrutto * ndflRate;
        
        // Страховые взносы 30% от брутто
        const insuranceRate = 0.30;
        const insurance = salaryBrutto * insuranceRate;
        
        // Убираем налог на прибыль - он не относится к ФОТ напрямую
        const totalTax = ndfl + insurance;
        const totalCost = salaryBrutto + insurance;
        
        return {
            total: totalCost * employees,
            tax: totalTax * employees,
            net: totalSalaryNet,
            breakdown: {
                ndfl: ndfl * employees,
                insurance: insurance * employees
            },
            percentage: Math.round((totalTax / salaryBrutto) * 100)
        };
    }

    calculateGPH(salaryNet, employees, region) {
        const totalSalaryNet = salaryNet * employees;
        
        // Расчет НДФЛ и брутто-зарплаты
        const ndflRate = 0.13;
        const salaryBrutto = salaryNet / (1 - ndflRate);
        const ndfl = salaryBrutto * ndflRate;
        
        // Взносы по ГПХ (пенсионные и медицинские) ~7.6%
        const insuranceRate = 0.076;
        const insurance = salaryBrutto * insuranceRate;
        
        const totalTax = ndfl + insurance;
        const totalCost = salaryBrutto + insurance;
        
        return {
            total: totalCost * employees,
            tax: totalTax * employees,
            net: totalSalaryNet,
            breakdown: {
                ndfl: ndfl * employees,
                insurance: insurance * employees
            },
            percentage: Math.round((totalTax / salaryBrutto) * 100)
        };
    }

    calculateSelfEmployed(salaryNet, employees, region) {
        const totalSalaryNet = salaryNet * employees;
        
        // Налог для самозанятых 6%
        const taxRate = 0.06;
        const tax = salaryNet * taxRate;
        
        // Комиссия платформы 2%
        const serviceFee = salaryNet * 0.02;
        
        const totalTax = tax + serviceFee;
        const totalCost = salaryNet + totalTax;
        
        return {
            total: totalCost * employees,
            tax: totalTax * employees,
            net: totalSalaryNet,
            breakdown: {
                tax: tax * employees,
                serviceFee: serviceFee * employees
            },
            percentage: Math.round((totalTax / salaryNet) * 100)
        };
    }

    calculateOutstaffing(salaryNet, employees, region) {
        const totalSalaryNet = salaryNet * employees;
        
        // Наша эффективная налоговая ставка 9%
        const ourTaxRate = 0.09;
        const ourTax = salaryNet * ourTaxRate;
        
        // Наша комиссия за услуги 3%
        const serviceFee = salaryNet * 0.03;
        
        const totalTax = ourTax + serviceFee;
        const totalCost = salaryNet + totalTax;
        
        return {
            total: totalCost * employees,
            tax: totalTax * employees,
            net: totalSalaryNet,
            breakdown: {
                ourTax: ourTax * employees,
                serviceFee: serviceFee * employees
            },
            percentage: Math.round((totalTax / salaryNet) * 100)
        };
    }

    displayResults(results) {
        Object.keys(results).forEach(type => {
            const result = results[type];
            const element = document.getElementById(`result-${type}`);
            
            if (element) {
                element.innerHTML = this.createResultHTML(type, result);
            }
        });

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
            <div class="result-tax">Налоги и комиссии: ${this.formatCurrency(result.tax)}</div>
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
        
        // Расчет для штатных сотрудников
        const salaryBrutto = salary / (1 - 0.13); // Брутто зарплата
        const staffTax = salaryBrutto * 0.13 + salaryBrutto * 0.30; // НДФЛ + взносы
        const staffTotal = salaryBrutto + salaryBrutto * 0.30;
        
        // Расчет для аутстаффинга
        const outstaffingTax = salary * 0.12;
        const outstaffingTotal = salary + outstaffingTax;
        
        // Экономия
        const saving = staffTotal - outstaffingTotal;
        const savingPercent = ((saving / staffTotal) * 100).toFixed(1);
        
        // Обновление результатов
        const staffResult = document.getElementById('result-staff');
        const outstaffingResult = document.getElementById('result-outstaffing');
        const savingElement = document.getElementById('saving');
        
        if (staffResult) staffResult.textContent = this.formatCurrency(staffTotal * employees);
        if (outstaffingResult) outstaffingResult.textContent = this.formatCurrency(outstaffingTotal * employees);
        if (savingElement) savingElement.textContent = `Экономия: ${this.formatCurrency(saving * employees)} в месяц (${savingPercent}%)`;
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
    if (document.getElementById('calculator')) {
        new TaxCalculator();
    }
    
    if (document.getElementById('salary') && document.getElementById('employees')) {
        new SimpleCalculator();
    }
});