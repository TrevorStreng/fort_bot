import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from "discord-interactions";
import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async function (req, res) {
    const { type, id, data } = req.body;
    console.log(req.body);

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === "testing") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `hello world`,
          },
        });
      }

      if (name === "drop") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Always tilted",
          },
        });
      }

      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: "unknown command" });
    }
  }
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
