// ISI DENGAN URL WEB APP GOOGLE APPS SCRIPT KAMU
const GAS_URL = "https://script.google.com/macros/s/AKfycbxiKAmbyy46MbzVwSYkDtXPofa8TYOJlKaG8_MRESjxxI2Zb-v1uaLCMKvc4upfC7vArg/exec";

let listTransaksi = [];

// 1. NAVIGASI SWITCH PAGE (MENU BISA DIKLIK)
const navItems = document.querySelectorAll('.nav-menu .nav-item');
const pageSections = document.querySelectorAll('.page-section');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(nav => nav.classList.remove('active'));
    pageSections.forEach(sec => sec.classList.add('hidden'));

    item.classList.add('active');
    const targetId = item.getAttribute('data-target');
    document.getElementById(targetId).classList.remove('hidden');
  });
});

// 2. LOGOUT EVENT
document.getElementById('btnLogout').addEventListener('click', () => {
  alert("Berhasil Logout!");
});

// 3. TARIK DATA DARI GMAIL (APPS SCRIPT)
document.getElementById("btnSync").addEventListener("click", fetchGmailData);

async function fetchGmailData() {
  const btn = document.getElementById("btnSync");
  btn.innerText = "⏳ Memproses Data...";
  btn.disabled = true;

  try {
    const response = await fetch(GAS_URL, {
      method: "GET",
      mode: "cors",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    listTransaksi = data;
    updateUI();
  } catch (err) {
    alert("Gagal mengambil data dari Gmail! Buka Console (F12) untuk detail.");
    console.error("Detail Error Tarik Data:", err);
  } finally {
    btn.innerText = "🔄 Tarik Data Otomatis (Gmail)";
    btn.disabled = false;
  }
}

// 4. UPDATE UI DASHBOARD & RIWAYAT
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
