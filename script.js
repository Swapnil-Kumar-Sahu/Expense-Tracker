const STORAGE_KEYS = {
    users: "expenseUsers",
    currentUser: "expenseCurrentUser"
};

const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser));
let financeData = {
    transactions: [],
    transfers: [],
    savings: [],
    budgets: []
};

function saveUsers() {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getFinanceKey() {
    return currentUser ? `expenseTrackerData_${currentUser.email}` : "";
}

function createDemoData() {
    return {
        transactions: [
            { id: 1, description: "Salary", amount: 5000, type: "income", category: "Salary", date: "2026-09-01" },
            { id: 2, description: "Rent", amount: 1200, type: "expense", category: "Bills", date: "2026-09-02" },
            { id: 3, description: "Groceries", amount: 420, type: "expense", category: "Food", date: "2026-09-05" },
            { id: 4, description: "Freelance Project", amount: 700, type: "income", category: "Salary", date: "2026-09-10" }
        ],
        transfers: [
            { id: 1, from: "Main Account", to: "Savings", amount: 400, date: "2026-09-06" },
            { id: 2, from: "Main Account", to: "Travel Wallet", amount: 250, date: "2026-09-12" }
        ],
        savings: [
            { id: 1, name: "Emergency Fund", target: 20000, saved: 12500 },
            { id: 2, name: "Vacation", target: 8000, saved: 4300 }
        ],
        budgets: [
            { id: 1, category: "Food", limit: 1200, spent: 890 },
            { id: 2, category: "Travel", limit: 800, spent: 420 },
            { id: 3, category: "Bills", limit: 1500, spent: 1200 }
        ]
    };
}

function loadFinanceState() {
    if (!currentUser) {
        financeData = { transactions: [], transfers: [], savings: [], budgets: [] };
        return;
    }

    const key = getFinanceKey();
    const data = JSON.parse(localStorage.getItem(key));

    if (!data) {
        const demo = createDemoData();
        localStorage.setItem(key, JSON.stringify(demo));
        financeData = demo;
        return;
    }

    financeData = data;
}

function saveFinanceState() {
    if (!currentUser) return;
    localStorage.setItem(getFinanceKey(), JSON.stringify(financeData));
}

function setAuthMode(mode) {
    const isLogin = mode === "login";
    const isSignup = mode === "signup";
    const isReset = mode === "reset";

    document.getElementById("loginFormWrap").classList.toggle("active", isLogin);
    document.getElementById("signupFormWrap").classList.toggle("active", isSignup);
    document.getElementById("resetFormWrap").classList.toggle("active", isReset);

    document.getElementById("showLoginBtn").classList.toggle("active", isLogin);
    document.getElementById("showSignupBtn").classList.toggle("active", isSignup);
}

function updateProfilePanel() {
    const profilePanel = document.getElementById("profilePanel");
    if (!currentUser) {
        profilePanel.classList.add("hidden");
        return;
    }

    document.getElementById("profileName").textContent = currentUser.name || "-";
    document.getElementById("profileEmail").textContent = currentUser.email || "-";
    document.getElementById("profileUsername").textContent = currentUser.username || "-";
    document.getElementById("profilePhone").textContent = currentUser.phone || "-";
    document.getElementById("profileJoined").textContent = currentUser.joinedAt
        ? new Date(currentUser.joinedAt).toLocaleDateString()
        : "-";
}

function renderAppState() {
    const loggedIn = !!currentUser;
    document.getElementById("authScreen").classList.toggle("hidden", loggedIn);
    document.getElementById("appScreen").classList.toggle("hidden", !loggedIn);
    document.getElementById("userMenu").classList.toggle("hidden", !loggedIn);
    document.getElementById("showLoginBtn").classList.toggle("hidden", loggedIn);
    document.getElementById("showSignupBtn").classList.toggle("hidden", loggedIn);

    if (loggedIn) {
        document.getElementById("welcomeName").textContent = currentUser.name.split(" ")[0];
        updateProfilePanel();
        renderAll();
    } else {
        document.getElementById("profilePanel").classList.add("hidden");
    }
}

function showSection(sectionName) {
    document.querySelectorAll(".sidebar-btn").forEach(function(button) {
        button.classList.toggle("active", button.dataset.section === sectionName);
    });

    document.querySelectorAll(".content-section").forEach(function(section) {
        const visible = section.id === `section-${sectionName}`;
        section.classList.toggle("hidden", !visible);
    });
}

function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const phone = document.getElementById("signupPhone").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!name || !username || !email || !phone || !password) {
        alert("Please fill all sign-up fields!");
        return;
    }

    if (users.some(user => user.email === email)) {
        alert("An account with this email already exists.");
        return;
    }

    const newUser = {
        name,
        username,
        email,
        phone,
        password,
        joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();
    document.getElementById("signupForm").reset();
    setAuthMode("login");
    alert("Account created successfully. Please log in.");
}

function resetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value.trim().toLowerCase();
    const newPassword = document.getElementById("resetPassword").value.trim();

    if (!email || !newPassword) {
        alert("Please enter your email and a new password.");
        return;
    }

    const userIndex = users.findIndex(user => user.email === email);

    if (userIndex === -1) {
        alert("No account found with that email.");
        return;
    }

    users[userIndex].password = newPassword;
    saveUsers();
    document.getElementById("resetForm").reset();
    setAuthMode("login");
    alert("Password updated successfully. Please log in again.");
}

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    const foundUser = users.find(user => user.email === email && user.password === password);

    if (!foundUser) {
        alert("Invalid email or password.");
        return;
    }

    currentUser = foundUser;
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    loadFinanceState();
    renderAppState();
    showSection("dashboard");
    document.getElementById("loginForm").reset();
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    document.getElementById("profilePanel").classList.add("hidden");
    renderAppState();
    setAuthMode("login");
}

function addTransaction() {
    if (!currentUser) {
        alert("Please log in to add transactions.");
        return;
    }

    const description = document.getElementById("description").value.trim();
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!description || !amount || !date) {
        alert("Please fill all fields!");
        return;
    }

    financeData.transactions.push({
        id: Date.now(),
        description,
        amount: Number(amount),
        type,
        category,
        date
    });

    saveFinanceState();
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    renderAll();
}

function deleteTransaction(id) {
    financeData.transactions = financeData.transactions.filter(transaction => transaction.id !== id);
    saveFinanceState();
    renderAll();
}

function addIncomeEntry() {
    const label = document.getElementById("incomeLabel").value.trim();
    const amount = Number(document.getElementById("incomeAmount").value);
    const date = document.getElementById("incomeDate").value;

    if (!label || !amount || !date) {
        alert("Please enter income source, amount, and date.");
        return;
    }

    financeData.transactions.push({
        id: Date.now(),
        description: label,
        amount,
        type: "income",
        category: "Salary",
        date
    });

    saveFinanceState();
    document.getElementById("incomeLabel").value = "";
    document.getElementById("incomeAmount").value = "";
    document.getElementById("incomeDate").value = "";
    renderAll();
}

