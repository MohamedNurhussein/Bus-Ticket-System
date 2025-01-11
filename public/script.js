document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("search-form");
  const resultsSection = document.getElementById("results");
  const tripsContainer = document.getElementById("trips-container");
  const bookingModal = document.getElementById("booking-modal");
  const bookingForm = document.getElementById("booking-form");
  const bookingTripInfo = document.getElementById("booking-trip-info");
  const fetchTrips = document.getElementById("fetch-all-trips");

  let currentBookingTrip = null;

  searchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;

    //fetch specif trips
    const trips = await fetch("/.netlify/functions/searchTrips", {
      method: "POST",
      body: JSON.stringify({
        origin: origin,
        destination: destination,
      }),
    }).then((res) => res.json());

    //display trips
    displayTrips(trips);
  });

  fetchTrips.addEventListener("click", async () => {
    //fetch data
    const respond = await fetch("/.netlify/functions/readTrips").then((res) =>
      res.json()
    );
    //display trips
    displayTrips(respond);
  });

  function displayTrips(trips) {
    console.log(trips);

    tripsContainer.innerHTML = "";

    if (trips.length === 0)
      tripsContainer.innerHTML = "<p style='color: red;'>No available trips</p>";
    else {
      trips.forEach((trip) => {
        const tripElement = document.createElement("div");
        tripElement.classList.add("trip");
        tripElement.innerHTML = `
                <h3>${trip.origin} to ${trip.destination}</h3>
                <p>Departure Time: ${trip.time}</p>
                <p class="price">Price: $${trip.price.toFixed(2)}</p>
                <p class="seats">Available Seats: ${trip.available_seats}</p>
                <button class="btn book-btn" data-id="${
                  trip.ID
                }">Book Now</button>
            `;
        tripsContainer.appendChild(tripElement);
      });

      resultsSection.style.display = "block";
    }
    const bookButtons = document.querySelectorAll(".book-btn");
    bookButtons.forEach((button) => {
      button.addEventListener("click", handleBookNow);
    });
  }

  function handleBookNow(e) {
    const tripId = parseInt(e.target.getAttribute("data-id"));
    currentBookingTrip = trips.find((trip) => trip.id === tripId);
    bookingTripInfo.textContent = `Booking for ${
      currentBookingTrip.time
    } trip - $${currentBookingTrip.price.toFixed(2)} per seat`;
    bookingModal.style.display = "block";
  }

  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const phoneNumber = document.getElementById("phone").value;
    const seatsToReserve = parseInt(document.getElementById("seats").value);

    if (!validatePhoneNumber(phoneNumber)) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (
      isNaN(seatsToReserve) ||
      seatsToReserve <= 0 ||
      seatsToReserve > currentBookingTrip.seats
    ) {
      alert("Please enter a valid number of seats to reserve.");
      return;
    }

    const totalPrice = currentBookingTrip.price * seatsToReserve;
    alert(
      `Booking Confirmed!\nYou have successfully booked ${seatsToReserve} seat(s) for the ${
        currentBookingTrip.time
      } trip.\nTotal Price: $${totalPrice.toFixed(2)}`
    );

    // Update available seats
    currentBookingTrip.seats -= seatsToReserve;
    displayTrips(
      document.getElementById("origin").value,
      document.getElementById("destination").value
    );

    bookingModal.style.display = "none";
    bookingForm.reset();
  });

  function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target == bookingModal) {
      bookingModal.style.display = "none";
    }
  };
});
