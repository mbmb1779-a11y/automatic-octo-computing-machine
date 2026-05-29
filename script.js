// إدارة البيانات المخزنة
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let financeChart = null;

// عناصر واجهة المستخدم
const financeForm = document.getElementById('finance-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const tableBody = document.getElementById('transaction-table-body');

// 1. تحديث الأرقام والبطاقات المالية
function updateSummary() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  document.getElementById('total-income').innerText = `${income.toFixed(2)} ر.س`;
  document.getElementById('total-expenses').innerText = `${expenses.toFixed(2)} ر.س`;
  document.getElementById('net-balance').innerText = `${balance.toFixed(2)} ر.س`;
  
  // تحديث لون الرصيد المتبقي بناء على قيمته
  const balanceCard = document.getElementById('net-balance');
  if(balance < 0) {
    balanceCard.style.color = '#e63946';
  } else {
    balanceCard.style.color = '#4361ee';
  }
}

// 2. تحديث وعرض جدول العمليات
function updateTable() {
  tableBody.innerHTML = '';

  transactions.forEach((transaction) => {
    const row = document.createElement('tr');
    
    const typeBadge = transaction.type === 'income' ? 'دخل' : 'مصروف';
    const typeClass = transaction.type === 'income' ? 'income' : 'expense';

    row.innerHTML = `
      <td>${transaction.title}</td>
      <td style="font-weight: bold; color: ${transaction.type === 'income' ? '#2ec4b6' : '#e63946'}">
        ${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} ر.س
      </td>
      <td><span class="badge ${typeClass}">${typeBadge}</span></td>
      <td><button class="btn-delete" onclick="deleteTransaction(${transaction.id})">حذف</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// 3. تحديث الرسم البياني (Chart.js)
function updateChart() {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const ctx = document.getElementById('financeChart').getContext('2d');

  if (financeChart) {
    financeChart.destroy(); // تدمير الرسم القديم لتجنب التداخل عند التحديث
  }

  // إنشاء الرسم البياني الدائري
  financeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['إجمالي الدخل', 'إجمالي المصروفات'],
      datasets: [{
        data: [income, expenses],
        backgroundColor: ['#2ec4b6', '#e63946'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Segoe UI' } } }
      }
    }
  });
}

// 4. دالة حفظ المعاملة الجديدة
financeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newTransaction = {
    id: Date.now(),
    title: titleInput.value,
    amount: parseFloat(amountInput.value),
    type: typeInput.value
  };

  transactions.push(newTransaction);
  saveToLocalStorage();
  init();

  // إعادة ضبط النموذج
  financeForm.reset();
});

// 5. دالة حذف معاملة
window.deleteTransaction = function(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToLocalStorage();
  init();
}

// حفظ في الذاكرة المحلية
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// تشغيل كافة الدوال لتحديث الواجهة
function init() {
  updateSummary();
  updateTable();
  updateChart();
}

// تشغيل التطبيق أول مرة عند تحميل الصفحة
init();