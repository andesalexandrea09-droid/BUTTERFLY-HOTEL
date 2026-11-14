// ==========================================
// BUTTERFLY HOTEL - JAVASCRIPT
// SISTEM RESERVASI DAN MANAJEMEN KAMAR
// ==========================================


// ==========================================
// 1. DATA KAMAR HOTEL
// ==========================================

const rooms = [
    {
        number: 101,
        type: "Standard",
        name: "Standard Butterfly",
        price: 350000,
        status: "Tersedia"
    },
    {
        number: 102,
        type: "Standard",
        name: "Standard Butterfly",
        price: 350000,
        status: "Tersedia"
    },
    {
        number: 201,
        type: "Deluxe",
        name: "Deluxe Monarch",
        price: 650000,
        status: "Tersedia"
    },
    {
        number: 202,
        type: "Deluxe",
        name: "Deluxe Monarch",
        price: 650000,
        status: "Tersedia"
    },
    {
        number: 301,
        type: "Suite",
        name: "Royal Butterfly Suite",
        price: 1250000,
        status: "Tersedia"
    }
];

let activeGuests = [];
let currentCalculatedTotal = 0;
let nextGuestId = 1;


// ==========================================
// 2. FORMAT RUPIAH
// ==========================================

function formatRupiah(amount) {
    return "Rp " + Math.round(amount).toLocaleString("id-ID");
}


// ==========================================
// 3. MEMILIH KAMAR DARI KATALOG
// ==========================================

function selectRoomFromMenu(roomType) {

    const roomSelect = document.getElementById("roomType");

    roomSelect.value = roomType;

    updateRoomOptions();
    calculatePrice();

    document.getElementById("bookingSection")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    document.getElementById("guestName").focus({
        preventScroll: true
    });
}


// ==========================================
// 4. MENGHITUNG TOTAL PEMBAYARAN
// ==========================================

function calculatePrice() {

    const roomSelect = document.getElementById("roomType");

    const selectedOption =
        roomSelect.options[roomSelect.selectedIndex];

    const basePrice = Number(
        selectedOption.getAttribute("data-price")
    );

    const selectedPackage = document.querySelector(
        'input[name="package"]:checked'
    );

    const packagePrice = selectedPackage
        ? Number(selectedPackage.value)
        : 0;

    const nights = Math.max(
        1,
        parseInt(document.getElementById("nights").value) || 1
    );

    // Menghitung harga kamar
    const totalBase = basePrice * nights;

    // Menghitung paket tambahan
    const totalPackage = packagePrice * nights;

    // Total sebelum diskon
    const subtotal = totalBase + totalPackage;

    // Diskon long stay 10%
    let discount = 0;

    const promoNote = document.getElementById("promoNote");

    if (nights >= 3) {

        discount = subtotal * 0.10;

        promoNote.textContent =
            "Selamat! Anda mendapatkan diskon Long-Stay 10%!";

        promoNote.classList.add("active");

    } else {

        promoNote.textContent =
            "Promo: Menginap minimal 3 malam otomatis diskon 10%!";

        promoNote.classList.remove("active");
    }

    // Total akhir
    currentCalculatedTotal = subtotal - discount;

    // Menampilkan rincian pembayaran
    document.getElementById("summaryNights").textContent = nights;

    document.getElementById("summaryBasePrice").textContent =
        formatRupiah(totalBase);

    document.getElementById("summaryPackagePrice").textContent =
        formatRupiah(totalPackage);

    document.getElementById("summaryDiscount").textContent =
        "- " + formatRupiah(discount);

    document.getElementById("summaryTotal").textContent =
        formatRupiah(currentCalculatedTotal);
}


// ==========================================
// 5. UPDATE PILIHAN NOMOR KAMAR
// ==========================================

function updateRoomOptions() {

    const selectedType =
        document.getElementById("roomType").value;

    const roomSelect =
        document.getElementById("roomNumber");

    const previousValue = roomSelect.value;

    roomSelect.innerHTML = "";

    const availableRooms = rooms.filter(room =>
        room.type === selectedType &&
        room.status === "Tersedia"
    );

    if (availableRooms.length === 0) {

        const option = document.createElement("option");

        option.value = "";
        option.textContent = "Kamar sedang penuh";

        roomSelect.appendChild(option);

        return;
    }

    availableRooms.forEach(room => {

        const option = document.createElement("option");

        option.value = room.number;

        option.textContent =
            "Kamar " + room.number;

        roomSelect.appendChild(option);

    });

    // Mempertahankan pilihan sebelumnya jika masih tersedia
    if (availableRooms.some(room =>
        String(room.number) === previousValue
    )) {
        roomSelect.value = previousValue;
    }
}


// ==========================================
// 6. MENAMPILKAN STATUS KAMAR
// ==========================================

