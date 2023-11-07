// upload
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import axios from "axios";
import rateLimit from "express-rate-limit";

// URL of the central server
const CENTRAL_SERVER = 'http://localhost:8000'; // 替换为实际地址

// Get host information. ============================================
export const getHostInfo = () => {
    return {
      architecture: os.arch(), 
      cpus: os.cpus().length, 
      totalMemory: bytesToGB(os.totalmem()), 
      freeMemory: bytesToGB(os.freemem()),
      uptime: formatUptime(os.uptime()),
      platform: os.platform(),
      release: os.release(),
    };
};

// Convert bytes to gigabytes ============================================
export const bytesToGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';

// Convert seconds to days, hours, and minutes
export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds % (3600 * 24) / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

const hostInfo = getHostInfo();
const id = 'API Service';

// Information about this service
const serviceInfo = {
  _id: id,
  url: 'http://localhost:3001',
  endpoints: [
    '/',
    '/register',
    '/login',
    '/tasks',
    '/api/upload',
    '/api/files',
    '/api/files/:filename',
    '/api/results',
    '/api/results/:filename',
    '/api/images',
    '/api/images/:imageName'
  ],
  hostInfo: hostInfo
};


// Upload Function ============================================
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir) // Destination folder
    },
    filename: (req, file, cb) => {
        //cb(null, file.originalname + '_' + Date.now() + path.extname(file.originalname)) // Filename + timestamp 时间戳名，可以重复上传同一文件
        cb(null, file.originalname) // Filename 原名，不能重复上传同一文件
    }
});

export const upload = multer({ storage });

//Rate limit ============================================
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});

// Register the service ============================================
export const registerService = async () => {
    try {
      const response = await axios.post(`${CENTRAL_SERVER}/register-service`, serviceInfo);
      console.log('Service registered');
    } catch (error) {
      console.error('Failed to register service:', error);
    }
};
  
// Send a heartbeat to the central server ============================================
export const sendHeartbeat = async () => {
    try {
      await axios.post(`${CENTRAL_SERVER}/service-heartbeat/${id}`);
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
};
  
// Unregister the service. ============================================
export const unregisterService = async () => {
    try {
      const response = await axios.delete(`${CENTRAL_SERVER}/unregister-service/${id}`);
      console.log('Service unregistered');
    } catch (error) {
      console.error('Failed to unregister service:');
    }
};

// Gracefully unregister the service when the process is terminated ============================================
export const gracefulShutdown = async () => {
    try {
      await unregisterService();
      console.log('Service unregistered and server is closing.');
    } catch (error) {
      console.log('Failed to unregister service');
    } finally {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    }
};
