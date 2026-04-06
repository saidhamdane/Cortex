import { Router } from 'express';
import { UserProfileController } from '../controllers/UserProfileController';
import { IUserProfileRepository } from '../../core/interfaces/IUserProfileRepository';
import { IEncryptionService } from '../../core/interfaces/IEncryptionService';

export function createUserProfileRouter(
  repository: IUserProfileRepository,
  encryption: IEncryptionService,
): Router {
  const router = Router();
  const ctrl = new UserProfileController(repository, encryption);

  router.post('/', ctrl.create);
  router.get('/:id', ctrl.getById);
  router.patch('/:id/identity-dna', ctrl.updateDNA);
  router.put('/:id/credentials', ctrl.addOrUpdateCredential);
  router.delete('/:id/credentials/:platform', ctrl.removeCredential);
  router.get('/:id/credentials/:platform/decrypt', ctrl.decryptCredential);
  router.delete('/:id', ctrl.remove);

  return router;
}
