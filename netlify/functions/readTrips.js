const admin = require("../../firebase"); // Import Firebase Admin instance

exports.handler = async function (event, context) {
  try {
    const db = admin.database();
    const ref = db.ref("/trips"); 
    const snapshot = await ref.once("value");
    const trips = Object.values(snapshot.val())
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