function renderRoomStatus() {

    const tbody =
        document.getElementById("roomStatusList");

    tbody.innerHTML = "";

    rooms.forEach(room => {

        const tr = document.createElement("tr");

        const statusClass =
            room.status === "Tersedia"
                ? "badge-available"
                : "badge-booked";

        tr.innerHTML = `
            <td><strong>${room.number}</strong></td>
            <td>${room.name}</td>
            <td>${formatRupiah(room.price)}</td>
            <td>
                <span class="badge ${statusClass}">
                    ${room.status}
                </span>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


// ==========================================
// 7. MENAMPILKAN DAFTAR TAMU
// ==========================================

function renderGuestList() {

    const tbody =
        document.getElementById("guestListTable");

    tbody.innerHTML = "";

    if (activeGuests.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Belum ada tamu yang melakukan reservasi.
                </td>
            </tr>
        `;

        return;
    }

    activeGuests.forEach(guest => {

        const tr = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = guest.name;

        const roomCell = document.createElement("td");
        roomCell.textContent =
            `Kamar ${guest.roomNumber} (${guest.roomName})`;

        const packageCell = document.createElement("td");
        packageCell.textContent = guest.packageName;

        const nightsCell = document.createElement("td");
        nightsCell.textContent = guest.nights + " Malam";

        const priceCell = document.createElement("td");

        const priceStrong = document.createElement("strong");
        priceStrong.textContent = formatRupiah(guest.totalPrice);

        priceCell.appendChild(priceStrong);

        const actionCell = document.createElement("td");

        const checkoutButton = document.createElement("button");

        checkoutButton.type = "button";
        checkoutButton.className = "btn-checkout";
        checkoutButton.textContent = "Check-Out";

        checkoutButton.addEventListener("click", () => {
            checkOut(guest.id);
        });

        actionCell.appendChild(checkoutButton);

        tr.append(
            nameCell,
            roomCell,
            packageCell,
            nightsCell,
            priceCell,
            actionCell
        );

        tbody.appendChild(tr);
    });
}


// ==========================================
// 8. PROSES CHECK-OUT
// ==========================================

function checkOut(guestId) {

    const guestIndex = activeGuests.findIndex(
        guest => guest.id === guestId
    );

    if (guestIndex === -1) return;

    const guest = activeGuests[guestIndex];

    const confirmation = confirm(
        "Apakah Anda yakin ingin melakukan check-out?\n\n" +
        "Nama: " + guest.name +
        "\nKamar: " + guest.roomNumber
    );

    if (!confirmation) return;

    const room = rooms.find(
        room => room.number === guest.roomNumber
    );

    if (room) {
        room.status = "Tersedia";
    }

    activeGuests.splice(guestIndex, 1);

    updateRoomOptions();
    renderRoomStatus();
    renderGuestList();
    calculatePrice();

    alert(
        "Check-out berhasil!\n" +
        "Terima kasih telah menginap di BUTTERFLY HOTEL."
    );
}


// ==========================================
// 9. PROSES PEMESANAN KAMAR
// ==========================================

document.getElementById("bookingForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("guestName").value.trim();

        const roomType =
            document.getElementById("roomType").value;

        const roomNumber =
            Number(document.getElementById("roomNumber").value);

        const nights =
            parseInt(document.getElementById("nights").value);

        const selectedPackage = document.querySelector(
            'input[name="package"]:checked'
        );

        // Validasi nama
        if (!name) {
            alert("Silakan masukkan nama lengkap tamu.");
            return;
        }

        // Validasi durasi
        if (!Number.isInteger(nights) || nights < 1) {
            alert("Durasi menginap minimal 1 malam.");
            return;
        }

        // Validasi paket
        if (!selectedPackage) {
            alert("Silakan pilih paket layanan tambahan.");
            return;
        }

        // Validasi nomor kamar
        if (!roomNumber) {
            alert("Maaf, kamar tipe " + roomType + " sedang penuh.");
            return;
        }

        const roomObj = rooms.find(
            room =>
                room.number === roomNumber &&
                room.type === roomType &&
                room.status === "Tersedia"
        );

        if (!roomObj) {
            alert("Maaf, kamar sudah tidak tersedia.");
            updateRoomOptions();
            renderRoomStatus();
            return;
        }

        // Mengambil nama paket
        const packageName =
            selectedPackage.parentElement
                .querySelector("strong").textContent.trim();

        // Menghitung ulang total sebelum menyimpan
        calculatePrice();

        const finalTotal = currentCalculatedTotal;

        // Mengubah status kamar
        roomObj.status = "Terisi";

        // Menambahkan data tamu
        activeGuests.push({

            id: nextGuestId++,

            name: name,

            roomNumber: roomNumber,

            roomName: roomObj.name,

            packageName: packageName,

            nights: nights,

            totalPrice: finalTotal

        });

        // Menampilkan hasil terbaru
        renderRoomStatus();
        renderGuestList();

        // Mengosongkan form
        this.reset();

        // Memperbarui pilihan kamar dan harga
        updateRoomOptions();
        calculatePrice();

        // Notifikasi pemesanan berhasil
        alert(
            "PEMESANAN BERHASIL!\n\n" +
            "Terima kasih telah memesan di BUTTERFLY HOTEL.\n\n" +
            "Nama Tamu: " + name +
            "\nTipe Kamar: " + roomObj.name +
            "\nNomor Kamar: " + roomNumber +
            "\nPaket: " + packageName +
            "\nDurasi: " + nights + " malam" +
            "\nTotal Pembayaran: " + formatRupiah(finalTotal)
        );

    });


// ==========================================
// 10. EVENT LISTENER FORM
// ==========================================

// Ketika tipe kamar berubah
document.getElementById("roomType")
    .addEventListener("change", function() {

        updateRoomOptions();
        calculatePrice();

    });


// Ketika paket tambahan berubah
document.querySelectorAll('input[name="package"]')
    .forEach(radio => {

        radio.addEventListener("change", calculatePrice);

    });


// Ketika durasi menginap berubah
document.getElementById("nights")
    .addEventListener("input", calculatePrice);


// ==========================================
// 11. INISIALISASI APLIKASI
// ==========================================

function initApp() {

    updateRoomOptions();

    renderRoomStatus();

    renderGuestList();

    calculatePrice();

}


// Jalankan aplikasi
initApp();
