// ==========================================
// 11. INISIALISASI APLIKASI
// ==========================================

function initApp() {

    // Menghubungkan tombol PILIH KAMAR INI
    const selectButtons = document.querySelectorAll(".btn-select");

    selectButtons.forEach(button => {

        button.addEventListener("click", function() {

            // Mengambil tipe kamar yang dipilih
            const selectedRoom = this.dataset.room;

            // Memasukkan kamar ke formulir
            selectRoomFromMenu(selectedRoom);

        });

    });


    // Menampilkan nomor kamar yang tersedia
    updateRoomOptions();


    // Menampilkan status ketersediaan kamar
    renderRoomStatus();


    // Menampilkan daftar tamu menginap
    renderGuestList();


    // Menghitung harga awal
    calculatePrice();


    // Menampilkan tahun otomatis
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

}


// ==========================================
// MENJALANKAN APLIKASI
// ==========================================

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", initApp);

} else {

    initApp();

}
