// ==========================================
// 11. INISIALISASI APLIKASI
// ==========================================

function initApp() {

    // Menghubungkan tombol PILIH KAMAR INI
    document.querySelectorAll(".btn-select")
        .forEach(button => {

            button.addEventListener("click", function() {

                const selectedRoom = this.dataset.room;

                selectRoomFromMenu(selectedRoom);

            });

        });

    // Menampilkan nomor kamar tersedia
    updateRoomOptions();

    // Menampilkan status kamar
    renderRoomStatus();

    // Menampilkan daftar tamu
    renderGuestList();

    // Menghitung harga awal
    calculatePrice();

    // Menampilkan tahun otomatis
    document.getElementById("currentYear").textContent =
        new Date().getFullYear();

}

// Jalankan aplikasi
initApp();
