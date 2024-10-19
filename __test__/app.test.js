import request from "supertest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import app from "../app";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import "dotenv/config";

const mock = new MockAdapter(axios);

process.env.FORTNITE_KEY = "fortnite key test";

// !TODO for testing in app.js
// * comment out
// * verifyKeyMiddleware(process.env.PUBLIC_KEY),
// * and
// * app.listen() to get rid of the jest warning
// & uncomment
// & app.use(express.json());

describe("Discord bot Interactions Tests", () => {
  afterEach(() => {
    mock.reset();
  });

  it("Should respond with Pong on Ping interaction", async () => {
    const response = await request(app).post("/interactions").send({
      type: InteractionType.PING,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.type).toBe(InteractionResponseType.PONG);
  });

  it("Should respond with a random drop location on 'drop' command", async () => {
    const mockData = {
      data: {
        pois: [
          { id: "Location1", name: "Tilted Towers" },
          { id: "UnNamedLocation", name: "Unnamed" },
          { id: "Location2", name: "Lazy Lake" },
        ],
      },
    };

    mock.onGet("https://fortnite-api.com/v1/map").reply(200, mockData);

    const res = await request(app)
      .post("/interactions")
      .send({
        type: InteractionType.APPLICATION_COMMAND,
        data: { name: "drop" },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.content).toMatch(/Tilted Towers|Lazy Lake/);
  });

  it("Should return stats for a given username", async () => {
    const mockStats = {
      data: {
        stats: {
          all: {
            overall: {
              wins: 10,
              kills: 100,
              kd: 2.1,
            },
          },
        },
      },
    };

    mock.onGet("https://fortnite-api.com/v2/stats/br/v2").reply(200, mockStats);

    const res = await request(app)
      .post("/interactions")
      .send({
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: "stats",
          options: [{ value: "testuser" }],
        },
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.content).toBe("wins: 10\nkills: 100\nkd: 2.1");
  });

  it("should return 'Username not found' for missing user", async () => {
    mock
      .onGet("https://fortnite-api.com/v2/stats/br/v2")
      .reply(404, { status: 404 });

    const res = await request(app)
      .post("/interactions")
      .send({
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: "stats",
          options: [{ value: "unkonwnuser" }],
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.content).toBe("Username not found..");
  });
});
