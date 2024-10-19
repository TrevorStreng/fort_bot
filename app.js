import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from "discord-interactions";
import "dotenv/config";
import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

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

      // if (name === "testing") {
      //   return res.send({
      //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //     data: {
      //       content: `hello world`,
      //     },
      //   });
      // }

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
        const username = req.body.data.options[0].value;
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

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
export default app;
