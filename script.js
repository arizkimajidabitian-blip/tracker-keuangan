const form = document.getElementById('form-transaksi');
const inputKeterangan = document.getElementById('keterangan');
const inputJumlah = document.getElementById('jumlah');
const inputJenis = document.getElementById('jenis');
const inputSumber = document.getElementById('sumber');
const listTransaksi = document.getElementById('list-transaksi');

// NANTI KITA ISI LINK INI SETELAH GOOGLE APPS SCRIPT SELESAI
const URL_API_GAS = "ISI_LINK_WEB_APP_GAS_DI_SINI_NANTI";

// Tarik data dari LocalStorage, kalau kosong bikin array kosong []
let transaksi = JSON.parse(localStorage.getItem('dataTransaksi')) || [];

// Fungsi format rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
}

// Fungsi update tampilan UI
function updateUI() {
    listTransaksi.innerHTML = '';
    let totalMasuk = 0;
    let totalKeluar = 0;

    transaksi.forEach((trx, index) => {
        if (trx.jenis === 'masuk') {
            totalMasuk += trx.jumlah;
        } else {
            totalKeluar += trx.jumlah;
        }

        const li = document.createElement('li');
        li.classList.add('item-transaksi');
        li.classList.add(trx.jenis === 'masuk' ? 'border-masuk' : 'border-keluar');
        
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

    const totalSaldo = totalMasuk - totalKeluar;
    document.getElementById('total-saldo').innerText = formatRupiah(totalSaldo);
    document.getElementById('total-masuk').innerText = formatRupiah(totalMasuk);
    document.getElementById('total-keluar').innerText = formatRupiah(totalKeluar);
}

// Fungsi Tarik Data dari Gmail (Google Apps Script)
async function sinkronisasiGmail() {
    const btnSync = document.getElementById('btn-sync');
    
    if (URL_API_GAS === "ISI_LINK_WEB_APP_GAS_DI_SINI_NANTI") {
        alert("Sabar bre! Kita harus selesain settingan Google Apps Script dulu buat dapet link API-nya.");
        return;
    }

    btnSync.innerText = "⏳ Sedang menarik data...";
    btnSync.disabled = true;

    try {
        const response = await fetch(URL_API_GAS);
        const dataBaru = await response.json();

        if (dataBaru.length > 0) {
            transaksi = [...dataBaru, ...transaksi];
            localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));
            updateUI();
            alert(`Berhasil menarik ${dataBaru.length} transaksi baru dari email BRI!`);
        } else {
            alert("Tidak ada transaksi baru di email hari ini.");
        }
    } catch (error) {
        alert("Gagal menarik data. Pastikan link API benar dan internet stabil.");
        console.error(error);
    } finally {
        btnSync.innerText = "🔄 Tarik Data Otomatis (Gmail BRI)";
        btnSync.disabled = false;
    }
}

// Fungsi submit form manual
form.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const dataBaru = {
        keterangan: inputKeterangan.value,
        jumlah: parseInt(inputJumlah.value),
        jenis: inputJenis.value,
        sumber: inputSumber.value,
        tanggal: new Date().toLocaleDateString('id-ID')
    };

    transaksi.push(dataBaru);
    localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));

    inputKeterangan.value = '';
    inputJumlah.value = '';

    updateUI(); 
});

// Fungsi hapus transaksi
function hapusTransaksi(index) {
    transaksi.splice(index, 1); 
    localStorage.setItem('dataTransaksi', JSON.stringify(transaksi)); 
    updateUI(); 
}

// Fitur Import CSV
function prosesCSV() {
    const fileInput = document.getElementById('file-csv');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Pilih file CSV dulu, bre!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const baris = text.split('\n');
        let jumlahDitambahkan = 0;

        baris.forEach(row => {
            const kolom = row.split(',');
            if (kolom.length >= 4) {
                const dataBaru = {
                    keterangan: kolom[0].trim(),
                    jumlah: parseInt(kolom[1].trim()),
                    jenis: kolom[2].trim().toLowerCase(),
                    sumber: kolom[3].trim(),
                    tanggal: new Date().toLocaleDateString('id-ID')
                };
                if (!isNaN(dataBaru.jumlah)) {
                    transaksi.push(dataBaru);
                    jumlahDitambahkan++;
                }
            }
        });

        localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));
        updateUI();
        alert(`Mantap! ${jumlahDitambahkan} transaksi berhasil di-import.`);
        fileInput.value = ""; 
    };
    reader.readAsText(file);
}

// Jalankan pertama kali saat web dibuka
updateUI();
