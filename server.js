const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const {connectDB} = require('./Database/config.js')
const authRoute = require('./Routers/authRouter.js')
const userRoute = require('./Routers/userRouter.js')
const postRoute = require("./Routers/postRouter.js")
const pageRoute = require("./Routers/pageRouter.js")
const cookieParser =  require("cookie-parser")
const PORT = process.env.PORT || 5173
const path = require('path');

dotenv.config(); // Load environment variables from .env file


const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(cookieParser());



// Middleware to handle cross-origin requests
app.use(
  cors({
    origin: ["http://localhost:5173"], 
    credentials: true,   
  })
);

connectDB();


app.use("/", pageRoute);

// Route middlewares
app.use("/api/auth", authRoute);    // Routes for registration, login, Google auth
app.use("/api/user", userRoute);    // Routes for user update, delete
app.use("/api/post", postRoute);    // Routes for blog post creation and retrieval

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Start the server
//app.listen(PORT, () => {
 // console.log("Server running on the PORT");
//});

module.exports = app