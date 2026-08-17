// GANTI DENGAN URL APPS SCRIPT WE BAPP KAMU
const GAS_URL = "URL_WEB_APP_APPS_SCRIPT_KAMU_DI_SINI";

let listTransaksi = [];

document.getElementById("btnSync").addEventListener("click", fetchGmailData);

async function fetchGmailData() {
  const btn = document.getElementById("btnSync");
  btn.innerText = "⏳ Memproses Data...";
  btn.disabled = true;

  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    listTransaksi = data;
    updateUI();
  } catch (err) {
    alert("Gagal mengambil data dari Gmail!");
    console.error(err);
  } finally {
    btn.innerText = "🔄 Tarik Data Otomatis (Gmail)";
    btn.disabled = false;
  }
}

function updateUI() {
  let totalMasuk = 0;
  let totalKeluar = 0;
  const listContainer = document.getElementById("riwayatList");
  listContainer.innerHTML = "";

  listTransaksi.forEach(tx => {
    if (tx.jenis === "masuk") {
      totalMasuk += tx.jumlah;
    } else {
      totalKeluar += tx.jumlah;
    }

    // Render baris riwayat
    const item = document.createElement("div");
    item.className = `tx-item ${tx.jenis}`;
    item.innerHTML = `
      <div class="tx-info">
        <div class="tx-title">${tx.keterangan}</div>
        <div class="tx-meta"><span>${tx.sumber}</span> • ${tx.tanggal}</div>
      </div>
      <div class="tx-amount ${tx.jenis}">
        ${tx.jenis === "masuk" ? "+" : "-"}Rp ${tx.jumlah.toLocaleString("id-ID")}
      </div>
    `;
    listContainer.appendChild(item);
  });

  const totalSaldo = totalMasuk - totalKeluar;

  document.getElementById("totalSaldoDisplay").innerText = `Rp ${totalSaldo.toLocaleString("id-ID")}`;
  document.getElementById("pemasukanDisplay").innerText = `Rp ${totalMasuk.toLocaleString("id-ID")}`;
  document.getElementById("pengeluaranDisplay").innerText = `Rp ${totalKeluar.toLocaleString("id-ID")}`;
}
