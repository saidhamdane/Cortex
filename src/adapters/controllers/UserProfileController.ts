import { Request, Response } from 'express';
import { CreateUserProfile } from '../../core/use-cases/CreateUserProfile';
import { UpdateIdentityDNA } from '../../core/use-cases/UpdateIdentityDNA';
import { ManageCredentials } from '../../core/use-cases/ManageCredentials';
import { IUserProfileRepository } from '../../core/interfaces/IUserProfileRepository';
import { IEncryptionService } from '../../core/interfaces/IEncryptionService';

export class UserProfileController {
  private readonly createProfileUC: CreateUserProfile;
  private readonly updateDnaUC: UpdateIdentityDNA;
  private readonly manageCredsUC: ManageCredentials;

  constructor(
    private readonly repository: IUserProfileRepository,
    private readonly encryption: IEncryptionService,
  ) {
    this.createProfileUC = new CreateUserProfile(repository, encryption);
    this.updateDnaUC = new UpdateIdentityDNA(repository);
    this.manageCredsUC = new ManageCredentials(repository, encryption);
  }

  /** POST /profiles */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.createProfileUC.execute(req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  };

  /** GET /profiles/:id */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.repository.findById(req.params.id);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found.' });
        return;
      }
      res.json({ success: true, data: profile });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  };

  /** PATCH /profiles/:id/identity-dna */
  updateDNA = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this.updateDnaUC.execute({
        userId: req.params.id,
        identity_dna: req.body,
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  };

  /** PUT /profiles/:id/credentials */
  addOrUpdateCredential = async (req: Request, res: Response): Promise<void> => {
    try {
      const { platform, apiKey } = req.body as { platform: string; apiKey: string };
      if (!platform || !apiKey) {
        res.status(400).json({ success: false, message: 'platform and apiKey are required.' });
        return;
      }
      const updated = await this.manageCredsUC.addOrUpdate({
        userId: req.params.id,
        platform,
        apiKey,
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  };

  /** DELETE /profiles/:id/credentials/:platform */
  removeCredential = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this.manageCredsUC.remove(req.params.id, req.params.platform);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  };

  /** GET /profiles/:id/credentials/:platform/decrypt
   *  Returns the decrypted API key — use only for trusted internal calls.
   */
  decryptCredential = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.repository.findById(req.params.id);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found.' });
        return;
      }
      const key = this.manageCredsUC.getDecryptedKey(profile, req.params.platform);
      res.json({ success: true, data: { platform: req.params.platform, apiKey: key } });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  };

  /** DELETE /profiles/:id */
  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.repository.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  };
}
