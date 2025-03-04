document.getElementById("add-sale-btn").addEventListener("click", function() {
    document.getElementById("modal").style.display = "block";
});

document.querySelector(".close-btn").addEventListener("click", function() {
    document.getElementById("modal").style.display = "none";
});

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("edit-btn")) {
        const row = event.target.closest("tr");
        const cells = row.querySelectorAll("td");

        document.getElementById("date").value = cells[0].textContent;
        document.getElementById("client").value = cells[1].textContent;
        document.getElementById("product").value = cells[2].textContent;
        document.getElementById("total").value = cells[3].textContent;
        document.getElementById("installments").value = cells[4].textContent;
        document.getElementById("seller").value = cells[5].textContent;
        document.getElementById("payment-frequency").value = 30; // default value

        document.getElementById("cancel-payment-btn").style.display = "block";
        document.getElementById("modal").style.display = "block";
        row.setAttribute("data-editing", "true");
    }

    if (event.target.classList.contains("pay-btn")) {
        const row = event.target.closest("tr");
        const progressCell = row.children[8];
        const totalPaidCell = row.children[10];
        const total = parseFloat(row.children[3].textContent);
        const installments = parseInt(row.children[4].textContent);
        const installmentValue = total / installments;

        let totalPaid = parseFloat(totalPaidCell.textContent) || 0;
        totalPaid += installmentValue;

        totalPaidCell.textContent = totalPaid.toFixed(2);
        let progress = (totalPaid / total) * 100;
        progressCell.textContent = `${progress.toFixed(0)}%`;

        if (progress >= 100) {
            row.children[7].textContent = "Pagado";
        }

        saveSalesData();
    }
});

document.getElementById("cancel-payment-btn").addEventListener("click", function() {
    const tableBody = document.getElementById("sales-table-body");
    const editingRow = tableBody.querySelector("[data-editing='true']");

    if (editingRow) {
        const totalPaidCell = editingRow.children[10];
        const progressCell = editingRow.children[8];

        let totalPaid = parseFloat(totalPaidCell.textContent) || 0;
        const total = parseFloat(editingRow.children[3].textContent);
        const installments = parseInt(editingRow.children[4].textContent);
        const installmentValue = total / installments;

        if (totalPaid >= installmentValue) {
            totalPaid -= installmentValue;
            totalPaidCell.textContent = totalPaid.toFixed(2);
            
            let progress = (totalPaid / total) * 100;
            progressCell.textContent = `${progress.toFixed(0)}%`;

            if (progress < 100) {
                editingRow.children[7].textContent = "Pendiente";
            }

            saveSalesData();
        } else {
            alert("No se puede cancelar más pagos.");
        }
    }
});

document.getElementById("sale-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const date = document.getElementById("date").value;
    const client = document.getElementById("client").value;
    const product = document.getElementById("product").value;
    const total = document.getElementById("total").value;
    const installments = document.getElementById("installments").value;
    const seller = document.getElementById("seller").value;
    const paymentFrequency = parseInt(document.getElementById("payment-frequency").value);
    
    const nextPayment = calculateNextPayment(date, paymentFrequency);

    const tableBody = document.getElementById("sales-table-body");
    const editingRow = tableBody.querySelector("[data-editing='true']");
    
    if (editingRow) {
        editingRow.children[0].textContent = date;
        editingRow.children[1].textContent = client;
        editingRow.children[2].textContent = product;
        editingRow.children[3].textContent = total;
        editingRow.children[4].textContent = installments;
        editingRow.children[5].textContent = seller;
        editingRow.children[6].textContent = nextPayment;
        editingRow.removeAttribute("data-editing");
    } else {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${date}</td>
            <td>${client}</td>
            <td>${product}</td>
            <td>${total}</td>
            <td>${installments}</td>
            <td>${seller}</td>
            <td>${nextPayment}</td>
            <td>Pendiente</td>
            <td>0%</td>
            <td>-</td>
            <td>0</td>
            <td>
                <button class="action-btn edit-btn">Editar</button>
                <button class="action-btn pay-btn">Pago</button>
                <button class="action-btn delete-btn">Borrar</button>
            </td>
        `;
    }

    document.getElementById("modal").style.display = "none";
    document.getElementById("cancel-payment-btn").style.display = "none";
    addDeleteEventListeners();
    saveSalesData();
});

document.getElementById("total").addEventListener("input", function() {
    document.getElementById("total-value").textContent = parseFloat(this.value || 0).toFixed(2);
});

function calculateNextPayment(startDate, frequency) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + frequency);
    return date.toISOString().split('T')[0];
}

function addDeleteEventListeners() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function() {
            const row = this.closest("tr");
            row.remove();
            saveSalesData();
        });
    });
}

function saveSalesData() {
    const tableRows = document.querySelectorAll("#sales-table-body tr");
    const salesData = [];

    tableRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        salesData.push({
            date: cells[0].textContent,
            client: cells[1].textContent,
            product: cells[2].textContent,
            total: cells[3].textContent,
            installments: cells[4].textContent,
            seller: cells[5].textContent,
            nextPayment: cells[6].textContent,
            status: cells[7].textContent,
            progress: cells[8].textContent,
            nextInstallment: cells[9].textContent,
            totalPaid: cells[10].textContent
        });
    });

    localStorage.setItem("salesData", JSON.stringify(salesData));
}

function loadSalesData() {
    const salesData = JSON.parse(localStorage.getItem("salesData")) || [];
    const tableBody = document.getElementById("sales-table-body");

    salesData.forEach(sale => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.client}</td>
            <td>${sale.product}</td>
            <td>${sale.total}</td>
            <td>${sale.installments}</td>
            <td>${sale.seller}</td>
            <td>${sale.nextPayment}</td>
            <td>${sale.status}</td>
            <td>${sale.progress}</td>
            <td>${sale.nextInstallment}</td>
            <td>${sale.totalPaid}</td>
            <td>
                <button class="action-btn edit-btn">Editar</button>
                <button class="action-btn pay-btn">Pago</button>
                <button class="action-btn delete-btn">Borrar</button>
            </td>
        `;
    });

    addDeleteEventListeners();
}

document.addEventListener("DOMContentLoaded", function() {
    loadSalesData();
});