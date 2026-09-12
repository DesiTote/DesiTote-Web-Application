// Side-effect module: loads .env into process.env.
//
// This must be the FIRST import of every entry point (server, scripts).
// ES module imports are hoisted and evaluated before the importing module's
// own body runs, so calling dotenv.config() inline in server.ts happens AFTER
// every imported module has already been evaluated — any module that reads
// process.env at its top level would see undefined. Importing this module
// first guarantees the env is populated before that happens.
import dotenv from "dotenv";

dotenv.config();
