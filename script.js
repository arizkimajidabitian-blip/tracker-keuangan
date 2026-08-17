// URL Web App GAS Kamu
const GAS_URL = "https://script.google.com/macros/s/AKfycbxiKAmbyy46MbzVwSYkDtXPofa8TYOJlKaG8_MRESjxxI2Zb-v1uaLCMKvc4upfC7vArg/exec";

let listTransaksi = [];

document.getElementById("btnSync").addEventListener("click", fetchGmailData);

async function fetchGmailData() {
  const btn = document.getElementById("btnSync");
  btn.innerText = "⏳ Memproses Data...";
  btn.disabled = true;

  try {
    // Gunakan method GET dengan mode cors & redirect follow
    const response = await fetch(GAS_URL, {
      method: "GET",
      mode: "cors",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data berhasil ditarik:", data);

    listTransaksi = data;
    updateUI();
  } catch (err) {
    alert("Gagal mengambil data dari Gmail! Tekan F12 -> Cek tab Console untuk detail error.");
    console.error("Detail Error Tarik Data:", err);
  } finally {
    btn.innerText = "🔄 Tarik Data Otomatis (Gmail)";
    btn.disabled = false;
  }
}

function updateUI() {
  let totalMasuk = 0;
  let totalKeluar = 0;
  const listContainer = document.getElementById("riwayatList");
  
  if (!listContainer) return;
  listContainer.innerHTML = "";

  if (listTransaksi.length === 0) {
    listContainer.innerHTML = "<p style='text-align:center; color:#64748b;'>Belum ada transaksi ditemukan.</p>";
  }

  listTransaksi.forEach(tx => {
    if (tx.jenis === "masuk") {
      totalMasuk += tx.jumlah;
    } else {
      totalKeluar += tx.jumlah;
    }

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
