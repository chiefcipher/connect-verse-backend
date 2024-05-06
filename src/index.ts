import mongoose from "mongoose";
import app from "./app";
const PORT = process.env.PORT || 7078;
process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("[UNCAUGHT EXCEPTION], SHUTTING DOWN!!! 🔥🔥");
  process.exit(1);
});
let server: any;
const connectDB = () => {
  const CLUSTER_PASS = process.env.CLUSTER_PASS;
  const CLUSTER_URL =
    process.env.CLUSTER_URL?.replace("<password>", CLUSTER_PASS || "") || "";
  mongoose
    .connect(CLUSTER_URL)
    .then(() => {
      console.log("[✅✅ DATABASE CONNECTION SUCCESSFUL ✅✅]");

      server = app.listen(PORT, () => {
        console.log(
          `[✅✅SERVER STARTED AT PORT http://localhost:${PORT} ✅✅]`
        );
      });
    })
    .catch((err) => console.log(err, "[🔥🔥DATABASE CONNECTION ERROR 🔥🔥]"));
};

// connect database
connectDB();

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("[UNHANDLED REJECTION 🔥🔥], closing server");
  if (server && server.close) {
    server.close(() => {
      console.log("SERVER CLOSED");
      process.exit(1);
    });
  }
});
