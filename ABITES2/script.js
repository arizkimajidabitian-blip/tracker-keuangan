const form = document.getElementById('form-transaksi');
const inputKeterangan = document.getElementById('keterangan');
const inputJumlah = document.getElementById('jumlah');
const inputJenis = document.getElementById('jenis');
const inputSumber = document.getElementById('sumber');
const listTransaksi = document.getElementById('list-transaksi');

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
        // Hitung total masuk dan keluar
        if (trx.jenis === 'masuk') {
            totalMasuk += trx.jumlah;
        } else {
            totalKeluar += trx.jumlah;
        }

        // Buat elemen list HTML
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
                <button class="delete-btn" onclick="hapusTransaksi(${index})" style="margin-top: 5px;">Hapus</button>
            </div>
        `;
        listTransaksi.appendChild(li);
    });

    // Update teks Total Saldo
    const totalSaldo = totalMasuk - totalKeluar;
    document.getElementById('total-saldo').innerText = formatRupiah(totalSaldo);
    document.getElementById('total-masuk').innerText = formatRupiah(totalMasuk);
    document.getElementById('total-keluar').innerText = formatRupiah(totalKeluar);
}

// Fungsi submit form
form.addEventListener('submit', function(e) {
    e.preventDefault(); // Cegah halaman reload
    
    const dataBaru = {
        keterangan: inputKeterangan.value,
        jumlah: parseInt(inputJumlah.value),
        jenis: inputJenis.value,
        sumber: inputSumber.value,
        tanggal: new Date().toLocaleDateString('id-ID')
    };

    // Masukkan ke array dan simpan ke LocalStorage
    transaksi.push(dataBaru);
    localStorage.setItem('dataTransaksi', JSON.stringify(transaksi));

    // Bersihkan input
    inputKeterangan.value = '';
    inputJumlah.value = '';

    updateUI(); // Refresh tampilan
});

// Fungsi hapus transaksi
function hapusTransaksi(index) {
    transaksi.splice(index, 1); // Hapus 1 data berdasarkan index
    localStorage.setItem('dataTransaksi', JSON.stringify(transaksi)); // Update storage
    updateUI(); // Refresh tampilan
}

// Jalankan pertama kali saat web dibuka
updateUI();