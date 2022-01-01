const express       = require('express')
const bodyParser    = require('body-parser');
const cors          = require('cors');
const jwt           = require('jsonwebtoken');
var expressJWT      = require('express-jwt');
const fs            = require('fs');

const app           = express();
const port          = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.options('*', cors());
//app.use(bodyParser.json({limit: '10mb', extended: true}));
//app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use(express.static(__dirname + '/dist/AppDynamics'));


app.listen(process.env.PORT||3000, () => {
    console.log('Server listening on port :: '+3000);
});


// SECRET FOR JWT
let secret = 'Et!$@1@T'; // a secret key is set here
app.use(expressJWT({ secret: secret, algorithms: ['HS256']})
    .unless( // This allows access to /token/sign without token authentication
        { path: [
            '/token/sign',
            '/validate/user'
        ]}
    ));

/* Create token to be used */
app.get('/token/sign', (req, res) => {
    var userData = {
        "userName": "business",
        "password": "business123"
    }
    let token = jwt.sign(userData, secret, { expiresIn: '600s'})
    res.status(200).json({"token": token});
});


app.get('/test', (req, res) => {
    res.status(200)
        .json({
            "Name": "John",
            "Location": {
                "City" : "Los Angels",
                "State" : "CA"
            },
            "​hobbies": [
                "Music",
                "Running"
            ]
        });
});
app.post('/validate/user', (req,res)=> {
    const body = req.body;
    console.log(body);
    const uName = body.username;
    const pwd = body.password;
    //console.log(uName);
    var userFlag = false;
    var userData;
    const data = fs.readFileSync('./data/users.json', 
    {encoding:'utf8', flag:'r'});
    const parsedData =  JSON.parse(data);
    parsedData.forEach(element => {
        if(uName == element.userName && pwd == element.password) {
            //console.log(userName + '---->'+ element);
            userFlag = true;
            element.password="";
            userData = element;
        }       
    });
    if(userFlag) {
        let token = jwt.sign(userData, secret, { expiresIn: '600s'})
        res.status(200).json({"token": token});
        
    }
    else {
        res.status(10001).json({
            "success": false,
            "msg": "Invalid User"
        });
    }
   
});