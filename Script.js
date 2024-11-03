document.addEventListener("DOMContentLoaded", function () {
  const balanceElement = document.getElementById("balance");
  const transactionsElement = document.getElementById("transactions");
  const billsListElement = document.getElementById("bills-list");
  const form = document.getElementById("transaction-form");
  const billForm = document.getElementById("bill-form");

  let transactions = [];
  let bills = [];
  let totalBalance = 0;

  // Minta izin notifikasi saat halaman dimuat
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      console.log(permission); // Tampilkan status izin di console
    });
  }

  // Ambil transaksi dan tagihan dari Local Storage saat halaman dimuat
  function loadData() {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions"));
    const storedBills = JSON.parse(localStorage.getItem("bills"));

    if (storedTransactions) {
      transactions = storedTransactions;
    }
    if (storedBills) {
      bills = storedBills;
    }
  }

  // Simpan transaksi dan tagihan ke Local Storage
  function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("bills", JSON.stringify(bills));
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    const transaction = {
      id: Date.now(),
      description,
      amount,
      category,
    };

    transactions.push(transaction);
    saveData(); // Simpan transaksi setelah ditambahkan
    updateTransactions();
    form.reset();
  });

  billForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const billDescription = document.getElementById("bill-description").value;
    const billAmount = parseFloat(document.getElementById("bill-amount").value);

    const bill = {
      id: Date.now(),
      description: billDescription,
      amount: billAmount,
    };

    bills.push(bill);
    saveData(); // Simpan tagihan setelah ditambahkan
    updateBills();
    billForm.reset();
  });

  function sendNotification(message) {
    if (Notification.permission === "granted") {
      new Notification("Peringatan Saldo", {
        body: message,
        icon: "https://via.placeholder.com/150" // URL ikon notifikasi opsional
      });
    }
  }

  function updateTransactions() {
    transactionsElement.innerHTML = "";
    totalBalance = 0;

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");

      const descriptionCell = document.createElement("td");
      descriptionCell.textContent = transaction.description;

      const amountCell = document.createElement("td");
      amountCell.textContent = `Rp ${transaction.amount.toLocaleString()}`;

      const categoryCell = document.createElement("td");
      categoryCell.textContent = transaction.category;
      categoryCell.style.color = transaction.category === "income" ? "#28a745" : "#dc3545";

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Hapus";
      deleteButton.addEventListener("click", function () {
        transactions = transactions.filter((t) => t.id !== transaction.id);
        saveData(); // Simpan perubahan setelah menghapus
        updateTransactions();
      });
      deleteCell.appendChild(deleteButton);

      row.appendChild(descriptionCell);
      row.appendChild(amountCell);
      row.appendChild(categoryCell);
      row.appendChild(deleteCell);
      transactionsElement.appendChild(row);

      // Update saldo berdasarkan jenis transaksi
      if (transaction.category === "income") {
        totalBalance += transaction.amount;
      } else {
        totalBalance -= transaction.amount;

        // Kirim notifikasi jika pengurangan saldo mencapai Rp50.000 atau lebih
        if (transaction.amount >= 50000) {
          sendNotification(`Saldo berkurang Rp${transaction.amount.toLocaleString()} untuk ${transaction.description}`);
        }
      }
    });

    balanceElement.textContent = `Rp ${totalBalance.toLocaleString()}`;
  }

  function updateBills() {
    billsListElement.innerHTML = "";

    bills.forEach((bill) => {
      const billItem = document.createElement("li");
      billItem.textContent = `${bill.description}: Rp ${bill.amount.toLocaleString()}`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Hapus";
      deleteButton.addEventListener("click", function () {
        bills = bills.filter((b) => b.id !== bill.id);
        saveData(); // Simpan perubahan setelah menghapus
        updateBills();
      });
      billItem.appendChild(deleteButton);
      billsListElement.appendChild(billItem);
    });
  }

  // Muat data dari Local Storage saat halaman dimuat
  loadData();
  updateTransactions();
  updateBills();
});
