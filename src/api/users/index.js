import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import q2m from "query-to-mongo";
import { adminOnlyMiddleware } from "../../lib/auth/adminOnly.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { createAccessToken } from "../../lib/auth/tools.js";

const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id, role } = await newUser.save();
    const payload = { _id: newUser._id, role: newUser.role };
    const accessToken = await createAccessToken(payload);
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, role: user.role };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials are not OK!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `user with id ${req.user._id} is not found`));
    }
  } catch (error) {
    next(error);
  }
});
usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `user with id ${req.user._id} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.user._id);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `user with id ${req.user._id} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query);
      const total = await UsersModel.countDocuments(mongoQuery.criteria);
      const authors = await UsersModel.find(
        mongoQuery.criteria,
        mongoQuery.options.fields
      )
        .limit(mongoQuery.options.limit)
        .skip(mongoQuery.options.skip)
        .sort(mongoQuery.options.sort);
      res.send({
        links: mongoQuery.links("http://localhost:3001/users", total),
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        authors,
      });
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.put("/:userId", adminOnlyMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `user with id ${req.user._id} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", adminOnlyMiddleware, async (req, res, next) => {
  try {
    const deletedUser = UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `user with id ${req.user._id} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
