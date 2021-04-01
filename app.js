require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("colors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// connect to database
mongoose.connect(process.env.MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

//on successful connection
mongoose.connection.on("connected", () => {
  console.log("Connected to database!!".green);
});

//on error connecting to database
mongoose.connection.on("error", (err) => {
  console.log(`error connecting to database ${err}`.red);
});

//allow cross origin requests
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "public"));
app.set("view engine", "ejs");

//default code of expressjs generator

//to parse the incoming requests to json
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// response for get('/')

app.use(router);

router.get("/", (req, res) => {
  res.render("index");
});

//import routes
const adminRouter = require("./app/routes/admin.router");
const authRouter = require("./app/routes/auth.router");
const facultyRouter = require("./app/routes/faculty.router");
const gatepassRouter = require("./app/routes/gatepass.router");
const userRouter = require("./app/routes/user.router");

app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//use the  routes
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/faculty", facultyRouter);
app.use("/gatepass", gatepassRouter);
app.use("/user", userRouter);

//server listening on port
app.listen(PORT, () => {
  console.clear();
  console.log(`MITS Web backend running on port ${PORT}`.yellow);
});
