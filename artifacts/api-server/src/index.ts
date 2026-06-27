import app from "./app";
import { logger } from "./lib/logger";
import { startBot } from "./bot/index.js";

const port = Number(process.env["PORT"] || "3000");

// Listen first so healthchecks pass immediately, then start the bot
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startBot();
});
