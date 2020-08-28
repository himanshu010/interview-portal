const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const { MongoClient } = require("mongodb");
const connectionURL = "mongodb://localhost:27017";
const databaseName = "portal";

const userModel = mongoose.model("userData");

router.get("/add", (req, res) => {
  userModel.find((err, docs) => {
    if (err) {
      return console.log("Can't find user Model");
    }
    res.render("addinterview", { data: docs });
  });
});

router.get("/update", (req, res) => {
  res.render("updatetime");
});

var checkTimeError = function (body) {
  return new Promise((resolve, reject) => {
    userModel.find((err, docs) => {
      if (err) {
        return console.log("Can't find user Model");
      }
      var x;
      var i = 0,
        j = 0,
        k = 0;
      for (x of docs) {
        i++;
        var name = x.username;
        if (body[name]) {
          var startTime = parseInt(body.starth) * 60 + parseInt(body.startm);
          var endTime = parseInt(body.endh * 60) + parseInt(body.endm);
          userModel.find({ username: name }, (err, record) => {
            var y;

            for (y of record) {
              j++;
              var z;
              for (z of y.schedule) {
                k++;
                if (
                  (startTime >= z.start && startTime <= z.end) ||
                  (endTime >= z.start && endTime <= z.end) ||
                  (startTime <= z.start && endTime >= z.end)
                ) {
                  reject("can't set");
                } else if (
                  i == docs.length &&
                  j == record.length &&
                  k == y.schedule.length
                ) {
                  resolve("set");
                }
              }
            }
          });
        }
      }
    });
  });
};

var find_users_to_update = function (body) {
  return new Promise((resolve, reject) => {
    userModel.find((err, docs) => {
      if (err) {
        reject("Connection to database failed");
      } else {
        var users_to_interview = [];
        // console.log(docs);
        for (var x of docs) {
          for (var y of x.schedule) {
            if (y.id == body.id) {
              users_to_interview.push(x.username);
              break;
            }
          }
        }
        resolve(users_to_interview);
      }
    });
  });
};

function insert(body) {
  MongoClient.connect(
    connectionURL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        console.log("Unable to connect to Mongo");
        return;
      }
      var startTime = parseInt(body.starth) * 60 + parseInt(body.startm);
      var endTime = parseInt(body.endh * 60) + parseInt(body.endm);

      userModel.find((err, docs) => {
        if (err) {
          return console.log("Connection to database not eshtablished");
        }
        var userNames = [];
        for (var x of docs) {
          if (body[x.username]) {
            userNames.push(x.username);
          }
        }
        for (var x of userNames) {
          const db = client.db(databaseName);
          db.collection("userdatas").update(
            { username: x },
            {
              $push: {
                schedule: {
                  $each: [{ id: body.id, start: startTime, end: endTime }],
                },
              },
            }
          );
        }
      });
    }
  );
}

var checkLessThanTwoError = function (body) {
  return new Promise((resolve, reject) => {
    userModel.find((err, docs) => {
      if (err) {
        reject(err);
      }
      var cnt = 0,
        it = 0;
      for (var x of docs) {
        it++;
        if (body[x.username]) {
          cnt++;
          if (cnt >= 2) {
            resolve("More than 2");
          }
        }
        if (it == docs.length) {
          reject("Less Than 2");
        }
      }
    });
  });
};

//FIND

// function find_record(body, callback) {
//   var startTime = parseInt(body.starth) * 60 + parseInt(body.startm);
//   var endTime = parseInt(body.endh * 60) + parseInt(body.endm);
//   console.log("aaaa");
//   MongoClient.connect(
//     connectionURL,
//     { useNewUrlParser: true },
//     (error, client) => {
//       if (error) {
//         console.log("Unable to connect to Mongo");
//         return;
//       }
//       var userNames = [];
//       if (body.achint) {
//         userNames.push("achint");
//       }
//       if (body.vishal) {
//         userNames.push("vishal");
//       }
//       if (body.himanshu) {
//         userNames.push("himanshu");
//       }

//       var x;
//       for (x of userNames) {
//         const db = client.db(databaseName);
//         var cnt = 0;
//         db.collection("userdatas")
//           .find({ username: x })
//           .toArray((error, record) => {
//             var x, y, z;
//             for (x of record) {
//               for (y of x.schedule) {
//                 if (
//                   (startTime > y.start && startTime < y.end) ||
//                   (endTime > y.start && endTime < y.end) ||
//                   (startTime < y.start && endTime > y.end)
//                 ) {
//                   cnt++;
//                 }
//               }
//             }
//             if (cnt != 0) {
//               callback(false);
//             } else {
//               callback(true);
//             }
//           });
//       }
//     }
//   );
// }

//DELETE

// function delete_interview(body) {
//   MongoClient.connect(
//     connectionURL,
//     { useNewUrlParser: true },
//     (error, client) => {
//       if (error) {
//         console.log("Unable to connect to Mongo");
//         return;
//       }
//       var userNames = [];
//       if (body.achint) {
//         userNames.push("achint");
//       }
//       if (body.vishal) {
//         userNames.push("vishal");
//       }
//       if (body.himanshu) {
//         userNames.push("himanshu");
//       }

//       var x;
//       for (x of userNames) {
//         const db = client.db(databaseName);
//         db.collection("userdatas").update(
//           { username: x },
//           { $pop: { schedule: 1 } }
//         );
//       }
//     }
//   );
// }

router.get("/adding", (req, res) => {
  checkLessThanTwoError(req.query)
    .then((result) => {
      checkTimeError(req.query)
        .then((result) => {
          insert(req.query);
          return res.render("interviewplaced");
        })
        .catch((err) => {
          return res.render("error");
        });
    })
    .catch((err) => {
      console.log(err);
      return res.render("lessthantwo");
    });
});

router.get("/list", (req, res) => {
  userModel.find((err, docs) => {
    if (err) {
      return console.log("Can't find user Model");
    }
    var arr = [];

    var x, y;

    for (x of docs) {
      var obj = {};
      obj.name = x.username;
      var aa = [];
      for (y of x.schedule) {
        var obj1 = {};
        obj1.id = y.id;
        obj1.starth = Math.floor(y.start / 60);
        if (obj1.starth < 9) {
          obj1.starth = "0" + obj1.starth;
        }
        obj1.startm = Math.round(y.start % 60);
        if (obj1.startm < 9) {
          obj1.startm = "0" + obj1.startm;
        }
        obj1.endh = Math.floor(y.end / 60);
        if (obj1.endh < 9) {
          obj1.endh = "0" + obj1.endh;
        }
        obj1.endm = Math.round(y.end % 60);
        if (obj1.endm < 9) {
          obj1.endm = "0" + obj1.endm;
        }

        aa.push(obj1);
      }
      obj.reserved = aa;
      arr.push(obj);
    }

    console.log(arr);

    res.render("list", {
      data: arr,
    });
  });
});

// var update_time = () => {};

router.get("/updating", (req, res) => {
  res.send(req.query);
  find_users_to_update(req.query)
    .then((result) => {
      // console.log(result);
      var obj = {};
      for (var x of result) {
        obj[x] = true;
      }

      obj.starth = req.query.starth;
      obj.startm = req.query.startm;
      obj.endh = req.query.endh;
      obj.endm = req.query.endm;
      // console.log(obj);

      checkTimeError(obj)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
