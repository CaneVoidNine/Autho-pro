import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  notYourZoneHandler,
  unAuthorizedHandler,
} from "./errorHandlers.js";
import usersRouter from "./api/users/index.js";
import accomodationsRouter from "./api/accomodations/index.js";

const server = express();
const port = process.env.port;

server.use(cors());
server.use(express.json());

server.use("/accomodations", accomodationsRouter);
server.use("/users", usersRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(notYourZoneHandler);
server.use(genericErrorHandler);
server.use(unAuthorizedHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo!");
  server.listen(port, () => {
    console.table(
      listEndpoints(server),
      console.log(`Server's port is ${port}`)
    );
  });
});
