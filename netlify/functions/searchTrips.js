const admin = require("../../firebase");

exports.handler = async function (event, context) {
  try {
    //check if method POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: "method not allowed",
        }),
      };
    }

    //get origin and destination from event
    const { origin, destination } = JSON.parse(event.body);

    //check origin and destination exists
    if (!origin || !destination) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "origin and destination are required",
        }),
      };
    }

    //initialze db
    const db = admin.database();
    const ref = db.ref("/trips");
    const snapshot = await ref.once("value");
    
    //get trips with specific orgin and destiantion
    const trips = Object.values(snapshot.val() || {}).filter(
      (trip) =>
        trip.origin.toLowerCase() === origin.toLowerCase() &&
        trip.destination.toLowerCase() === destination.toLowerCase()
    );

    return {
      statusCode: 200,
      body: JSON.stringify(trips),
    };
  } catch (error) {
    console.error("Error reading data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to read data",
        details: error.message,
      }),
    };
  }
};
