var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const flash = require("connect-flash");
const session = require("express-session");

const useragent = require('express-useragent');

var indexRouter = require("./routes/index");
var authRouter = require("./routes/authRoutes");
const groupRoute = require('./routes/groupRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const expenseRoute = require('./routes/expenseRoute')


const { default: mongoose } = require("mongoose");
const bodyParser = require("body-parser");

var app = express();

// Same route but different page
app.use(useragent.express());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));

//Middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

//Routes
app.use("/", indexRouter);
app.use(authRouter);
app.use("/group",groupRoute);
app.use("/dashboard",dashboardRoute);
app.use('/expense', expenseRoute);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Mongodb is connected..."))
  .catch((err) => console.log("MongoDB Connection error", err));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});


module.exports = app;
