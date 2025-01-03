const express = require("express");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const database = require("./config/database");
const User = require("./models/User")

const PORT = process.env.PORT || 4000;


//database connect
database.connect();
app.use(express.json());
app.use(
	cors()
)

app.get("/", async (req, res) => {
    const user = await User.find()
    console.log(user)
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.post('/createUser', async (req,res) => {
    const {
        username,
        password
    } = req.body
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
       username,
       password: hashedPassword
      })
  
      return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      })
})

app.post('/userVerification', async (req,res) => {
  const {token} = req.body
  console.log(token)
  if (!token) {
    return res.json({ status: false })
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
     return res.json({ status: false })
    } else {
      return res.json({status: true})
    }
  })
})

app.post('/login', async (req,res) => {

  
    try {
        // Get email and password from request body
        const { username, password } = req.body
        
    
        // Check if email or password is missing
        if (!username || !password) {
          // Return 400 Bad Request status code with error message
          return res.status(400).json({
            success: false,
            message: `Please Fill up All the Required Fields`,
          })
        }
    
        // Find user with provided email
        const user = await User.findOne({ username })
    
        // If user not found with provided email
        if (!user) {
          // Return 401 Unauthorized status code with error message
          return res.status(401).json({
            success: false,
            message: `User is not Registered with Us Please SignUp to Continue`,
          })
        }
    
        // Generate JWT token and Compare Password
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign(
            { username: user.username, id: user._id},
            process.env.JWT_SECRET,
            {
              expiresIn: "24h",
            }
          )
    
          
          user.password = undefined
          return res.status(200).json({
            success: true,
            user,
            message: `User Login Success`,
            token
          })
         
        } else {
          return res.status(401).json({
            success: false,
            message: `Password is incorrect`,
          })
        }
      } catch (error) {
        console.error(error)
        // Return 500 Internal Server Error status code with error message
        return res.status(500).json({
          success: false,
          message: `Login Failure Please Try Again`,
        })
      }
    }
)

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})