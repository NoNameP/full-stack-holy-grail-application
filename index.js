const express = require("express");
const app = express();
const redis = require("redis");
const client = redis.createClient();

app.use(express.static("public"));

async function load() {
  try {
    await client.connect();

    await client.mSet(
      "header",
      0,
      "left",
      0,
      "article",
      0,
      "right",
      0,
      "footer",
      0
    );

    await client.disconnect();
  } catch (error) {
    console.log(error);
  }
}

async function getData() {
  try {
    await client.connect();
    const data = await client.mGet([
      "header",
      "left",
      "article",
      "right",
      "footer",
    ]);

    await client.disconnect();

    return {
      header: Number(data[0]),
      left: Number(data[1]),
      article: Number(data[2]),
      right: Number(data[3]),
      footer: Number(data[4]),
    };
  } catch (err) {
    console.log(err);
  }
}

app.get("/update/:key/:value", async function (req, res) {
  try {
    const key = req.params.key;
    let value = Number(req.params.value);

    await client.connect();

    const currentData = await client.get(key);
    const newValue = Number(currentData) + value;

    await client.set(key, newValue);
    await client.disconnect();

    const data = await getData();
    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/data", async function (req, res) {
  try {
    await load();
    const myData = await getData();
    res.send(myData);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
