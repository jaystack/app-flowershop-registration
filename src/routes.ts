import { Request, Response } from "express";
import * as express from 'express';
import { Router as router } from 'express';

router.get('/registration', (req, res, next) => res.render('registration'))

export { router };