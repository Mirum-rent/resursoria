<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Калькулятор экономии на аутстаффинге</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .calculator-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .calculator-header {
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .calculator-header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .calculator-header p {
            font-size: 1.3em;
            opacity: 0.9;
        }

        .calculator-body {
            padding: 40px;
        }

        .input-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .input-group {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #e9ecef;
        }

        .input-group label {
            display: block;
            font-size: 1.4em;
            font-weight: 600;
            margin-bottom: 15px;
            color: #2d3748;
        }

        .input-group input {
            width: 100%;
            padding: 15px 20px;
            font-size: 1.3em;
            border: 3px solid #e2e8f0;
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .input-group input:focus {
            outline: none;
            border-color: #25D366;
            box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
        }

        .input-hint {
            font-size: 1.1em;
            color: #718096;
            margin-top: 10px;
        }

        .results-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .result-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
        }

        .result-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .result-card.staff {
            border-top: 5px solid #e53e3e;
        }

        .result-card.our {
            border-top: 5px solid #25D366;
            position: relative;
            overflow: hidden;
        }

        .result-card.our::before {
            content: '🚀 ЛУЧШИЙ ВАРИАНТ';
            position: absolute;
            top: 15px;
            right: -35px;
            background: #25D366;
            color: white;
            padding: 8px 40px;
            font-size: 0.9em;
            font-weight: 600;
            transform: rotate(45deg);
        }

        .result-title {
            font-size: 1.6em;
            font-weight: 700;
            margin-bottom: 20px;
            color: #2d3748;
        }

        .result-amount {
            font-size: 2.8em;
            font-weight: 800;
            margin-bottom: 15px;
        }

        .result-card.staff .result-amount {
            color: #e53e3e;
        }

        .result-card.our .result-amount {
            color: #25D366;
        }

        .result-details {
            font-size: 1.2em;
            color: #718096;
            line-height: 1.6;
        }

        .saving-section {
            background: linear-gradient(135deg, #ffd89b, #19547b);
            color: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 40px;
        }

        .saving-title {
            font-size: 1.8em;
            font-weight: 700;
            margin-bottom: 20px;
        }

        .saving-amount {
            font-size: 3.5em;
            font-weight: 800;
            margin-bottom: 10px;
        }

        .saving-percent {
            font-size: 1.8em;
            font-weight: 600;
            opacity: 0.9;
        }

        .saving-yearly {
            font-size: 1.4em;
            margin-top: 15px;
            opacity: 0.8;
        }

        .comparison-section {
            margin-bottom: 40px;
        }

        .comparison-title {
            font-size: 2em;
            font-weight: 700;
            text-align: center;
            margin-bottom: 30px;
            color: #2d3748;
        }

        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }

        .comparison-item {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border: 2px solid #e2e8f0;
        }

        .comparison-item.our {
            border-color: #25D366;
            background: linear-gradient(135deg, #f0fff4, #ffffff);
        }

        .comparison-name {
            font-size: 1.3em;
            font-weight: 600;
            margin-bottom: 15px;
            color: #2d3748;
        }

        .comparison-amount {
            font-size: 1.8em;
            font-weight: 700;
            color: #25D366;
        }

        .comparison-item.staff .comparison-amount {
            color: #e53e3e;
        }

        .comparison-item.gph .comparison-amount {
            color: #ed8936;
        }

        .comparison-item.selfemployed .comparison-amount {
            color: #38b2ac;
        }

        .advantages-section {
            background: #f7fafc;
            padding: 40px;
            border-radius: 15px;
            border: 2px solid #e2e8f0;
        }

        .advantages-title {
            font-size: 1.8em;
            font-weight: 700;
            text-align: center;
            margin-bottom: 30px;
            color: #2d3748;
        }

        .advantages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .advantage-item {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #25D366;
            font-size: 1.2em;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        .cta-section {
            text-align: center;
            padding: 40px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: white;
            padding: 20px 50px;
            font-size: 1.4em;
            font-weight: 600;
            text-decoration: none;
            border-radius: 50px;
            box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
            transition: all 0.3s ease;
        }

        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(37, 211, 102, 0.4);
        }

        @media (max-width: 768px) {
            .input-section,
            .results-section,
            .comparison-grid {
                grid-template-columns: 1fr;
            }
            
            .calculator-header h1 {
                font-size: 2em;
            }
            
            .result-amount {
                font-size: 2.2em;
            }
            
            .saving-amount {
                font-size: 2.5em;
            }
        }
    </style>
</head>
<body>
    <div class="calculator-container">
        <div class="calculator-header">
            <h1>Калькулятор экономии на аутстаффинге</h1>
            <p>Узнайте, сколько вы сможете сэкономить с нашими услугами</p>
        </div>

        <div class="calculator-body">
            <div class="input-section">
                <div class="input-group">
                    <label for="salary">Средняя зарплата на руки (руб)</label>
                    <input type="number" id="salary" value="50000" min="0" step="1000">
                    <div class="input-hint">Сколько получает сотрудник после вычета налогов</div>
                </div>
                
                <div class="input-group">
                    <label for="employees">Количество сотрудников</label>
                    <input type="number" id="employees" value="10" min="1" max="1000">
                    <div class="input-hint">Сколько сотрудников вы планируете оформить</div>
                </div>
            </div>

            <div class="results-section">
                <div class="result-card staff">
                    <div class="result-title">Штатные сотрудники (по ТК РФ)</div>
                    <div class="result-amount" id="result-staff">715 000 ₽</div>
                    <div class="result-details">
                        • НДФЛ 13%: 74 712 ₽<br>
                        • Страховые взносы 30%: 172 414 ₽<br>
                        • Общая налоговая нагрузка: 43%
                    </div>
                </div>
                
                <div class="result-card our">
                    <div class="result-title">Наш аутстаффинг</div>
                    <div class="result-amount" id="result-our">560 000 ₽</div>
                    <div class="result-details">
                        • Налоги подрядчика: 45 000 ₽<br>
                        • Наша комиссия 15%: 75 000 ₽<br>
                        • Общая нагрузка: 24%
                    </div>
                </div>
            </div>

            <div class="saving-section">
                <div class="saving-title">💎 Ваша экономия</div>
                <div class="saving-amount" id="saving-amount">155 000 ₽</div>
                <div class="saving-percent" id="saving-percent">21.7% экономии</div>
                <div class="saving-yearly" id="saving-yearly">1 860 000 ₽ в год</div>
            </div>

            <div class="comparison-section">
                <div class="comparison-title">📊 Сравнение общей стоимости</div>
                <div class="comparison-grid">
                    <div class="comparison-item staff">
                        <div class="comparison-name">Штатные</div>
                        <div class="comparison-amount" id="comparison-staff">715 000 ₽</div>
                    </div>
                    <div class="comparison-item gph">
                        <div class="comparison-name">Договоры ГПХ</div>
                        <div class="comparison-amount" id="comparison-gph">618 000 ₽</div>
                    </div>
                    <div class="comparison-item selfemployed">
                        <div class="comparison-name">Самозанятые</div>
                        <div class="comparison-amount" id="comparison-selfemployed">530 000 ₽</div>
                    </div>
                    <div class="comparison-item our">
                        <div class="comparison-name">Наш аутстаффинг</div>
                        <div class="comparison-amount" id="comparison-our">560 000 ₽</div>
                    </div>
                </div>
            </div>

            <div class="advantages-section">
                <div class="advantages-title">🎯 Преимущества нашего аутстаффинга</div>
                <div class="advantages-grid">
                    <div class="advantage-item">✅ Полная юридическая защита при проверках</div>
                    <div class="advantage-item">✅ Мы берем на себя все риски и общение с проверяющими</div>
                    <div class="advantage-item">✅ Работа с мигрантами (самозанятые - только россияне)</div>
                    <div class="advantage-item">✅ Отсутствие лимита по численности</div>
                    <div class="advantage-item">✅ Бухгалтерское и кадровое сопровождение</div>
                    <div class="advantage-item">✅ Защита от штрафов до 1 млн рублей за сотрудника</div>
                    <div class="advantage-item">✅ Оформление за 1-3 дня</div>
                    <div class="advantage-item">✅ Персональный менеджер 24/7</div>
                </div>
            </div>

            <div class="cta-section">
                <a href="https://wa.me/79581118514" class="cta-button">
                    📱 Получить индивидуальный расчет
                </a>
            </div>
        </div>
    </div>

    <script>
        class TaxCalculator {
            constructor() {
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.calculate();
            }

            setupEventListeners() {
                const salaryInput = document.getElementById('salary');
                const employeesInput = document.getElementById('employees');
                
                salaryInput.addEventListener('input', () => this.calculate());
                employeesInput.addEventListener('input', () => this.calculate());
            }

            calculate() {
                const salaryNet = parseFloat(document.getElementById('salary').value) || 0;
                const employees = parseInt(document.getElementById('employees').value) || 1;
                
                const results = {
                    staff: this.calculateStaff(salaryNet, employees),
                    gph: this.calculateGPH(salaryNet, employees),
                    selfemployed: this.calculateSelfEmployed(salaryNet, employees),
                    our: this.calculateOurService(salaryNet, employees)
                };

                this.displayResults(results);
                this.updateComparison(results);
                this.updateSaving(results);
            }

            calculateStaff(salaryNet, employees) {
                // Расчет для штатных сотрудников по ТК РФ
                const ndflRate = 0.13;
                const insuranceRate = 0.30;
                
                // Зарплата брутто (до вычета НДФЛ)
                const salaryBrutto = salaryNet / (1 - ndflRate);
                
                // Налоги
                const ndfl = salaryBrutto * ndflRate;
                const insurance = salaryBrutto * insuranceRate;
                
                const totalTax = ndfl + insurance;
                const totalCost = salaryBrutto + insurance;
                
                return {
                    total: totalCost * employees,
                    tax: totalTax * employees,
                    net: salaryNet * employees,
                    breakdown: {
                        ndfl: ndfl * employees,
                        insurance: insurance * employees
                    }
                };
            }

            calculateGPH(salaryNet, employees) {
                // Расчет для договоров ГПХ
                const ndflRate = 0.13;
                const insuranceRate = 0.076; // Пенсионные и медицинские взносы
                
                const salaryBrutto = salaryNet / (1 - ndflRate);
                const ndfl = salaryBrutto * ndflRate;
                const insurance = salaryBrutto * insuranceRate;
                
                const totalCost = salaryBrutto + insurance;
                
                return {
                    total: totalCost * employees,
                    tax: (ndfl + insurance) * employees,
                    net: salaryNet * employees
                };
            }

            calculateSelfEmployed(salaryNet, employees) {
                // Расчет для самозанятых
                const taxRate = 0.06; // Налог для самозанятых
                const tax = salaryNet * taxRate;
                
                const totalCost = salaryNet + tax;
                
                return {
                    total: totalCost * employees,
                    tax: tax * employees,
                    net: salaryNet * employees
                };
            }

            calculateOurService(salaryNet, employees) {
                // Расчет для нашего аутстаффинга
                const ourTaxRate = 0.09; // Налоги подрядчика
                const ourCommission = 0.15; // Наша комиссия
                
                const ourTax = salaryNet * ourTaxRate;
                const ourCommissionAmount = salaryNet * ourCommission;
                
                const totalTax = ourTax + ourCommissionAmount;
                const totalCost = salaryNet + totalTax;
                
                return {
                    total: totalCost * employees,
                    tax: totalTax * employees,
                    net: salaryNet * employees,
                    breakdown: {
                        ourTax: ourTax * employees,
                        ourCommission: ourCommissionAmount * employees
                    }
                };
            }

            displayResults(results) {
                // Основные результаты
                document.getElementById('result-staff').textContent = this.formatCurrency(results.staff.total);
                document.getElementById('result-our').textContent = this.formatCurrency(results.our.total);
                
                // Детализация для штатных
                const staffDetails = document.querySelector('.result-card.staff .result-details');
                staffDetails.innerHTML = `
                    • НДФЛ 13%: ${this.formatCurrency(results.staff.breakdown.ndfl)}<br>
                    • Страховые взносы 30%: ${this.formatCurrency(results.staff.breakdown.insurance)}<br>
                    • Общая налоговая нагрузка: 43%
                `;
                
                // Детализация для нашего сервиса
                const ourDetails = document.querySelector('.result-card.our .result-details');
                ourDetails.innerHTML = `
                    • Налоги подрядчика: ${this.formatCurrency(results.our.breakdown.ourTax)}<br>
                    • Наша комиссия 15%: ${this.formatCurrency(results.our.breakdown.ourCommission)}<br>
                    • Общая нагрузка: 24%
                `;
            }

            updateComparison(results) {
                document.getElementById('comparison-staff').textContent = this.formatCurrency(results.staff.total);
                document.getElementById('comparison-gph').textContent = this.formatCurrency(results.gph.total);
                document.getElementById('comparison-selfemployed').textContent = this.formatCurrency(results.selfemployed.total);
                document.getElementById('comparison-our').textContent = this.formatCurrency(results.our.total);
            }

            updateSaving(results) {
                const staffTotal = results.staff.total;
                const ourTotal = results.our.total;
                const saving = staffTotal - ourTotal;
                const savingPercent = ((saving / staffTotal) * 100).toFixed(1);
                const yearlySaving = saving * 12;

                document.getElementById('saving-amount').textContent = this.formatCurrency(saving);
                document.getElementById('saving-percent').textContent = `${savingPercent}% экономии`;
                document.getElementById('saving-yearly').textContent = `${this.formatCurrency(yearlySaving)} в год`;
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

        // Инициализация калькулятора
        document.addEventListener('DOMContentLoaded', function() {
            new TaxCalculator();
        });
    </script>
</body>
</html>