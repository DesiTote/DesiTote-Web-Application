import { NextFunction, Request, Response } from "express";
import { subscribeService } from "./subscription.service.js";

export const subscribe = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const data = await subscribeService(req.body.email);

        res.status(201).json({
            success: true,
            message: "Subscribed successfully",
            data

        });
    } catch (error) {
        next(error)
    }

};