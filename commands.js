import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const TEST_COMMAND = {
  name: "testing",
  description: "Basic command for fort",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const DROP_COMMAND = {
  name: "drop",
  description: "Where we dropping boys?",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [TEST_COMMAND, DROP_COMMAND];
InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
