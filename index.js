require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Phone = require("./models/phone");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens["body"](req),
    ].join(" ");
  })
);

// let phonebook = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

// if (process.argv.length === 5) {
//   const phone = new Phone({
//     name: process.argv[3],
//     number: process.argv[4],
//   });

//   phone.save().then((result) => {
//     console.log(`Added ${result.name} ${result.number}`);
//     mongoose.connection.close();
//   });
// }

// if (process.argv.length === 3) {
//   console.log("phonebook:");
//   Phone.find({}).then((result) => {
//     result.forEach((phone) => {
//       console.log(`${phone.name} ${phone.number}`);
//     });
//     mongoose.connection.close();
//   });
// }

app.get("/api/persons", (request, response) => {
  Phone.find({}).then((result) => {
    response.json(result);
    // mongoose.connection.close();
  });
});

app.get("/api/persons/:id", (request, response) => {
  Phone.findById(request.params.id).then((person) => {
    // if (person.name) {
      response.json(person);
    // } else {
    //   response.status(404).end();
    // }
  });
});

app.get("/info", (request, response) => {
  response.send(
    `<div><p>Phonebook has info for ${
      phonebook.length
    } people</p><p>${new Date()}</p></div>`
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  phonebook = phonebook.filter((person) => person.id !== id);

  response.status(204).end();
});

function generateId() {
  const maxId = Math.floor(Math.random() * 1000000);
  return maxId;
}

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  Phone.find({}).then((result) => {
    if (result.find((person) => person.name === body.name)) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }
    const phone = new Phone({
      name: body.name,
      number: body.number,
    });

    phone.save().then((savedPhone) => {
      response.json(savedPhone);
    });
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
