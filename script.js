// Data Kamar BUTTERFLY HOTEL
let rooms = [
    { number: 101, type: 'Standard', name: 'Standard Butterfly', price: 350000, status: 'Tersedia' },
    { number: 102, type: 'Standard', name: 'Standard Butterfly', price: 350000, status: 'Tersedia' },
    { number: 201, type: 'Deluxe', name: 'Deluxe Monarch', price: 650000, status: 'Tersedia' },
    { number: 202, type: 'Deluxe', name: 'Deluxe Monarch', price: 650000, status: 'Tersedia' },
    { number: 301, type: 'Suite', name: 'Royal Butterfly Suite', price: 1250000, status: 'Tersedia' }
];

let activeGuests = [];
let currentCalculatedTotal = 0;

// Format Angka ke Rupiah
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// Fungsi memilih kamar langsung dari Kartu Menu di atas
function selectRoomFromMenu(roomType) {
    const selectEl = document.getElementById('roomType');
    selectEl.value = roomType;
    
    updateRoomOptions();
    calculatePrice();

    // Gulir halaman otomatis menuju form pemesanan
    document.getElementById('bookingSection').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('guestName').focus();
}

// Kalkulator Harga Real-time
function calculatePrice() {
    const roomSelect = document.getElementById('roomType');
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    const basePrice = parseInt(selectedOption.getAttribute('data-price'));
    
    const packagePrice = parseInt(document.querySelector('input[name="package"]:checked').value);
    const nights = Math.max(1, parseInt(document.getElementById('nights').value) || 1);

    const totalBase = basePrice * nights;
    const totalPackage = packagePrice * nights;
    const subtotal = totalBase + totalPackage;

    // Diskon otomatis 10% jika menginap minimal 3 malam
    let discount = 0;
    const promoNote = document.getElementById('promoNote');
    if (nights >= 3) {
        discount = subtotal * 0.10;
        promoNote.textContent = "Selamat! Anda mendapatkan diskon Long-Stay 10%!";
        promoNote.style.backgroundColor = "#dcfce7";
        promoNote.style.color = "#166534";
    } else {
        promoNote.textContent = "Promo: Menginap minimal 3 malam otomatis diskon 10%!";
        promoNote.style.backgroundColor = "#fef3c7";
        promoNote.style.color = "#92400e";
    }

    currentCalculatedTotal = subtotal - discount;

    document.getElementById('summaryNights').textContent = nights;
    document.getElementById('summaryBasePrice').textContent = formatRupiah(totalBase);
    document.getElementById('summaryPackagePrice').textContent = formatRupiah(totalPackage);
    document.getElementById('summaryDiscount').textContent = '- ' + formatRupiah(discount);
    document.getElementById('summaryTotal').textContent = formatRupiah(currentCalculatedTotal);
}

// Perbarui daftar nomor kamar yang tersedia sesuai tipe
function updateRoomOptions() {
    const selectedType = document.getElementById('roomType').value;
    const roomSelect = document.getElementById('roomNumber');
    roomSelect.innerHTML = '';

    const availableRooms = rooms.filter(room => room.status === 'Tersedia' && room.type === selectedType);

    if (availableRooms.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = `Kamar ${selectedType} Penuh`;
        roomSelect.appendChild(opt);
        return;
    }

    availableRooms.forEach(room => {
        const opt = document.createElement('option');
        opt.value = room.number;
        opt.textContent = `Kamar ${room.number}`;
        roomSelect.appendChild(opt);
    });
}

// Tampilkan tabel status ketersediaan kamar
function renderRoomStatus() {
    const tbody = document.getElementById('roomStatusList');
    tbody.innerHTML = '';

    rooms.forEach(room => {
        const tr = document.createElement('tr');
        const badgeClass = room.status === 'Tersedia' ? 'badge-available' : 'badge-booked';
        tr.innerHTML = `
            <td><strong>${room.number}</strong></td>
            <td>${room.name}</td>
            <td>${formatRupiah(room.price)}</td>
            <td><span class="badge ${badgeClass}">${room.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Tampilkan tabel tamu yang sedang menginap
function renderGuestList() {
    const tbody = document.getElementById('guestListTable');
    if (activeGuests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-message">Belum ada tamu yang check-in.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    activeGuests.forEach((guest, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${guest.name}</td>
            <td>Kamar ${guest.roomNumber} (${guest.roomName})</td>
            <td>${guest.packageName}</td>
            <td>${guest.nights} Malam</td>
            <td><strong>${formatRupiah(guest.totalPrice)}</strong></td>
            <td><button class="btn-checkout" onclick="checkOut(${index}, ${guest.roomNumber})">Check-Out</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Proses Check-Out
function checkOut(index, roomNumber) {
    const room = rooms.find(r => r.number === roomNumber);
    if (room) room.status = 'Tersedia';

    activeGuests.splice(index, 1);
    initApp();
}

// Event Listeners
document.getElementById('roomType').addEventListener('change', () => {
    updateRoomOptions();
    calculatePrice();
});

document.querySelectorAll('input[name="package"]').forEach(radio => {
    radio.addEventListener('change', calculatePrice);
});

document.getElementById('nights').addEventListener('input', calculatePrice);

document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('guestName').value;
    const roomType = document.getElementById('roomType').value;
    const roomNumber = parseInt(document.getElementById('roomNumber').value);
    const nights = parseInt(document.getElementById('nights').value);
    
    const selectedPkgRadio = document.querySelector('input[name="package"]:checked');
    const packageName = selectedPkgRadio.parentElement.querySelector('strong').textContent;

    if (!roomNumber || isNaN(roomNumber)) {
        alert(`Maaf, kamar tipe ${roomType} sedang penuh.`);
        return;
    }

    const roomObj = rooms.find(r => r.number === roomNumber);
    if (roomObj) roomObj.status = 'Terisi';

    activeGuests.push({
        name,
        roomName: roomObj.name,
        roomNumber,
        packageName,
        nights,
        totalPrice: currentCalculatedTotal
    });

    this.reset();
    initApp();
    alert(`Terima kasih telah memesan di BUTTERFLY HOTEL!\nTamu: ${name}\nKamar: ${roomObj.name} (No. ${roomNumber})\nTotal Tagihan: ${formatRupiah(currentCalculatedTotal)}`);
});

// Jalankan aplikasi pertama kali
function initApp() {
    updateRoomOptions();
    renderRoomStatus();
    renderGuestList();
    calculatePrice();
}

initApp();
