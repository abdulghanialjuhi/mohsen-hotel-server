const express = require("express");
const cors = require("cors");
var admin = require("firebase-admin");

var serviceAccount = require("./mk-hotel-7a905-firebase-adminsdk-4715f-7a5c782d43.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mk-hotel-7a905-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/get-admins", (req, res) => {
    const users = []
    // List batch of users, 1000 at a time.
    admin.auth().listUsers(1000)
    .then((listUsersResult) => {
        listUsersResult.users.forEach((userRecord) => {
            // console.log('user', userRecord.toJSON().customClaims);
            if (userRecord.toJSON().customClaims) {
                const userObj = {}
                userObj['id'] = userRecord.toJSON().uid
                userObj['record'] = {'email': userRecord.toJSON().email, 'name': userRecord.toJSON().displayName}
                users.push(userObj)
            }

        });
    })
    .catch((error) => {
        console.log('Error listing users:', error);
    }).finally(() => {
        res.json({ users: users});
    })
});

app.get("/get-users", (req, res) => {
    const users = []
    // List batch of users, 1000 at a time.
    admin.auth().listUsers(1000)
    .then((listUsersResult) => {
        listUsersResult.users.forEach((userRecord) => {
            // console.log('user', userRecord.toJSON().customClaims);
            if (!userRecord.toJSON().customClaims) {
                const userObj = {}
                userObj['id'] = userRecord.toJSON().uid
                userObj['record'] = {'email': userRecord.toJSON().email, 'name': userRecord.toJSON().displayName}
                users.push(userObj)
            }

        });
    })
    .catch((error) => {
        console.log('Error listing users:', error);
    }).finally(() => {
        res.json({ users: users});
    })

});

app.post("/add-admin", (req, res) => {
    const { name, email, password } = req.body
    admin.auth()
    .createUser({
      email: email,
      password: password,
      displayName: name,
    })
    .then((userRecord) => {
        console.log('Successfully created new admin:', userRecord.uid);
        admin.auth().setCustomUserClaims(userRecord.uid, {
            admin: true
        }).then((res) => {console.log(res)})
        res.json({ uid: userRecord.uid});
    })
    .catch((error) => {
        console.log('Error creating new user:', error.errorInfo.message);
        if (error.errorInfo.message) {
            res.status(400).send({message: error.errorInfo.message})
        } else {
            res.status(400).send({message: "Error creating new user"})

        }
    });

});

app.post("/add-user", (req, res) => {
    const { name, email, password } = req.body
    admin.auth()
    .createUser({
      email: email,
      password: password,
      displayName: name,
    })
    .then((userRecord) => {
        console.log('Successfully created new user:', userRecord.uid);
        res.json({ uid: userRecord.uid});
    })
    .catch((error) => {
        console.log('Error creating new user:', error.errorInfo.message);
        if (error.errorInfo.message) {
            res.status(400).send({message: error.errorInfo.message})
        } else {
            res.status(400).send({message: "Error creating new user"})

        }
    });

});

app.post("/delete-user", (req, res) => {
    const { uid } = req.body
    console.log(uid);
    admin.auth()
    .deleteUser(uid)
    .then(() => {
      res.json({ 'response': 'user delted seccussfully'});
    })
    .catch((error) => {
        console.log('Error creating new user:', error);
        res.status(400).send({message: "Error deleting user"})
    });

});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});