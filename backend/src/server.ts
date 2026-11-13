import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), () => {
  console.log(`Digiaccel Backend API listening on http://localhost:${PORT}`);
  console.log(
    `Storage Mode: ${process.env.db_used === "true" || process.env.DB_USED === "true" ? "Database (db_used=true)" : "File Directory (db_used=false)"}`,
  );
});
