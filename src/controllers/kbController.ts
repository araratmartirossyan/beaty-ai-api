import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { KnowledgeBase } from '../entities/KnowledgeBase';
import { License } from '../entities/License';

const kbRepository = AppDataSource.getRepository(KnowledgeBase);
const licenseRepository = AppDataSource.getRepository(License);

export const createKnowledgeBase = async (req: Request, res: Response) => {
  const { name, description, documents, promptInstructions } = req.body;

  try {
    const kb = kbRepository.create({
      name,
      description,
      documents,
      promptInstructions: promptInstructions || null,
    });

    await kbRepository.save(kb);
    return res.status(201).json(kb);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating knowledge base' });
  }
};

export const getKnowledgeBase = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const kb = await kbRepository.findOne({
      where: { id },
      relations: ['licenses'],
    });

    if (!kb) {
      return res.status(404).json({ message: 'Knowledge base not found' });
    }

    return res.json(kb);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching knowledge base' });
  }
};

export const listKnowledgeBases = async (req: Request, res: Response) => {
  try {
    const kbs = await kbRepository.find();
    return res.json(kbs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error listing knowledge bases' });
  }
};

export const attachToLicense = async (req: Request, res: Response) => {
  const { kbId, licenseId } = req.body;

  try {
    const kb = await kbRepository.findOneBy({ id: kbId });
    const license = await licenseRepository.findOne({
      where: { id: licenseId },
      relations: ['knowledgeBases'],
    });

    if (!kb || !license) {
      return res.status(404).json({ message: 'Knowledge Base or License not found' });
    }

    license.knowledgeBases.push(kb);
    await licenseRepository.save(license);

    return res.json({ message: 'Knowledge Base attached to License successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error attaching knowledge base' });
  }
};
