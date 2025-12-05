import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { sanitizeUser } from '../utils/userUtils';

const userRepository = AppDataSource.getRepository(User);

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      relations: ['licenses'],
      order: { createdAt: 'DESC' },
    });
    
    // Sanitize all users (remove passwords)
    const sanitizedUsers = users.map((user) => sanitizeUser(user));
    
    return res.json(sanitizedUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error listing users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await userRepository.findOne({
      where: { id },
      relations: ['licenses'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

