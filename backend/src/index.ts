import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/mongodb';
dotenv.config();
import authRoutes from './routers/auth.routes';
import otpRoutes from './routers/otp.routes';
import oauthRoutes from './routers/oauth.routes';
import userDataRoutes from './routers/userDataRoutes';
import orderRoutes from './routers/orderRoutes';
import passwordResetRoutes from './routers/passwordResetRoutes';
import walletRoutes from './routers/walletRoutes';
import adminRoutes from './routers/adminRoutes';
import scratchCardRoutes from './routers/scratchCardRoutes';
import productRoutes from './routers/productRoutes';
import seasonRoutes from './routers/seasonRoutes';
import festivalRoutes from './routers/festivalRoutes';
import siteReviewRoutes from './routers/siteReviewRoutes';
import brandSpotlightRoutes from './routers/brandSpotlightRoutes';
import autoPurchaseRoutes from './routers/autoPurchase.routes';
import passport from './utils/lambda';


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(passport.initialize());

// Serve static files (uploaded images)
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userDataRoutes);
app.use('/api/otp', otpRoutes); // Changed path from /api/auth to /api/otp
app.use('/api/oauth', oauthRoutes); // Changed path from /api/auth to /api/oauth
app.use('/api/wallet', walletRoutes);
app.use('/api/password-reset', passwordResetRoutes); // Changed path from /api/password to /api/password-reset
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/scratch-cards', scratchCardRoutes);
app.use('/api/products', productRoutes); // Added productRoutes
app.use('/api/seasons', seasonRoutes);
app.use('/api/festivals', festivalRoutes);
app.use('/api/site-reviews', siteReviewRoutes);
app.use('/api/brand-spotlights', brandSpotlightRoutes);
app.use('/api/auto-purchase', autoPurchaseRoutes);

// Removed orderRoutes as it was not present in the desired routes snippet.

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Aether Server Running', status: 'healthy' });
});

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server to HTTP server
const wss = new WebSocketServer({ server });

interface Client {
    ws: WebSocket;
    sessionId: string;
    role: 'host' | 'guest';
}

const clients = new Map<WebSocket, Client>();

// Connect to MongoDB
const Start_Server = async () => {

    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            // console.log(`HTTP API: http://localhost:${PORT}`);
            // console.log(`WebSocket: ws://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            const { type, sessionId, payload } = data;

            switch (type) {
                case 'CREATE_SESSION':
                    const newSessionId = Math.random().toString(36).substring(7);
                    clients.set(ws, { ws, sessionId: newSessionId, role: 'host' });
                    ws.send(JSON.stringify({ type: 'SESSION_CREATED', sessionId: newSessionId, role: 'host' }));
                    console.log(`Session created: ${newSessionId}`);
                    break;

                case 'JOIN_SESSION':
                    clients.set(ws, { ws, sessionId, role: 'guest' });
                    ws.send(JSON.stringify({ type: 'SESSION_JOINED', sessionId, role: 'guest' }));
                    broadcastToSession(sessionId, { type: 'GUEST_JOINED' }, ws);
                    console.log(`Client joined session: ${sessionId}`);
                    break;

                case 'NAVIGATE':
                case 'SCROLL':
                case 'CURSOR_MOVE':
                case 'CLICK':
                case 'INPUT':
                case 'PRIVACY_TOGGLE':
                case 'SYNC_STATE':
                    if (sessionId) {
                        broadcastToSession(sessionId, { type, payload }, ws);
                    }
                    break;

                default:
                    break;
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        const client = clients.get(ws);
        if (client) {
            console.log(`Client disconnected from session ${client.sessionId}`);
            broadcastToSession(client.sessionId, { type: 'PEER_DISCONNECTED' }, ws);
            clients.delete(ws);
        }
    });
});

function broadcastToSession(sessionId: string, message: any, sender: WebSocket) {
    clients.forEach((client) => {
        if (client.sessionId === sessionId && client.ws !== sender && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    });
}

Start_Server();
