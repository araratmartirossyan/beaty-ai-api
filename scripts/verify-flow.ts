import axios from 'axios';

const API_URL = 'http://localhost:3000';
let token = '';
let userId = '';
let licenseKey = '';
let kbId = '';

async function run() {
  try {
    // 1. Register Admin
    console.log('1. Registering Admin...');
    const email = `admin-${Date.now()}@example.com`;
    try {
        const regRes = await axios.post(`${API_URL}/auth/register`, {
        email,
        password: 'password123',
        role: 'ADMIN'
        });
        userId = regRes.data.user.id;
        token = regRes.data.token;
        console.log('   Admin registered:', email);
    } catch (e: any) {
        console.log('   Registration failed (maybe exists), trying login...');
        // Login if exists
         const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: 'password123'
        });
        token = loginRes.data.token;
        userId = loginRes.data.user.id;
    }

    // 2. Create License
    console.log('2. Creating License...');
    const licRes = await axios.post(`${API_URL}/licenses`, {
      userId
    }, { headers: { Authorization: `Bearer ${token}` } });
    licenseKey = licRes.data.key;
    const licenseId = licRes.data.id;
    console.log('   License created:', licenseKey);

    // 3. Create Knowledge Base
    console.log('3. Creating Knowledge Base...');
    const kbRes = await axios.post(`${API_URL}/knowledge-bases`, {
      name: 'Test KB',
      description: 'A test knowledge base',
      documents: { type: 'text', content: 'The sky is blue and the grass is green.' }
    }, { headers: { Authorization: `Bearer ${token}` } });
    kbId = kbRes.data.id;
    console.log('   KB created:', kbId);

    // 4. Ingest Document (Mock)
    console.log('4. Ingesting Document...');
    await axios.post(`${API_URL}/rag/upload`, {
      licenseKey,
      text: 'The sky is blue and the grass is green. The sun is yellow.',
      metadata: { source: 'test.txt' }
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('   Document ingested.');

    // 5. Attach KB to License
    console.log('5. Attaching KB to License...');
    await axios.post(`${API_URL}/knowledge-bases/attach`, {
      kbId,
      licenseId
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('   KB attached.');

    // 6. Chat
    console.log('6. Chatting...');
    // Note: This might fail if OPENAI_API_KEY is not set, but we want to verify the flow reaches the service.
    try {
        const chatRes = await axios.post(`${API_URL}/rag/chat`, {
        licenseKey,
        question: 'What color is the sky?'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('   Answer:', chatRes.data.answer);
    } catch (e: any) {
        console.log('   Chat failed (expected if no API key):', e.response?.data?.message || e.message);
    }

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

run();
