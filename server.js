// importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

// app config
// allow us to write API route
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: "1070597",
  key: "1760eee7dac5b50de768",
  secret: "0c87ad943d3e6427a5fb",
  cluster: "us2",
  encrypted: true,
});

// middlewares
app.use(express.json());
app.use(cors());

// Can use this instead of cors above
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });

//  DB config
const connection_url =
  "mongodb+srv://admin:tB00XDyYlIh521hi@cluster0.zut0u.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url),
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB is connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    // console.log("Change: ", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
      console.log("Pusher triggered");
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

// ????

// API routes
app.get("/", (req, res) => res.status(200).send("Hello Isyraf"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
      console.log("error getting messages", err);
    } else {
      res.status(201).send(`New Message Created: \n  ${data}`);
    }
  });
});

// listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));
