import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;
const saltRounds = 10;

const db = new pg.Client({
  user : 'postgres',
  host : 'localhost',
  database : 'Auth',
  password : 'Dellg15gaming',
  port : 5432,
})
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => 
  {
    const email = req.body.username;
    const password = req.body.password;
    
    try
    {
      const checkResult = await db.query("select * from users where email = $1",[email]);
      if(checkResult.rows.length > 0)
      {
        res.send("Email exists, try logging in!");
      }
      else
      {
        //hashing :
        bcrypt.hash(password,saltRounds,async (err,hash)=>
        {
          if(err)
          {
            console.log("error at hasing : ",err);
          }
        else
        {
          const result = await db.query("insert into users (email,password) values ($1,$2)",[email,hash]);
          console.log(result);
          res.render("secrets.ejs");
        }
        });
      }
    }
    catch(err)
    {
      console.log("Error in checking mail",err);
    }
  });

app.post("/login", async (req, res) => 
  {
    const email = req.body.username;
    const password = req.body.password;

    try
    {
      const result = await db.query("select * from users where email = $1",[email]);
      if(result.rows.length > 0)
      {
        const storedrow = result.rows[0];
        const storedPassword = storedrow.password;
        //hashing checking:

        bcrypt.compare(password,storedPassword,(err,result)=>{
          if(err)
          {
            console.log("Error at login hashing: ",err);
          }
          else
          {
            if(result)
            {
              res.render("secrets.ejs");
            }
            else
            {
              res.send("Incorrect password! Try it again.");
            }
          }
        });
      }
      else
      {
        res.send("This email is not found , try registering first!");
      }
    }
    catch(err)
    {
      console.log(err);
    }
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
