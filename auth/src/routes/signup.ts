import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@weworkbetter/common';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('email already in use');
    }

    const user = User.build({
      email,
      password,
    });
    await user.save();

    // generate jwt
    // set the payload
    // store it on the session object
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // The ts will not allow this reference
    // as the type definition file we installed
    // along with cookie-session is not assuming
    // we have an object like session. Therefore
    // we need to refactor this assignment as it is
    // shown below.
    //req.session.jwt = userJwt;

    // refactored
    // I cannot under
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
