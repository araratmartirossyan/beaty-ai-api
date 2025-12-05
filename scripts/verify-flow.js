"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:3000';
let token = '';
let userId = '';
let licenseKey = '';
let kbId = '';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            // 1. Register Admin
            console.log('1. Registering Admin...');
            const email = `admin-${Date.now()}@example.com`;
            try {
                const regRes = yield axios_1.default.post(`${API_URL}/auth/register`, {
                    email,
                    password: 'password123',
                    role: 'ADMIN'
                });
                userId = regRes.data.user.id;
                token = regRes.data.token;
                console.log('   Admin registered:', email);
            }
            catch (e) {
                console.log('   Registration failed (maybe exists), trying login...');
                // Login if exists
                const loginRes = yield axios_1.default.post(`${API_URL}/auth/login`, {
                    email,
                    password: 'password123'
                });
                token = loginRes.data.token;
                userId = loginRes.data.user.id;
            }
            // 2. Create License
            console.log('2. Creating License...');
            const licRes = yield axios_1.default.post(`${API_URL}/licenses`, {
                userId
            }, { headers: { Authorization: `Bearer ${token}` } });
            licenseKey = licRes.data.key;
            const licenseId = licRes.data.id;
            console.log('   License created:', licenseKey);
            // 3. Create Knowledge Base
            console.log('3. Creating Knowledge Base...');
            const kbRes = yield axios_1.default.post(`${API_URL}/knowledge-bases`, {
                name: 'Test KB',
                description: 'A test knowledge base',
                documents: { type: 'text', content: 'The sky is blue and the grass is green.' }
            }, { headers: { Authorization: `Bearer ${token}` } });
            kbId = kbRes.data.id;
            console.log('   KB created:', kbId);
            // 4. Ingest Document (Mock)
            console.log('4. Ingesting Document...');
            yield axios_1.default.post(`${API_URL}/rag/upload`, {
                licenseKey,
                text: 'The sky is blue and the grass is green. The sun is yellow.',
                metadata: { source: 'test.txt' }
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('   Document ingested.');
            // 5. Attach KB to License
            console.log('5. Attaching KB to License...');
            yield axios_1.default.post(`${API_URL}/knowledge-bases/attach`, {
                kbId,
                licenseId
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('   KB attached.');
            // 6. Chat
            console.log('6. Chatting...');
            // Note: This might fail if OPENAI_API_KEY is not set, but we want to verify the flow reaches the service.
            try {
                const chatRes = yield axios_1.default.post(`${API_URL}/rag/chat`, {
                    licenseKey,
                    question: 'What color is the sky?'
                }, { headers: { Authorization: `Bearer ${token}` } });
                console.log('   Answer:', chatRes.data.answer);
            }
            catch (e) {
                console.log('   Chat failed (expected if no API key):', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || e.message);
            }
        }
        catch (error) {
            console.error('Error:', ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        }
    });
}
run();