function addExpenseEntry() {
    const label = document.getElementById("expenseLabel").value.trim();
    const amount = Number(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;
    const date = document.getElementById("expenseDate").value;

    if (!label || !amount || !date) {
        alert("Please enter expense details.");
        return;
    }

    financeData.transactions.push({
        id: Date.now(),
        description: label,
        amount,
        type: "expense",
        category,
        date
    });

    saveFinanceState();
    document.getElementById("expenseLabel").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";
    renderAll();
}

function addTransfer() {
    const from = document.getElementById("transferFrom").value.trim() || "Main Account";
    const to = document.getElementById("transferTo").value.trim() || "Savings";
    const amount = Number(document.getElementById("transferAmount").value);
    const date = document.getElementById("transferDate").value;

    if (!amount || !date) {
        alert("Please enter transfer details.");
        return;
    }

    financeData.transfers.push({
        id: Date.now(),
        from,
        to,
        amount,
        date
    });

    saveFinanceState();
    document.getElementById("transferFrom").value = "Main Account";
    document.getElementById("transferTo").value = "Savings";
    document.getElementById("transferAmount").value = "";
    document.getElementById("transferDate").value = "";
    renderAll();
}

function deleteTransfer(id) {
    financeData.transfers = financeData.transfers.filter(item => item.id !== id);
    saveFinanceState();
    renderAll();
}

function addSavingsGoal() {
    const name = document.getElementById("savingName").value.trim();
    const target = Number(document.getElementById("savingTarget").value);
    const saved = Number(document.getElementById("savingCurrent").value) || 0;

    if (!name || !target) {
        alert("Please fill goal name and target amount.");
        return;
    }

    financeData.savings.push({
        id: Date.now(),
        name,
        target,
        saved
    });

    saveFinanceState();
    document.getElementById("savingName").value = "";
    document.getElementById("savingTarget").value = "";
    document.getElementById("savingCurrent").value = "";
    renderAll();
}

function deleteSavingsGoal(id) {
    financeData.savings = financeData.savings.filter(item => item.id !== id);
    saveFinanceState();
    renderAll();
}

function addBudget() {
    const category = document.getElementById("budgetCategory").value;
    const limit = Number(document.getElementById("budgetLimit").value);

    if (!limit) {
        alert("Please enter a valid budget amount.");
        return;
    }

    const spent = financeData.transactions
        .filter(t => t.type === "expense" && t.category === category)
        .reduce((sum, item) => sum + item.amount, 0);

    financeData.budgets.push({
        id: Date.now(),
        category,
        limit,
        spent
    });

    saveFinanceState();
    document.getElementById("budgetLimit").value = "";
    renderAll();
}

function deleteBudget(id) {
    financeData.budgets = financeData.budgets.filter(item => item.id !== id);
    saveFinanceState();
    renderAll();
}

function renderDashboard() {
    const income = financeData.transactions.filter(t => t.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expense = financeData.transactions.filter(t => t.type === "expense").reduce((sum, item) => sum + item.amount, 0);

    document.getElementById("totalIncome").textContent = "₹" + income;
    document.getElementById("totalExpense").textContent = "₹" + expense;
    document.getElementById("balance").textContent = "₹" + (income - expense);

    renderTransactionHistory();
}

function renderTransactionHistory() {
    const tableBody = document.getElementById("transactionList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    financeData.transactions.forEach(function(transaction) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type}-row">${transaction.type}</td>
            <td class="${transaction.type}-row">₹${transaction.amount}</td>
            <td>${transaction.date}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderIncomeSection() {
    const incomeTransactions = financeData.transactions.filter(t => t.type === "income");
    const total = incomeTransactions.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById("incomeSummary").textContent = "₹" + total;
    document.getElementById("averageIncome").textContent = "₹" + (incomeTransactions.length ? Math.round(total / incomeTransactions.length) : 0);

    const tableBody = document.getElementById("incomeList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    incomeTransactions.forEach(function(item) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.description}</td>
            <td>₹${item.amount}</td>
            <td>${item.date}</td>
            <td><button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderExpenseSection() {
    const expenseTransactions = financeData.transactions.filter(t => t.type === "expense");
    const total = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById("expenseSummary").textContent = "₹" + total;

    const categoryTotals = {};
    expenseTransactions.forEach(item => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    let topCategory = "-";
    let topValue = 0;
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        if (amount > topValue) {
            topCategory = category;
            topValue = amount;
        }
    });
    document.getElementById("topExpenseCategory").textContent = topCategory;

    const tableBody = document.getElementById("expenseList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    expenseTransactions.forEach(function(item) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.category}</td>
            <td>₹${item.amount}</td>
            <td>${item.date}</td>
            <td><button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderTransfersSection() {
    const tableBody = document.getElementById("transferList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    financeData.transfers.forEach(function(item) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.from}</td>
            <td>${item.to}</td>
            <td>₹${item.amount}</td>
            <td>${item.date}</td>
            <td><button class="delete-btn" onclick="deleteTransfer(${item.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderSavingsSection() {
    const container = document.getElementById("savingsList");
    if (!container) return;

    container.innerHTML = "";

    financeData.savings.forEach(function(item) {
        const progress = Math.min(100, Math.round((item.saved / item.target) * 100));
        const box = document.createElement("div");
        box.className = "panel-box";
        box.innerHTML = `
            <h3>${item.name}</h3>
            <p>Saved: ₹${item.saved} / ₹${item.target}</p>
            <div class="progress-box">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
            </div>
            <div class="inline-actions">
                <button class="delete-btn" onclick="deleteSavingsGoal(${item.id})">Delete</button>
            </div>
        `;
        container.appendChild(box);
    });
}

function renderBudgetsSection() {
    const container = document.getElementById("budgetList");
    if (!container) return;

    container.innerHTML = "";

    financeData.budgets.forEach(function(item) {
        const progress = Math.min(100, Math.round((item.spent / item.limit) * 100));
        const card = document.createElement("div");
        card.className = "panel-box";
        card.innerHTML = `
            <h3>${item.category}</h3>
            <p>Spent: ₹${item.spent} / ₹${item.limit}</p>
            <div class="progress-box">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
            </div>
            <div class="inline-actions">
                <button class="delete-btn" onclick="deleteBudget(${item.id})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderReports() {
    const totalIncome = financeData.transactions.filter(t => t.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = financeData.transactions.filter(t => t.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    const totalTransfers = financeData.transfers.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = financeData.savings.reduce((sum, item) => sum + item.saved, 0);

    document.getElementById("netBalanceReport").textContent = "₹" + (totalIncome - totalExpense);
    document.getElementById("monthlySavingsReport").textContent = "₹" + (totalIncome - totalExpense - totalTransfers);
    document.getElementById("reportIncomeValue").textContent = "₹" + totalIncome;
    document.getElementById("reportExpenseValue").textContent = "₹" + totalExpense;
    document.getElementById("reportTransferValue").textContent = "₹" + totalTransfers;
    document.getElementById("reportSavingsValue").textContent = "₹" + totalSavings;
}

function renderAll() {
    renderDashboard();
    renderIncomeSection();
    renderExpenseSection();
    renderTransfersSection();
    renderSavingsSection();
    renderBudgetsSection();
    renderReports();
}

document.querySelectorAll(".sidebar-btn").forEach(function(button) {
    button.addEventListener("click", function() {
        showSection(button.dataset.section);
    });
});

document.getElementById("showLoginBtn").addEventListener("click", function() {
    setAuthMode("login");
});

document.getElementById("showSignupBtn").addEventListener("click", function() {
    setAuthMode("signup");
});

document.querySelectorAll("[data-mode]").forEach(function(button) {
    button.addEventListener("click", function() {
        setAuthMode(button.dataset.mode);
    });
});

document.getElementById("signupForm").addEventListener("submit", registerUser);
document.getElementById("resetForm").addEventListener("submit", resetPassword);
document.getElementById("loginForm").addEventListener("submit", loginUser);
document.getElementById("logoutBtn").addEventListener("click", logoutUser);
document.getElementById("profileToggle").addEventListener("click", function() {
    document.getElementById("profilePanel").classList.toggle("hidden");
});

if (currentUser) {
    loadFinanceState();
}

renderAppState();
setAuthMode("login");
