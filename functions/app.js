import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from "discord-interactions";
import "dotenv/config";
import express from "express";
import axios from "axios";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
// app.use(express.json());
app.use(
  cors({
    origin: "*", // Replace with your actual origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Enable credentials
  })
);

app.get("/", (req, res) => {
  res.send('"hello from aws');
});

// if (process.env.environment !== "dev") {
//   process.env.APP_ID = functions.config().fortbot.app_id;
//   process.env.DISCORD_TOKEN = functions.config().fortbot.discord_token;
//   process.env.PUBLIC_KEY = functions.config().fortbot.public_key;
//   process.env.FORTNITE_KEY = functions.config().fortbot.fortnite_key;
// }
app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async function (req, res) {
    const { type, id, data } = req.body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === "drop") {
        const locations = await axios.get("https://fortnite-api.com/v1/map");
        let drops = locations.data.data.pois;
        drops = drops.filter((el) => !el.id.includes("UnNamed"));
        const random = Math.floor(Math.random() * drops.length);
        const suggestedLocation = drops[random].name;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: suggestedLocation,
          },
        });
      }

      if (name === "stats") {
        const username = data.options[0].value;
        const config = {
          headers: {
            Authorization: process.env.FORTNITE_KEY,
          },
          params: {
            name: username,
          },
        };
        try {
          const stats = await axios.get(
            "https://fortnite-api.com/v2/stats/br/v2",
            config
          );
          const overall = stats.data.data.stats.all.overall;
          const userStats = `wins: ${overall.wins}\nkills: ${overall.kills}\nkd: ${overall.kd}`;
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: userStats,
            },
          });
        } catch (err) {
          console.log(err.response.data);
          if (err.status === 404) {
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: "Username not found..",
              },
            });
          }
        }
      }

      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: "unknown command" });
    }
  }
);

// app.listen(PORT, () => {
//   console.log("Listening on port", PORT);
// });
export default app;
// export const fortbot = onRequest(app);
