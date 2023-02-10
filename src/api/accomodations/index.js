import express from "express";
import createHttpError from "http-errors";
import AccomodationsModel from "./model.js";
import q2m from "query-to-mongo";
import { adminOnlyMiddleware } from "../../lib/auth/adminOnly.js";
import { hostOnlyMiddleware } from "../../lib/auth/hostsOnly.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const accomodationsRouter = express.Router();

accomodationsRouter.post(
  "/",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const newAccomodation = new AccomodationsModel({
        ...req.body,
        user: req.user._id,
      });
      const { _id } = await newAccomodation.save();
      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

accomodationsRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query);
      const total = await AccomodationsModel.countDocuments(
        mongoQuery.criteria
      );
      const accomodations = await AccomodationsModel.find(
        mongoQuery.criteria,
        mongoQuery.options.fields
      )
        .limit(mongoQuery.options.limit)
        .skip(mongoQuery.options.skip)
        .sort(mongoQuery.options.sort)
        .populate({
          path: "user",
        });
      res.send({
        links: mongoQuery.links("http://localhost:3001/accomodations", total),
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        accomodations,
      });
    } catch (error) {
      next(error);
    }
  }
);

accomodationsRouter.get(
  "/me",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationsModel.find({
        user: req.user._id,
      }).populate({
        path: "user",
      });
      if (accomodation) {
        res.send(accomodation);
      } else {
        next(
          createHttpError(
            404,
            `Accomodation with id ${req.params.accomodationId} is not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

accomodationsRouter.put(
  "/me/:accomodationId",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accomodationToUpdate = await AccomodationsModel.findById(
        req.params.accomodationId
      ).populate({
        path: "user",
      });
      if (accomodationToUpdate) {
        const myPost =
          accomodationToUpdate.user._id.toString() === req.user._id.toString();

        if (myPost) {
          const updatedAccomodation =
            await AccomodationsModel.findByIdAndUpdate(
              req.params.accomodationId,
              req.body,
              { new: true, runValidators: true }
            );
          res.send(updatedAccomodation);
        } else {
          next(createHttpError(403, "It's not your post"));
        }
      } else {
        next(
          createHttpError(
            404,
            `Accomodation with id ${req.params.accomodationId} is not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
accomodationsRouter.delete(
  "/me/:accomodationId",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accomodationToDelete = await AccomodationsModel.findById(
        req.params.accomodationId
      ).populate({
        path: "user",
      });
      if (accomodationToDelete) {
        const myPost =
          accomodationToDelete.user._id.toString() === req.user._id.toString();

        if (myPost) {
          const updatedAccomodation =
            await AccomodationsModel.findByIdAndDelete(
              req.params.accomodationId
            );
          res.status(204).send();
        } else {
          next(createHttpError(403, "It's not your post"));
        }
      } else {
        next(
          createHttpError(
            404,
            `Accomodation with id ${req.params.accomodationId} is not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

accomodationsRouter.get(
  "/:accomodationId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationsModel.findById(
        req.params.accomodationId
      ).populate({
        path: "user",
      });
      if (accomodation) {
        res.send(accomodation);
      } else {
        next(
          createHttpError(
            404,
            `Accomodation with id ${req.params.accomodationId} is not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
export default accomodationsRouter;
