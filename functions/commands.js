import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const DROP_COMMAND = {
  name: "drop",
  description: "Where we dropping boys?",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
const STATS_COMMAND = {
  name: "stats",
  description: "Get player stats",
  options: [
    {
      type: 3,
      name: "username",
      description: "provide username",
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [DROP_COMMAND, STATS_COMMAND];
InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
