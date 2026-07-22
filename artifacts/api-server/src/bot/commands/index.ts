import type { Command } from "../types.js";

import ban from "./ban.js";
import kick from "./kick.js";
import warn from "./warn.js";
import warnings from "./warnings.js";
import clearwarnings from "./clearwarnings.js";
import purge from "./purge.js";
import mute from "./mute.js";
import unmute from "./unmute.js";
import userinfo from "./userinfo.js";
import slowmode from "./slowmode.js";
import reactionrole from "./reactionrole.js";
import help from "./help.js";
import setwelcome from "./setwelcome.js";
import setgoodbye from "./setgoodbye.js";

export const PREFIX_COMMANDS: Command[] = [
  ban, kick, warn, warnings, clearwarnings,
  purge, mute, unmute, userinfo, slowmode,
  reactionrole, help,
  setwelcome, setgoodbye,
];
