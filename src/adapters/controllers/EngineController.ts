import { Request, Response } from 'express';
import { TransformIntent } from '../../core/use-cases/TransformIntent';
import { IUserProfileRepository } from '../../core/interfaces/IUserProfileRepository';
import { IEncryptionService } from '../../core/interfaces/IEncryptionService';
import { IIdentityEngine } from '../../core/interfaces/IIdentityEngine';
import { getSupportedPlatforms } from '../../infrastructure/engine/PlatformConfig';

export class EngineController {
  private readonly transformUC: TransformIntent;

  constructor(
    repository: IUserProfileRepository,
    encryption: IEncryptionService,
    engine: IIdentityEngine,
  ) {
    this.transformUC = new TransformIntent(repository, encryption, engine);
  }

  /**
   * POST /engine/transform
   * Body: { userId, rawIntent, platform }
   */
  transform = async (req: Request, res: Response): Promise<void> => {
    const { userId, rawIntent, platform } = req.body as {
      userId?: string;
      rawIntent?: string;
      platform?: string;
    };

    if (!userId || !rawIntent || !platform) {
      res.status(400).json({
        success: false,
        message: 'userId, rawIntent, and platform are all required.',
      });
      return;
    }

    try {
      const output = await this.transformUC.execute({ userId, rawIntent, platform });
      res.status(200).json({ success: true, data: output });
    } catch (err) {
      const message = (err as Error).message;
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  };

  /**
   * GET /engine/platforms
   * Returns the list of supported platforms and their configs.
   */
  platforms = (_req: Request, res: Response): void => {
    res.json({ success: true, data: getSupportedPlatforms() });
  };
}
