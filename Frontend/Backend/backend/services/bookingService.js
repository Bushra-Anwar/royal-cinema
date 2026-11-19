const { getBookings, saveBookings } = require('../database/db');

async function confirmBooking(bookingData) {
  const ref = 'RC' + Date.now().toString().slice(-8) + Math.floor(10 + Math.random() * 90);

  const newBooking = {
    ...bookingData,
    bookingReference: ref,
    status: 'confirmed',
    confirmedAt: new Date().toISOString()
  };

  try {
    const bookings = getBookings();
    bookings.unshift(newBooking);
    // Keep last 500 bookings
    saveBookings(bookings.slice(0, 500));
  } catch (err) {
    console.error('[BookingService] Failed to persist booking to database:', err.message);
  }

  return {
    ok: true,
    success: true,
    booking: newBooking
  };
}

module.exports = {
  confirmBooking
};
