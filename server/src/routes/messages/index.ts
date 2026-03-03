/**
 * /api/v1/messages — Spec System 08
 * Chat: channel listing, message history (wraps Stream SDK).
 * Stage 2 implementation — Stream integration placeholder.
 */
import { Router, Request, Response } from 'express';
import { validateJwt, resolveUser } from '../../middleware/auth.js';

export const messagesRouter = Router();

messagesRouter.use(validateJwt, resolveUser);

/**
 * GET /api/v1/messages/token
 * Generate a Stream chat token for the authenticated user.
 * The client uses this token to connect to Stream directly.
 */
messagesRouter.get('/token', async (req: Request, res: Response) => {
  // TODO: Implement Stream token generation
  // const chatClient = StreamChat.getInstance(config.stream.apiKey, config.stream.apiSecret);
  // const token = chatClient.createToken(req.user!.userId);
  res.json({
    data: {
      message: 'Stream chat integration — Stage 2',
      user_id: req.user!.userId,
    },
  });
});
