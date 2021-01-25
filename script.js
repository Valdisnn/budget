'use strict';
document.addEventListener('DOMContentLoaded', () => {
    function setCookie(key, value, expires) {
        let cookieStr = key + '=' + value;
        document.cookie = cookieStr;
    }

    function deleteCookies() {
        const c = document.cookie.split("; ");
        for (let key in c)
            document.cookie = /^[^=]+/.exec(c[key])[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    let inputsLeft = document.querySelectorAll('.data input[type="text"]'),
        inputs = document.querySelectorAll('input[type="text"]'),
        inputsRight = document.querySelectorAll('.result input[type="text"'),
        placeholderName = document.querySelectorAll('input[placeholder="Наименование"]'),
        placeholderSum = document.querySelectorAll('input[placeholder = "Сумма"]'),
        expensesItems = document.querySelectorAll('.expenses-items'),
        incomeItems = document.querySelectorAll('.income-items');

    const start = document.getElementById('start'),
        cancel = document.getElementById('cancel'),
        incomePlus = document.getElementsByTagName('button')[0],
        expensesPlus = document.getElementsByTagName('button')[1],
        btnPlus = document.querySelectorAll('.btn_plus'),
        additionalIncomeItem = document.querySelectorAll('.additional_income-item'),
        resultBudgetMonth = document.getElementsByClassName('budget_month-value')[0],
        resultBudgetDay = document.getElementsByClassName('budget_day-value')[0],
        resultExpensesMonth = document.getElementsByClassName('expenses_month-value')[0],
        resultAdditionalIncome = document.getElementsByClassName('additional_income-value')[0],
        resultAdditionalExpenses = document.getElementsByClassName('additional_expenses-value')[0],
        resultIncomePeriod = document.getElementsByClassName('income_period-value')[0],
        resultTargetMonth = document.getElementsByClassName('target_month-value')[0],
        salaryAmount = document.querySelector('.salary-amount'),
        additionalExpensesItem = document.querySelector('.additional_expenses-item'),
        depositAmount = document.querySelector('.deposit-amount'),
        depositPercent = document.querySelector('.deposit-percent'),
        depositBank = document.querySelector('.deposit-bank'),
        depositCheck = document.querySelector('#deposit-check'),
        targetAmount = document.querySelector('.target-amount'),
        periodSelect = document.querySelector('.period-select'),
        periodAmount = document.querySelector('.period-amount');

    class AppData {
        constructor() {
            this.budget = 0;
            this.budgetDay = 0;
            this.budgetMonth = 0;
            this.expensesMonth = 0;
            this.income = {};
            this.incomeMonth = 0;
            this.addIncome = [];
            this.expenses = {};
            this.addExpenses = [];
            this.deposit = false;
            this.percentDeposit = 0;
            this.moneyDeposit = 0;
        }

        loadLocalStorage() {
            inputsLeft = document.querySelectorAll('.data input[type="text"]');
            inputsLeft.forEach((item) => {
                item.disabled = true;
                item.value = localStorage.getItem(item.className.replace('-', '_'));
            });
            inputsRight.forEach((item) => {
                item.value = localStorage.getItem(item.className.split(' ')[1].replace('-', '_'));
            });
            periodSelect.value = localStorage.getItem('periodSelect');
            this.changeRangeValue();
            expensesPlus.disabled = true;
            incomePlus.disabled = true;
            depositCheck.disabled = true;
            periodSelect.disabled = true;
            depositBank.disabled = true;
            start.style.display = 'none';
            cancel.style.display = 'block';
        }

        loadCookie() {
            inputsLeft.forEach((item) => {
                item.disabled = true;
                item.value = getCookie(item.className.replace('-', '_'));
            });
            inputsRight.forEach((item) => {
                item.value = getCookie(item.className.split(' ')[1].replace('-', '_'));
            });
            periodSelect.value = getCookie('periodSelect');
            this.changeRangeValue();
            expensesPlus.disabled = true;
            incomePlus.disabled = true;
            depositCheck.disabled = true;
            periodSelect.disabled = true;
            depositBank.disabled = true;
            start.style.display = 'none';
            cancel.style.display = 'block';
        }

        start() {
            this.budget = +salaryAmount.value;
            if (/[\D]/.test(depositPercent.value)) {
                alert('Введите корректное значение в поле проценты');
            } else if (salaryAmount.value) {
                this.getExpInc();
                this.getInfoDeposit();
                this.getBudget();
                this.getAddExpInc();
                this.showResult();

                inputsLeft = document.querySelectorAll('.data input[type="text"]');
                inputsLeft.forEach((item) => {
                    item.disabled = true;
                    let value = item.value;
                    item = item.className.replace('-', '_');
                    localStorage.setItem(item, value);
                });
                inputsRight.forEach((item) => {
                    let value = item.value;
                    item = item.className.split(' ')[1].replace('-', '_');
                    localStorage.setItem(item, value);
                });
                localStorage.setItem('periodSelect', periodSelect.value);
                localStorage.setItem('isLoad', true);

                inputsLeft.forEach(item => {
                    setCookie(item.className.replace('-', '_'), item.value);
                });
                inputsRight.forEach(item => {
                    setCookie(item.className.split(' ')[1].replace('-', '_'), item.value);
                });
                setCookie('periodSelect', periodSelect.value);
                setCookie('isLoad', true);

                expensesPlus.disabled = true;
                incomePlus.disabled = true;
                depositCheck.disabled = true;
                periodSelect.disabled = true;
                depositBank.disabled = true;
                start.style.display = 'none';
                cancel.style.display = 'block';
            }
        }

        resetFunction() {
            for (let i = 1; i < expensesItems.length; i++) expensesItems[i].remove();
            for (let i = 1; i < incomeItems.length; i++) incomeItems[i].remove();
            expensesPlus.style.display = 'block';
            incomePlus.style.display = 'block';
            inputs = document.querySelectorAll('input[type="text"]');
            inputs.forEach(function (item) {
                item.disabled = false;
                item.value = '';
            });
            expensesPlus.disabled = false;
            incomePlus.disabled = false;
            depositCheck.disabled = false;
            periodSelect.disabled = false;
            depositBank.disabled = false;
            cancel.style.display = 'none';
            start.style.display = 'block';
            periodSelect.value = '1';
            this.changeRangeValue();
            depositCheck.checked = false;
            this.depositHandler();

            this.budget = 0;
            this.budgetDay = 0;
            this.budgetMonth = 0;
            this.expensesMonth = 0;
            this.income = {};
            this.incomeMonth = 0;
            this.addIncome = [];
            this.expenses = {};
            this.addExpenses = [];
            this.deposit = false;
            this.percentDeposit = 0;
            this.moneyDeposit = 0;

            localStorage.clear();
            deleteCookies();
        }

        checkSalary() {
            if (!salaryAmount.value) {
                start.disabled = 'disabled';
                start.style.cursor = 'not-allowed';
            } else {
                start.style.cursor = 'pointer';
                start.disabled = null;
            }
        }

        changeRangeValue() {
            periodAmount.innerText = periodSelect.value;
        }

        showResult() {
            resultBudgetMonth.value = this.budgetMonth;
            resultBudgetDay.value = this.budgetDay;
            resultExpensesMonth.value = this.expensesMonth;
            resultAdditionalExpenses.value = this.addExpenses.join(', ');
            resultAdditionalIncome.value = this.addIncome.join(', ');
            resultIncomePeriod.value = this.calcSavedMoney();
            resultTargetMonth.value = this.getTargetMonth();
        }

        addExpIncBlock() {
            btnPlus.forEach((item) => {
                item.addEventListener('click', () => {
                    const itemButton = item.className.split(' ')[1],
                        itemStr = itemButton.split('_')[0],
                        itemPlus = document.querySelector(`.${itemButton}`),
                        allItems = document.querySelectorAll(`.${itemStr}-items`);
                    let cloneItem = document.querySelectorAll(`.${itemStr}-items`)[0].cloneNode(true);
                    cloneItem.childNodes[1].value = '';
                    cloneItem.childNodes[3].value = '';
                    item.parentNode.insertBefore(cloneItem, itemPlus);
                    this.addEventListenerPlaceholder();
                    if (allItems.length === 2) itemPlus.style.display = 'none';

                    incomeItems = document.querySelectorAll('.income-items');
                    expensesItems = document.querySelectorAll('.expenses-items');
                });
            });
        }

        getExpInc() {
            const count = item => {
                const startStr = item.className.split('-')[0],
                    itemTitle = item.querySelector(`.${startStr}-title`).value,
                    itemAmount = item.querySelector(`.${startStr}-amount`).value;
                if (itemTitle !== '' && itemAmount !== '') {
                    this[startStr][itemTitle] = itemAmount;
                }
            };
            incomeItems.forEach(count);
            expensesItems.forEach(count);
            for (let key in this.income) {
                this.incomeMonth += +this.income[key];
            }
            for (let key in this.expenses) {
                this.expensesMonth += +this.expenses[key];
            }
        }

        getAddExpInc() {
            let i = 0;
            const addItem = item => {
                const itemName = item.className.split('_')[1].split('-')[0];
                if (itemName === 'income') {
                    let addIncome = additionalIncomeItem[i].value.split(',');
                    i++;
                    addIncome.forEach((item) => {
                        item = item.trim();
                        if (item !== '') {
                            this.addIncome.push(item);
                        }
                    });
                } else {
                    let addExpenses = additionalExpensesItem.value.split(',');
                    addExpenses.forEach((item) => {
                        item = item.trim();
                        if (item !== '') {
                            this.addExpenses.push(item);
                        }
                    });
                }
            };
            additionalIncomeItem.forEach(addItem);
            addItem(additionalExpensesItem);
        }

        getBudget() {
            const monthDeposit = this.moneyDeposit * (this.percentDeposit / 100).toFixed(2);
            this.budgetMonth = this.budget + this.incomeMonth - this.expensesMonth + monthDeposit;
            this.budgetDay = Math.floor(this.budgetMonth / 30);
        }

        getTargetMonth() {
            let targetMonth = Math.ceil(targetAmount.value / this.budgetMonth);
            if (!isNaN(targetMonth)) return targetMonth;
            return 0;
        }

        calcSavedMoney() {
            return this.budgetMonth * periodSelect.value;
        }

        addEventListenerPlaceholder() {
            placeholderName = document.querySelectorAll('input[placeholder="Наименование"]');
            for (let i = 0; i < placeholderName.length; i++) {
                let name = placeholderName[i];
                name.addEventListener('input', () => {
                    name.value = name.value.replace(/[0-9A-Za-z]/, '');
                });
            }
            placeholderSum = document.querySelectorAll('input[placeholder="Сумма"]');
            for (let i = 0; i < placeholderSum.length; i++) {
                let sum = placeholderSum[i];
                sum.addEventListener('input', () => {
                    sum.value = sum.value.replace(/[A-Za-zА-Яа-яЁё]/, '');
                });
            }
        }

        getInfoDeposit() {
            if (this.deposit) {
                this.percentDeposit = depositPercent.value;
                this.moneyDeposit = depositAmount.value;
            }
        }

        changePercent() {
            const valueSelect = this.value;
            if (valueSelect === 'other') {
                depositPercent.style.display = 'inline-block';
            } else {
                depositPercent.value = valueSelect;
            }
        }

        depositHandler() {
            if (depositCheck.checked) {
                depositBank.style.display = 'inline-block';
                depositAmount.style.display = 'inline-block';
                this.deposit = true;
                depositBank.addEventListener('change', this.changePercent);

            } else {
                depositBank.style.display = 'none';
                depositAmount.style.display = 'none';
                depositPercent.style.display = 'none';
                depositBank.value = '';
                depositAmount.value = '';
                this.deposit = false;
                depositBank.removeEventListener('change', this.changePercent);
            }
        }

        eventListeners() {
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (localStorage.getItem(key) !== getCookie(key)) {
                    localStorage.clear();
                    deleteCookies();
                }
            }
            if (localStorage.getItem('isLoad') === 'true') this.loadLocalStorage();
            if (getCookie('isLoad')) this.loadCookie();
            salaryAmount.addEventListener('input', this.checkSalary);
            start.addEventListener('click', this.start.bind(this));
            cancel.addEventListener('click', this.resetFunction.bind(this));
            periodSelect.addEventListener('mousemove', this.changeRangeValue);
            depositCheck.addEventListener('change', this.depositHandler.bind(this));
            this.addExpIncBlock();
            this.addEventListenerPlaceholder();

        }
    }

    const appData = new AppData();

    appData.eventListeners();
});
