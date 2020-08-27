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
          console.log(name);
          var startTime = parseInt(body.starth) * 60 + parseInt(body.startm);
          var endTime = parseInt(body.endh * 60) + parseInt(body.endm);
          userModel.find({ username: name }, (err, record) => {
            var y;

            for (y of record) {
              j++;
              var z;
              for (z of y.schedule) {
                k++;
                console.log(z.start);
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

function insert(body) {
  MongoClient.connect(
    connectionURL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        console.log("Unable to connect to Mongo");
        return;
      }
      var userNames = [];
      var startTime = parseInt(body.starth) * 60 + parseInt(body.startm);
      var endTime = parseInt(body.endh * 60) + parseInt(body.endm);
      if (body.achint) {
        userNames.push("achint");
      }
      if (body.vishal) {
        userNames.push("vishal");
      }
      if (body.himanshu) {
        userNames.push("himanshu");
      }

      var x;
      for (x of userNames) {
        const db = client.db(databaseName);
        db.collection("userdatas").update(
          { username: x },
          {
            $push: {
              schedule: {
                $each: [{ id: body.id, start: startTime, end: endTime }],
                $sort: { score: -1 },
                $slice: 3,
              },
            },
          }
        );
      }
    }
  );
}

function find_record(body, callback) {
  var startTime = parseInt(body.starth) * 60 + parseInt(body.startm);
  var endTime = parseInt(body.endh * 60) + parseInt(body.endm);
  console.log("aaaa");
  MongoClient.connect(
    connectionURL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        console.log("Unable to connect to Mongo");
        return;
      }
      var userNames = [];
      if (body.achint) {
        userNames.push("achint");
      }
      if (body.vishal) {
        userNames.push("vishal");
      }
      if (body.himanshu) {
        userNames.push("himanshu");
      }

      var x;
      for (x of userNames) {
        const db = client.db(databaseName);
        var cnt = 0;
        db.collection("userdatas")
          .find({ username: x })
          .toArray((error, record) => {
            var x, y, z;
            for (x of record) {
              for (y of x.schedule) {
                if (
                  (startTime > y.start && startTime < y.end) ||
                  (endTime > y.start && endTime < y.end) ||
                  (startTime < y.start && endTime > y.end)
                ) {
                  cnt++;
                }
              }
            }
            if (cnt != 0) {
              callback(false);
            } else {
              callback(true);
            }
          });
      }
    }
  );
}

function delete_interview(body) {
  MongoClient.connect(
    connectionURL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        console.log("Unable to connect to Mongo");
        return;
      }
      var userNames = [];
      if (body.achint) {
        userNames.push("achint");
      }
      if (body.vishal) {
        userNames.push("vishal");
      }
      if (body.himanshu) {
        userNames.push("himanshu");
      }

      var x;
      for (x of userNames) {
        const db = client.db(databaseName);
        db.collection("userdatas").update(
          { username: x },
          { $pop: { schedule: 1 } }
        );
      }
    }
  );
}

router.get("/adding", (req, res) => {
  var delete_record = 0;
  var insertion_flag = 0;
  var arr = [];
  var userNumber = 0;
  if (req.query.himanshu) {
    userNumber++;
  }
  if (req.query.achint) {
    userNumber++;
  }
  if (req.query.vishal) {
    userNumber++;
  }

  if (userNumber < 2) {
    return res.render("lessthantwo");
  }

  // find_record(req.query, (val) => {
  //   console.log(val);
  //   if (val) {
  //     try {
  //       res.render("interviewplaced");
  //       if (insertion_flag == 0) {
  //         insert(req.query);
  //       }
  //     } catch {
  //       console.log("already placed");
  //     }

  //     insertion_flag++;
  //   } else {
  //     try {
  //       res.render("error");
  //     } catch (e) {
  //       console.log("error in rendering");
  //       if (delete_record == 0 && insertion_flag != 0) {
  //         delete_record++;
  //         delete_interview(req.query);
  //         console.log("Deleted");
  //       } else {
  //         console.log("already deleted or not inserted earlier");
  //       }
  //     }
  //   }
  // });

  checkTimeError(req.query)
    .then((result) => {
      res.render("interviewplaced");
      insert(req.query);
    })
    .catch((err) => {
      res.render("error");
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

module.exports = router;
