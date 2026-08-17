const URL_API_GAS = "https://script.google.com/macros/s/AKfycbxiKAmbyy46MbzVwSYkDtXPofa8TYOJlKaG8_MRESjxxI2Zb-v1uaLCMKvc4upfC7vArg/exec";

let transaksi = JSON.parse(localStorage.getItem('dataTransaksi')) || [];

// Logika Autentikasi Login
document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === '12345') {
        localStorage.setItem('isLoggedIn', 'true');
        checkLoginState();
    } else {
        alert('Username atau Password salah bre!');
    }
});

function checkLoginState() {
    const isLogged = localStorage.getItem('isLoggedIn');
    if (isLogged === 'true') {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        updateUI();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    checkLoginState();
}

// Navigasi Tab Sidebar
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// Format & UI Rendering
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
}

function updateUI() {
    const listTransaksi = document.getElementById('list-transaksi');
    listTransaksi.innerHTML = '';
    let totalMasuk = 0, totalKeluar = 0;

    transaksi.forEach((trx, index) => {
        if (trx.jenis === 'masuk') totalMasuk += trx.jumlah;
        else totalKeluar += trx.jumlah;

        const li = document.createElement('li');
        li.classList.add('item-transaksi', trx.jenis === 'masuk' ? 'border-masuk' : 'border-keluar');
        li.innerHTML = `
            <div>
                <strong>${trx.keterangan}</strong> <br>
                <span class="badge">${trx.sumber}</span>
                <small style="color: #6b7280; margin-left: 5px;">${trx.tanggal}</small>
            </div>
            <div style="text-align: right;">
                <span style="color: ${trx.jenis === 'masuk' ? '#10b981' : '#ef4444'}; font-weight: bold;">
                    ${trx.jenis === 'masuk' ? '+' : '-'}${formatRupiah(trx.jumlah)}
                </span> <br>
                <button class="delete-btn" onclick="hapusTransaksi(${index})">Hapus</button>
            </div>
        `;
        listTransaksi.appendChild(li);
    });

    document.getElementById('total-saldo').innerText = formatRupiah(totalMasuk - totalKeluar);
    document.getElementById('total-masuk').innerText = formatRupiah(totalMasuk);
    document.getElementById('total-keluar').innerText = formatRupiah(totalKeluar);
}

// Fitur Sinkronisasi Gmail API
async function sinkronisasiGmail() {
    const btnSync = document.getElementById('btn-sync');
    btnSync.innerText = "⏳ Sedang menarik data...";
    btnSync.disabled = true;

    try {
        const response = await fetch(URL_API_GAS, { method: 'GET', redirect: 'follow' });
        const dataBaru = await response.json();

        if (Array.isArray(dataBaru) && dataBaru.length > 0) {
            transaksi = [...dataBaru, ...transaksi];
            localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));
            updateUI();
            alert(`Berhasil menarik ${dataBaru.length} transaksi dari BRI!`);
        } else {
            alert("Tidak ada transaksi BRI baru.");
        }
    } catch (error) {
        alert("Gagal menarik data.");
        console.error(error);
    } finally {
        btnSync.innerText = "🔄 Tarik Data Otomatis (Gmail BRI)";
        btnSync.disabled = false;
    }
}

// Input & Hapus Manual
document.getElementById('form-transaksi').addEventListener('submit', function(e) {
    e.preventDefault();
    transaksi.push({
        keterangan: document.getElementById('keterangan').value,
        jumlah: parseInt(document.getElementById('jumlah').value),
        jenis: document.getElementById('jenis').value,
        sumber: document.getElementById('sumber').value,
        tanggal: new Date().toLocaleDateString('id-ID')
    });
    localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));
    this.reset();
    updateUI();
    alert('Transaksi berhasil disimpan!');
});

function hapusTransaksi(index) {
    transaksi.splice(index, 1);
    localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));
    updateUI();
}

// Import CSV
function prosesCSV() {
    const file = document.getElementById('file-csv').files[0];
    if (!file) return alert('Pilih file CSV dulu, bre!');

    const reader = new FileReader();
    reader.onload = function(e) {
        const baris = e.target.result.split('\n');
        let count = 0;
        baris.forEach(row => {
            const k = row.split(',');
            if (k.length >= 4 && !isNaN(parseInt(k[1]))) {
                transaksi.push({
                    keterangan: k[0].trim(),
                    jumlah: parseInt(k[1].trim()),
                    jenis: k[2].trim().toLowerCase(),
                    sumber: k[3].trim(),
                    tanggal: new Date().toLocaleDateString('id-ID')
                });
                count++;
            }
        });
        localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));
        updateUI();
        alert(`Mantap! ${count} data berhasil di-import.`);
    };
    reader.readAsText(file);
}

// Inisialisasi Aplikasi
checkLoginState();
