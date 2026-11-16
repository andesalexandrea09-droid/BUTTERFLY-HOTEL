// ==========================================
// 1. DATA KAMAR
// ==========================================

const rooms = [
    { number: 101, type: "Standard", name: "Standard Butterfly", price: 350000, status: "Tersedia" },
    { number: 102, type: "Standard", name: "Standard Butterfly", price: 350000, status: "Tersedia" },
    { number: 201, type: "Deluxe", name: "Deluxe Monarch", price: 650000, status: "Tersedia" },
    { number: 202, type: "Deluxe", name: "Deluxe Monarch", price: 650000, status: "Tersedia" },
    { number: 301, type: "Suite", name: "Royal Butterfly Suite", price: 1250000, status: "Tersedia" }
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
// 3. PILIH KAMAR DARI MENU
// ==========================================

function selectRoomFromMenu(roomType) {
    const roomSelect = document.getElementById("roomType");

    if (!roomSelect) return;

    roomSelect.value = roomType;

    updateRoomOptions();
    calculatePrice();

    const bookingSection = document.getElementById("bookingSection");

    if (bookingSection) {
        bookingSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    const guestName = document.getElementById("guestName");

    if (guestName) {
        guestName.focus({ preventScroll: true });
    }
}


// ==========================================
// 4. MENGHITUNG HARGA
// ==========================================

function calculatePrice() {
    const roomSelect = document.getElementById("roomType");
    const nightsInput = document.getElementById("nights");

    if (!roomSelect || !nightsInput) return;

    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    const basePrice = Number(selectedOption?.dataset.price || 0);

    const selectedPackage = document.querySelector(
        'input[name="package"]:checked'
    );

    const packagePrice = Number(selectedPackage?.value || 0);
    const nights = Math.max(1, parseInt(nightsInput.value) || 1);

    const totalBase = basePrice * nights;
    const totalPackage = packagePrice * nights;
    const subtotal = totalBase + totalPackage;

    const discount = nights >= 3 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    const summaryNights = document.getElementById("summaryNights");
    const summaryBasePrice = document.getElementById("summaryBasePrice");
    const summaryPackagePrice = document.getElementById("summaryPackagePrice");
    const summaryDiscount = document.getElementById("summaryDiscount");
    const summaryTotal = document.getElementById("summaryTotal");
    const promoNote = document.getElementById("promoNote");

    if (summaryNights) summaryNights.textContent = nights + " malam";
    if (summaryBasePrice) summaryBasePrice.textContent = formatRupiah(totalBase);
    if (summaryPackagePrice) summaryPackagePrice.textContent = formatRupiah(totalPackage);
    if (summaryDiscount) summaryDiscount.textContent = formatRupiah(discount);
    if (summaryTotal) summaryTotal.textContent = formatRupiah(total);

    if (promoNote) {
        promoNote.textContent = nights >= 3
            ? "Diskon 10% berhasil diterapkan!"
            : "Menginap minimal 3 malam untuk mendapatkan diskon 10%.";

        promoNote.classList.toggle("active", nights >= 3);
    }

    currentCalculatedTotal = total;
}


// ==========================================
// 5. MEMPERBARUI PILIHAN NOMOR KAMAR
// ==========================================

function updateRoomOptions() {
    const roomType = document.getElementById("roomType");
    const roomNumber = document.getElementById("roomNumber");

    if (!roomType || !roomNumber) return;

    const previousValue = roomNumber.value;
    const selectedType = roomType.value;

    const availableRooms = rooms.filter(room =>
        room.type === selectedType && room.status === "Tersedia"
    );

    roomNumber.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = availableRooms.length
        ? "Pilih nomor kamar"
        : "Kamar sedang penuh";

    roomNumber.appendChild(placeholder);

    availableRooms.forEach(room => {
        const option = document.createElement("option");
        option.value = room.number;
        option.textContent = "Kamar " + room.number;
        roomNumber.appendChild(option);
    });

    if (availableRooms.some(room => String(room.number) === previousValue)) {
        roomNumber.value = previousValue;
    }
}


// ==========================================
// 6. MENAMPILKAN STATUS KAMAR
// ==========================================

function renderRoomStatus() {
    const roomStatusList = document.getElementById("roomStatusList");

    if (!roomStatusList) return;

    roomStatusList.innerHTML = "";

    rooms.forEach(room => {
        const row = document.createElement("tr");

        const statusClass = room.status === "Tersedia"
            ? "badge-available"
            : "badge-booked";

        row.innerHTML = `
            <td>${room.number}</td>
            <td>${room.name}</td>
            <td>${formatRupiah(room.price)}</td>
            <td><span class="${statusClass}">${room.status}</span></td>
        `;

        roomStatusList.appendChild(row);
    });
}


// ==========================================
// 7. MENAMPILKAN DAFTAR TAMU
// ==========================================

function renderGuestList() {
    const guestListTable = document.getElementById("guestListTable");

    if (!guestListTable) return;

    guestListTable.innerHTML = "";

    if (activeGuests.length === 0) {
        guestListTable.innerHTML = `
            <tr>
                <td colspan="6">Belum ada tamu yang menginap.</td>
            </tr>
        `;
        return;
    }

    activeGuests.forEach(guest => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${guest.name}</td>
            <td>${guest.roomNumber} - ${guest.roomName}</td>
            <td>${guest.packageName}</td>
            <td>${guest.nights} malam</td>
            <td>${formatRupiah(guest.totalPrice)}</td>
            <td>
                <button class="btn-checkout" type="button">
                    Check-Out
                </button>
            </td>
        `;

        row.querySelector("button").addEventListener("click", () => {
            checkOut(guest.id);
        });

        guestListTable.appendChild(row);
    });
}


// ==========================================
// 8. PROSES CHECK-OUT
// ==========================================

function checkOut(guestId) {
    const confirmed = confirm("Apakah tamu ini ingin check-out?");

    if (!confirmed) return;

    const guest = activeGuests.find(item => item.id === guestId);

    if (!guest) return;

    const room = rooms.find(item =>
        item.number === guest.roomNumber
    );

    if (room) {
        room.status = "Tersedia";
    }

    activeGuests = activeGuests.filter(item => item.id !== guestId);

    updateRoomOptions();
    renderRoomStatus();
    renderGuestList();
    calculatePrice();

    alert("Check-out berhasil!");
}


// ==========================================
// 9. PROSES PEMESANAN KAMAR
// ==========================================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
    bookingForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const guestName = document.getElementById("guestName").value.trim();
        const roomType = document.getElementById("roomType").value;
        const roomNumber = Number(document.getElementById("roomNumber").value);
        const nights = Math.max(1, parseInt(document.getElementById("nights").value) || 1);

        const selectedPackage = document.querySelector(
            'input[name="package"]:checked'
        );

        if (!guestName || !roomType || !roomNumber || !selectedPackage) {
            alert("Mohon lengkapi semua data pemesanan!");
            return;
        }

        const room = rooms.find(item =>
            item.number === roomNumber &&
            item.type === roomType &&
            item.status === "Tersedia"
        );

        if (!room) {
            alert("Maaf, kamar tersebut sudah tidak tersedia.");
            updateRoomOptions();
            return;
        }

        const packageName = selectedPackage
            .closest("label")
            ?.querySelector("strong")?.textContent || "Paket";

        calculatePrice();

        room.status = "Terisi";

        activeGuests.push({
            id: nextGuestId++,
            name: guestName,
            roomNumber: room.number,
            roomName: room.name,
            packageName: packageName,
            nights: nights,
            totalPrice: currentCalculatedTotal
        });

        renderRoomStatus();
        renderGuestList();

        bookingForm.reset();

        updateRoomOptions();
        calculatePrice();

        alert(
            "Pemesanan berhasil!\n" +
            "Nama: " + guestName + "\n" +
            "Kamar: " + room.number + "\n" +
            "Total: " + formatRupiah(activeGuests[activeGuests.length - 1].totalPrice)
        );
    });
}


// ==========================================
// 10. EVENT LISTENER
// ==========================================

const roomTypeInput = document.getElementById("roomType");

if (roomTypeInput) {
    roomTypeInput.addEventListener("change", function() {
        updateRoomOptions();
        calculatePrice();
    });
}

document.querySelectorAll('input[name="package"]').forEach(input => {
    input.addEventListener("change", calculatePrice);
});

const nightsInput = document.getElementById("nights");

if (nightsInput) {
    nightsInput.addEventListener("input", calculatePrice);
}


// ==========================================
// 11. INISIALISASI APLIKASI
// ==========================================

function initApp() {
    document.querySelectorAll(".btn-select").forEach(button => {
        button.addEventListener("click", function() {
            selectRoomFromMenu(this.dataset.room);
        });
    });

    updateRoomOptions();
    renderRoomStatus();
    renderGuestList();
    calculatePrice();

    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
/* =====================================
   PESAN KAMAR VIA WHATSAPP
===================================== */

const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // GANTI DENGAN NOMOR WHATSAPP HOTEL
    const nomorHotel = "6281335342783";

    // Mengambil data pemesanan
    const nama = document.getElementById("guestName").value;

    const tipeKamar = document.getElementById("roomType")
        .selectedOptions[0].text;

    const nomorKamar = document.getElementById("roomNumber").value;

    const durasi = document.getElementById("nights").value;

    const paket = document.querySelector(
        'input[name="package"]:checked'
    );

    const namaPaket = paket.closest(".radio-card")
        .querySelector("strong").textContent;

    const total = document.getElementById("summaryTotal")
        .textContent;

    // Membuat pesan WhatsApp
    const pesan =
`Halo BUTTERFLY HOTEL, saya ingin memesan kamar.

Nama Tamu: ${nama}
Tipe Kamar: ${tipeKamar}
Nomor Kamar: ${nomorKamar}
Paket Layanan: ${namaPaket}
Durasi Menginap: ${durasi} malam

Total Pembayaran: ${total}

Mohon konfirmasi pemesanan saya.
Terima kasih.`;

    // Membuka WhatsApp
    const linkWhatsApp =
        "https://wa.me/" + nomorHotel +
        "?text=" + encodeURIComponent(pesan);

    window.open(linkWhatsApp, "_blank");

});
