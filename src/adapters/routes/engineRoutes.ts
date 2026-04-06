import { Router } from 'express';
import { EngineController } from '../controllers/EngineController';
import { IUserProfileRepository } from '../../core/interfaces/IUserProfileRepository';
import { IEncryptionService } from '../../core/interfaces/IEncryptionService';
import { IIdentityEngine } from '../../core/interfaces/IIdentityEngine';

export function createEngineRouter(
  repository: IUserProfileRepository,
  encryption: IEncryptionService,
  engine: IIdentityEngine,
): Router {
  const router = Router();
  const ctrl = new EngineController(repository, encryption, engine);

  router.post('/transform', ctrl.transform);
  router.get('/platforms', ctrl.platforms);

  return router;
}
