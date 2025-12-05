import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { License } from '../entities/License';
import { User } from '../entities/User';
import { sanitizeUser } from '../utils/userUtils';

const licenseRepository = AppDataSource.getRepository(License);
const userRepository = AppDataSource.getRepository(User);

/**
 * Helper function to check if a license is valid (active and not expired)
 */
export const isLicenseValid = (license: License): boolean => {
  if (!license.isActive) {
    return false;
  }
  if (license.expiresAt && new Date() > license.expiresAt) {
    return false;
  }
  return true;
};

export const createLicense = async (req: Request, res: Response) => {
  const { userId, validityPeriodDays } = req.body;

  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate expiration date if validityPeriodDays is provided
    let expiresAt: Date | null = null;
    if (validityPeriodDays && typeof validityPeriodDays === 'number' && validityPeriodDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validityPeriodDays);
    }

    // Dynamic import for uuid (ESM module)
    const { v4: uuidv4 } = await import('uuid');

    const license = licenseRepository.create({
      key: uuidv4(),
      user,
      expiresAt,
      isActive: true,
    });

    await licenseRepository.save(license);

    // Reload with relations and sanitize user
    const savedLicense = await licenseRepository.findOne({
      where: { id: license.id },
      relations: ['user', 'knowledgeBases'],
    });

    if (!savedLicense) {
      return res.status(500).json({ message: 'Error retrieving created license' });
    }

    return res.status(201).json({
      ...savedLicense,
      user: sanitizeUser(savedLicense.user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating license' });
  }
};

export const listLicenses = async (req: Request, res: Response) => {
  try {
    const licenses = await licenseRepository.find({ relations: ['user', 'knowledgeBases'] });
    // Add validation status and sanitize user data
    const licensesWithStatus = licenses.map((license) => ({
      ...license,
      user: sanitizeUser(license.user),
      isValid: isLicenseValid(license),
    }));
    return res.json(licensesWithStatus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error listing licenses' });
  }
};

export const deactivateLicense = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const license = await licenseRepository.findOneBy({ id });
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    license.isActive = false;
    await licenseRepository.save(license);

    // Reload with relations and sanitize user
    const updatedLicense = await licenseRepository.findOne({
      where: { id: license.id },
      relations: ['user', 'knowledgeBases'],
    });

    return res.json({
      message: 'License deactivated successfully',
      license: updatedLicense
        ? {
            ...updatedLicense,
            user: sanitizeUser(updatedLicense.user),
          }
        : license,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deactivating license' });
  }
};

export const activateLicense = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const license = await licenseRepository.findOneBy({ id });
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    license.isActive = true;
    await licenseRepository.save(license);

    // Reload with relations and sanitize user
    const updatedLicense = await licenseRepository.findOne({
      where: { id: license.id },
      relations: ['user', 'knowledgeBases'],
    });

    return res.json({
      message: 'License activated successfully',
      license: updatedLicense
        ? {
            ...updatedLicense,
            user: sanitizeUser(updatedLicense.user),
          }
        : license,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error activating license' });
  }
};

export const getLicense = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const license = await licenseRepository.findOne({
      where: { id },
      relations: ['user', 'knowledgeBases'],
    });

    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    return res.json({
      ...license,
      user: sanitizeUser(license.user),
      isValid: isLicenseValid(license),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching license' });
  }
};
