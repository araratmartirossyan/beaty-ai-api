import { Router } from 'express';
import {
  createKnowledgeBase,
  listKnowledgeBases,
  attachToLicense,
  getKnowledgeBase,
} from '../controllers/kbController';
import { authMiddleware } from '../middlewares/auth';
import { roleGuard } from '../middlewares/roleGuard';
import { UserRole } from '../entities/User';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /knowledge-bases:
 *   post:
 *     summary: Create a new knowledge base (Admin only)
 *     tags: [Knowledge Bases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateKnowledgeBaseRequest'
 *     responses:
 *       201:
 *         description: Knowledge base created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KnowledgeBase'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error creating knowledge base
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', roleGuard([UserRole.ADMIN]), createKnowledgeBase);

/**
 * @swagger
 * /knowledge-bases:
 *   get:
 *     summary: List all knowledge bases (Admin only)
 *     tags: [Knowledge Bases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of knowledge bases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KnowledgeBase'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error listing knowledge bases
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', roleGuard([UserRole.ADMIN]), listKnowledgeBases);

/**
 * @swagger
 * /knowledge-bases/attach:
 *   post:
 *     summary: Attach a knowledge base to a license (Admin only)
 *     tags: [Knowledge Bases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttachKnowledgeBaseRequest'
 *     responses:
 *       200:
 *         description: Knowledge base attached successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Knowledge Base attached to License successfully
 *       404:
 *         description: Knowledge Base or License not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error attaching knowledge base
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/attach', roleGuard([UserRole.ADMIN]), attachToLicense);

export default router;
