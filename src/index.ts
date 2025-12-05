import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './data-source';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON endpoint for download
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

import authRoutes from './routes/authRoutes';
import ragRoutes from './routes/ragRoutes';
import licenseRoutes from './routes/licenseRoutes';
import kbRoutes from './routes/kbRoutes';
import userRoutes from './routes/userRoutes';
import configRoutes from './routes/configRoutes';

app.use('/auth', authRoutes);
app.use('/rag', ragRoutes);
app.use('/licenses', licenseRoutes);
app.use('/knowledge-bases', kbRoutes);
app.use('/users', userRoutes);
app.use('/config', configRoutes);

app.get('/', (req, res) => {
  res.send('RAG Backend is running');
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
