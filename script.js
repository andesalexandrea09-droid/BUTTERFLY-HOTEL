const rooms = [
  { number: "101", type: "Standard", price: 350000 },
  { number: "102", type: "Standard", price: 350000 },
  { number: "201", type: "Deluxe", price: 650000 },
  { number: "202", type: "Deluxe", price: 650000 },
  { number: "301", type: "Suite", price: 1250000 }
];

let activeGuests = [];
let currentCalculatedTotal = 0;

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function getSelectedPackage() {
  return document.querySelector('input[name="package"]:checked');
}

function calculatePrice() {
  const roomType = document.getElementById("roomType");
  const nightsInput = document.getElementById("nights");
  const selectedPackage = getSelectedPackage();

  if (!roomType || !nightsInput || !selectedPackage) return;

  const basePrice = Number(roomType.value) || 0;
  const nights = Math.max(1, Number(nightsInput.value) || 1);
  const packagePrice = Number(selectedPackage.value) || 0;

  const subtotal = (basePrice + packagePrice) * nights;
  const discount = subtotal >= 1000000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  currentCalculatedTotal = total;

  document.getElementById("summaryNights").textContent = nights;
  document.getElementById("summaryBasePrice").textContent =
    formatRupiah(basePrice);
  document.getElementById("summaryPackagePrice").textContent =
    formatRupiah(packagePrice * nights);
  document.getElementById("summaryDiscount").textContent =
    formatRupiah(discount);
  document.getElementById("summaryTotal").textContent =
    formatRupiah(total);

  const promoNote = document.getElementById("promoNote");
  if (promoNote) {
    promoNote.textContent = discount > 0
      ? "Selamat! Kamu mendapatkan diskon 10%."
      : "Diskon 10% berlaku untuk total harga minimal Rp1.000.000.";
  }
}

function updateRoomOptions() {
  const roomType = document.getElementById("roomType");
  const roomNumber = document.getElementById("roomNumber");

  if (!roomType || !roomNumber) return;

  const selectedType = roomType.options[roomType.selectedIndex].text;
  const previousRoom = roomNumber.value;

  roomNumber.innerHTML = '<option value="">Pilih nomor kamar</option>';

  const availableRooms = rooms.filter(room =>
    room.type === selectedType &&
    !activeGuests.some(guest => guest.roomNumber === room.number)
  );

  availableRooms.forEach(room => {
    const option = document.createElement("option");
    option.value = room.number;
    option.textContent = `Kamar ${room.number}`;
    roomNumber.appendChild(option);
  });

  if (availableRooms.some(room => room.number === previousRoom)) {
    roomNumber.value = previousRoom;
  }

  calculatePrice();
  renderRoomStatus();
}

function renderRoomStatus() {
  const container = document.getElementById("roomStatusList");
  if (!container) return;

  container.innerHTML = "";

  rooms.forEach(room => {
    const isOccupied = activeGuests.some(
      guest => guest.roomNumber === room.number
    );

    const item = document.createElement("div");
    item.className = isOccupied ? "room-status occupied" : "room-status available";
    item.textContent = `Kamar ${room.number} (${room.type}) - ${
      isOccupied ? "Terisi" : "Tersedia"
    }`;

    container.appendChild(item);
  });
}

function renderGuestList() {
  const table = document.getElementById("guestListTable");
  if (!table) return;

  table.innerHTML = "";

  if (activeGuests.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5">Belum ada tamu yang melakukan reservasi.</td>
      </tr>
    `;
    return;
  }

  activeGuests.forEach((guest, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${guest.name}</td>
      <td>${guest.roomNumber}</td>
      <td>${guest.nights} malam</td>
      <td>${formatRupiah(guest.total)}</td>
    `;

    table.appendChild(row);
  });
}

function selectRoomFromMenu(roomType) {
  const roomSelect = document.getElementById("roomType");
  const bookingSection = document.getElementById("bookingSection");

  if (!roomSelect) return;

  const option = Array.from(roomSelect.options).find(
    option => option.text.trim() === roomType
  );

  if (option) {
    roomSelect.value = option.value;
    updateRoomOptions();
  }

  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: "smooth" });
  }
}

function checkOut(roomNumber) {
  const guestIndex = activeGuests.findIndex(
    guest => guest.roomNumber === roomNumber
  );

  if (guestIndex === -1) {
    alert("Data tamu tidak ditemukan.");
    return;
  }

  const guestName = activeGuests[guestIndex].name;

  if (!confirm(`Checkout tamu ${guestName} dari kamar ${roomNumber}?`)) {
    return;
  }

  activeGuests.splice(guestIndex, 1);

  renderGuestList();
  renderRoomStatus();
  updateRoomOptions();

  alert(`Checkout kamar ${roomNumber} berhasil.`);
}

function initApp() {
  updateRoomOptions();
  renderGuestList();

  const form = document.getElementById("bookingForm");
  if (!form) return;

  form.onsubmit = function(event) {
    event.preventDefault();

    const name = document.getElementById("guestName").value.trim();
    const roomTypeSelect = document.getElementById("roomType");
    const roomNumber = document.getElementById("roomNumber").value;
    const nights = Math.max(
      1,
      Number(document.getElementById("nights").value) || 1
    );
    const selectedPackage = getSelectedPackage();

    if (!name || !roomNumber || !selectedPackage) {
      alert("Mohon lengkapi semua data reservasi.");
      return;
    }

    const selectedRoom = rooms.find(
      room => room.number === roomNumber
    );

    if (!selectedRoom || selectedRoom.type !== roomTypeSelect.options[roomTypeSelect.selectedIndex].text) {
      alert("Nomor kamar tidak sesuai dengan tipe kamar.");
      updateRoomOptions();
      return;
    }

    if (activeGuests.some(guest => guest.roomNumber === roomNumber)) {
      alert("Maaf, kamar tersebut sudah terisi.");
      updateRoomOptions();
      return;
    }

    calculatePrice();

    const bookingTotal = currentCalculatedTotal;

    const guest = {
      name,
      roomNumber,
      roomType: selectedRoom.type,
      nights,
      packageName: selectedPackage.parentElement.querySelector("strong")?.textContent || "Paket",
      total: bookingTotal
    };

    activeGuests.push(guest);

    renderGuestList();
    renderRoomStatus();

    form.reset();
    updateRoomOptions();

    alert(
      `Reservasi berhasil!\n\nNama: ${name}\nKamar: ${roomNumber}\nTotal: ${formatRupiah(bookingTotal)}`
    );
  };
}

document.addEventListener("DOMContentLoaded", function() {
  initApp();

  document.getElementById("roomType")?.addEventListener("change", updateRoomOptions);
  document.getElementById("nights")?.addEventListener("input", calculatePrice);

  document.querySelectorAll('input[name="package"]').forEach(input => {
    input.addEventListener("change", calculatePrice);
  });
});
