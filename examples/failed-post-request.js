/* eslint-disable */
require("dotenv").config();
const Canvas = require("../src/index");

async function start() {
  console.log(
    "Checking environmental variables...\n" +
      `- CANVAS_API_URL: ${process.env.CANVAS_API_URL}\n` +
      `- CANVAS_API_TOKEN: ${
        process.env.CANVAS_API_TOKEN ? "<not showing>" : "not set"
      }`
  );
  console.log();
  console.log("Making a POST request to /courses/1/enrollments (should fail)");
  const canvas = new Canvas(
    process.env.CANVAS_API_URL,
    process.env.CANVAS_API_TOKEN
  );

  try {
    await canvas.requestUrl("courses/1/enrollments", "POST");
  } catch (err) {
    console.log("Displaying `err` object");
    console.error(err);
  }
}

start();
