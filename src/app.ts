import express from "express";
import videoRoutes from "./routes/videoRoutes";

import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("src/views"));

app.post("/api/proxy", (req, res) => {
  const url = "https://api.api2convert.com/v2/jobs";
  const body = req.body;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-oc-api-key": "3dd0781164c7d9106593bf56162545f3",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => res.send(data))
    .catch((error) =>
      res.status(500).send("Erro ao buscar dados: " + error.message)
    );
});

app.post("/api/proxy/response", (req, res) => {
  const body = req.body;

  const url = `https://api.api2convert.com/v2/jobs/${body.id}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-oc-api-key": "fb40c4844cf07d8d12f2a4f93005ead2",
    },
  })
    .then((response) => response.json())
    .then((data) => res.send(data))
    .catch((error) =>
      res.status(500).send("Erro ao buscar dados: " + error.message)
    );
});

app.use("/api", videoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor Iniciado na URL: http://localhost:${PORT}`);
});
