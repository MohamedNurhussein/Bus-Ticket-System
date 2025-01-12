const admin = require("../../firebase");

exports.handler = async function (event) {
  try {
    //initialze database
    const db = admin.database();

    //extract data from body
    const { tripID, time, seats, userPhone } = JSON.parse(event.body);

    //get ref of that trip
    const tripRef = db.ref(`/trips/${tripID}`);
    const trip = (await tripRef.once("value")).val();

    //check seats
    if (seats <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Number of seats must be greater than 0",
        }),
      };
    }

    //check available seats
    if (!(trip.available_seats - seats >= 0)) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Not enough seats availabe",
        }),
      };
    }

    //get total price
    const totalPrice = trip.price * seats;

    //book trip
    const ref = db.ref("/Bookings");
    const newBookingRef = ref.push();
    await newBookingRef.set({
      booking_id: newBookingRef.key,
      trip_time: time,
      reserved_seats: seats,
      trip_id: tripID,
      user_phone: userPhone,
      total_price: totalPrice,
    });

    //update trip seats
    const tripSeatRef = db.ref(`/trips/${tripID}/available_seats`);
    await tripSeatRef.set(trip.available_seats - seats);

    // return response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "data has been written successfully",
        booking_id: newBookingRef.key,
      }),
    };
  } catch (error) {
    console.error("Error booking trip:", {
      error: error.message,
      stack: error.stack,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to read data",
        details: error.message,
      }),
    };
  }
};
