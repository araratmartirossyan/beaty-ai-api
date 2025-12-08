import { Router } from 'express';
import {
  createKnowledgeBase,
  listKnowledgeBases,
  attachToLicense,
  getKnowledgeBase,
  uploadPDF,
} from '../controllers/kbController';
import { authMiddleware } from '../middlewares/auth';
import { roleGuard } from '../middlewares/roleGuard';
import { UserRole } from '../entities/User';
import { upload } from '../utils/fileUpload';

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

/**
 * @swagger
 * /knowledge-bases/{id}:
 *   get:
 *     summary: Get a specific knowledge base by ID (Admin only)
 *     tags: [Knowledge Bases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Knowledge Base ID
 *     responses:
 *       200:
 *         description: Knowledge base details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KnowledgeBase'
 *       404:
 *         description: Knowledge base not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error fetching knowledge base
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', roleGuard([UserRole.ADMIN]), getKnowledgeBase);

/**
 * @swagger
 * /knowledge-bases/{id}/upload:
 *   post:
 *     summary: Upload a PDF file to a knowledge base (Admin only)
 *     tags: [Knowledge Bases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Knowledge Base ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload
 *     responses:
 *       201:
 *         description: PDF uploaded and ingested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PDF uploaded and ingested successfully
 *                 document:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     fileName:
 *                       type: string
 *                     pageCount:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Missing file or kbId, or empty PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Knowledge base not found
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
 *         description: Error uploading PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/upload', roleGuard([UserRole.ADMIN]), upload.single('file'), uploadPDF);

export default router;
