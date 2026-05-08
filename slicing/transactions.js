document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("entryForm");
  var title = document.getElementById("entryTitle");
  var submitBtn = document.getElementById("submitEntryBtn");
  var cancelBtn = document.getElementById("cancelEditBtn");
  var table = document.getElementById("transactionTable");
  var deleteModal = document.getElementById("deleteModal");
  var deleteYesBtn = document.getElementById("deleteYesBtn");
  var deleteNoBtn = document.getElementById("deleteNoBtn");

  if (!form || !title || !submitBtn || !cancelBtn || !table || !deleteModal || !deleteYesBtn || !deleteNoBtn) {
    return;
  }

  var dateInput = document.getElementById("trxDate");
  var categoryInput = document.getElementById("trxCategory");
  var amountInput = document.getElementById("trxAmount");
  var noteInput = document.getElementById("trxNote");
  var editingRow = null;
  var pendingDeleteRow = null;

  function openDeleteModal(row) {
    pendingDeleteRow = row;
    deleteModal.hidden = false;
    document.body.classList.add("modal-open");
    deleteYesBtn.focus();
  }

  function closeDeleteModal() {
    deleteModal.hidden = true;
    document.body.classList.remove("modal-open");
    pendingDeleteRow = null;
  }

  function formatIdr(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function formatDisplayDate(isoDate) {
    var parts = isoDate.split("-");
    if (parts.length !== 3) {
      return isoDate;
    }

    var monthMap = {
      "01": "Jan",
      "02": "Feb",
      "03": "Mar",
      "04": "Apr",
      "05": "Mei",
      "06": "Jun",
      "07": "Jul",
      "08": "Agu",
      "09": "Sep",
      "10": "Okt",
      "11": "Nov",
      "12": "Des"
    };

    return parts[2] + " " + (monthMap[parts[1]] || parts[1]) + " " + parts[0];
  }

  function clearEditState() {
    if (editingRow) {
      editingRow.classList.remove("is-editing");
    }

    editingRow = null;
    title.textContent = "Input Cepat";
    submitBtn.textContent = "Simpan Transaksi";
    cancelBtn.hidden = true;
    form.reset();
  }

  function startEdit(row) {
    if (editingRow) {
      editingRow.classList.remove("is-editing");
    }

    editingRow = row;
    editingRow.classList.add("is-editing");

    dateInput.value = row.dataset.date || "";
    categoryInput.value = row.dataset.category || "";
    amountInput.value = row.dataset.amount || "";
    noteInput.value = row.dataset.note || "";

    title.textContent = "Ubah Transaksi";
    submitBtn.textContent = "Simpan Perubahan";
    cancelBtn.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  table.addEventListener("click", function (event) {
    var editBtn = event.target.closest(".edit-btn");
    if (editBtn) {
      var row = editBtn.closest("tr");
      if (row) {
        startEdit(row);
      }
      return;
    }

    var deleteBtn = event.target.closest(".delete-btn");
    if (deleteBtn) {
      var deleteRow = deleteBtn.closest("tr");
      if (!deleteRow) {
        return;
      }

      openDeleteModal(deleteRow);
    }
  });

  deleteYesBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (!pendingDeleteRow) {
      closeDeleteModal();
      return;
    }

    if (pendingDeleteRow === editingRow) {
      clearEditState();
    }

    if (pendingDeleteRow.parentNode) {
      pendingDeleteRow.remove();
    }
    closeDeleteModal();
  });

  deleteNoBtn.addEventListener("click", function (event) {
    event.preventDefault();
    closeDeleteModal();
  });

  deleteModal.addEventListener("click", function (event) {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !deleteModal.hidden) {
      closeDeleteModal();
    }
  });

  cancelBtn.addEventListener("click", function () {
    clearEditState();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!editingRow) {
      return;
    }

    var date = dateInput.value;
    var category = categoryInput.value;
    var note = noteInput.value.trim();
    var amountNumber = Math.max(0, Math.round(Number(amountInput.value || 0)));

    var dateCell = editingRow.children[0];
    var categoryCell = editingRow.children[1];
    var noteCell = editingRow.children[2];
    var amountCell = editingRow.children[3];

    var isIncome = category === "income";

    dateCell.textContent = formatDisplayDate(date);
    noteCell.textContent = note;
    amountCell.textContent = (isIncome ? "+Rp" : "-Rp") + formatIdr(amountNumber);
    amountCell.classList.toggle("pos", isIncome);
    amountCell.classList.toggle("neg", !isIncome);

    categoryCell.innerHTML = "";
    var tag = document.createElement("span");
    tag.className = "tag " + (isIncome ? "in" : "out");
    tag.textContent = isIncome ? "Pendapatan" : "Pengeluaran";
    categoryCell.appendChild(tag);

    editingRow.dataset.date = date;
    editingRow.dataset.category = category;
    editingRow.dataset.note = note;
    editingRow.dataset.amount = String(amountNumber);

    clearEditState();
  });
});
