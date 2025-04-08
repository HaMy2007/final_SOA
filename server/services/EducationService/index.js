const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4001;
const subjectRoutes = require("./routes/subjectRoutes");
const semesterRoutes = require("./routes/semesterRoutes");

app.use(cors());
require("./config/db");
app.use(express.json());

app.use("/api/subjects", subjectRoutes);
app.use("/api/semesters", semesterRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
