// /js/calculator.js
class TaxCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.calculate(); // Первоначальный расчет
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('#calculator input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
            input.addEventListener('change', () => this.calculate());
        });

        const selects = document.querySelectorAll('#calculator select');
        selects.forEach(select => {
            select.addEventListener('change', () => this.calculate());
        });
    }

    calculate() {
        const salary = parseFloat(document.getElementById('salary').value) || 0;
        const employees = parseInt(document.getElementById('employees').value) || 1;
        const region = document.getElementById('region').value;
        
        const results = {
            staff: this.calculateStaff(salary, employees, region),
            gph: this.calculateGPH(salary, employees, region),
            selfemployed: this.calculateSelfEmployed(salary, employees, region),
            outstaffing: this.calculateOutstaffing(salary, employees, region)
        };

        this.displayResults(results);
    }

    calculateStaff(salary, employees, region) {
        const totalSalary = salary * employees;
        const ndfl = totalSalary * 0.13;
        const insurance = totalSalary * 0.30;
        const profitTax = totalSalary * 0.20;
        const totalTax = ndfl + insurance + profitTax;
        
        return {
            total: totalSalary,
            tax: totalTax,
            net: totalSalary - totalTax,
            breakdown: {
                ndfl,
                insurance,
                profitTax
            }
        };
    }

    calculateGPH(salary, employees, region) {
        const totalSalary = salary * employees;
        const ndfl = totalSalary * 0.13;
        const insurance = totalSalary * 0.10; // Упрощенные взносы
        const totalTax = ndfl + insurance;
        
        return {
            total: totalSalary,
            tax: totalTax,
            net: totalSalary - totalTax,
            breakdown: {
                ndfl,
                insurance
            }
        };
    }

    calculateSelfEmployed(salary, employees, region) {
        const totalSalary = salary * employees;
        const tax = totalSalary * 0.06; // 6% для самозанятых
        const serviceFee = totalSalary * 0.02; // Комиссия платформы
        
        return {
            total: totalSalary,
            tax: tax + serviceFee,
            net: totalSalary - tax - serviceFee,
            breakdown: {
                tax,
                serviceFee
            }
        };
    }

    calculateOutstaffing(salary, employees, region) {
        const totalSalary = salary * employees;
        const ourTax = totalSalary * 0.09; // Наша эффективная ставка
        const serviceFee = totalSalary * 0.03; // Наша комиссия
        const totalTax = ourTax + serviceFee;
        
        return {
            total: totalSalary,
            tax: totalTax,
            net: totalSalary - totalTax,
            breakdown: {
                ourTax,
                serviceFee
            }
        };
    }

    displayResults(results) {
        // Обновляем все блоки с результатами
        Object.keys(results).forEach(type => {
            const result = results[type];
            const element = document.getElementById(`result-${type}`);
            
            if (element) {
                element.innerHTML = `
                    <div class="result-total">${this.formatCurrency(result.total)}</div>
                    <div class="result-tax">Налоги: ${this.formatCurrency(result.tax)}</div>
                    <div class="result-net">Чистыми: ${this.formatCurrency(result.net)}</div>
                    <div class="result-saving">Экономия: ${this.calculateSaving(results.staff.tax, result.tax)}</div>
                `;
            }
        });

        // Показываем сравнение с самозанятыми
        this.showComparison(results.outstaffing, results.selfemployed);
    }

    calculateSaving(staffTax, currentTax) {
        const saving = staffTax - currentTax;
        const percent = ((saving / staffTax) * 100).toFixed(1);
        return `${this.formatCurrency(saving)} (${percent}%)`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }

    showComparison(outstaffing, selfemployed) {
        const comparisonElement = document.getElementById('comparison');
        if (comparisonElement) {
            const advantages = [
                'Полная юридическая защита при проверках',
                'Мы берем на себя все риски и общение с проверяющими',
                'Работа с мигрантами (самозанятые - только россияне)',
                'Отсутствие лимита по численности',
                'Бухгалтерское и кадровое сопровождение',
                'Защита от штрафов до 1 млн рублей за сотрудника'
            ];

            comparisonElement.innerHTML = `
                <h4>Преимущества перед самозанятыми:</h4>
                <ul>
                    ${advantages.map(adv => `<li>✅ ${adv}</li>`).join('')}
                </ul>
                <div class="comparison-note">
                    <strong>Важно:</strong> При одинаковой налоговой нагрузке вы получаете полный пакет юридических услуг и защиту!
                </div>
            `;
        }
    }
}

// Инициализация калькулятора
document.addEventListener('DOMContentLoaded', function() {
    new TaxCalculator();
});