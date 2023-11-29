// upload
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import axios from "axios";
import rateLimit from "express-rate-limit";
import { exec } from 'child_process';

const hostURL = process.env.API_URL || 'http://localhost:4000'; // TODO: Change this to the URL of your service

// URL of the central server
const CENTRAL_SERVER = process.env.CENTRAL_SERVER || 'http://localhost:8000'; // TODO: Change this to the URL of your central server

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
const id = `API: ${hostURL}`; // TODO: Change this to a unique ID for your service

// Information about this service
export const serviceInfo = {
  _id: id,
  url: hostURL, // TODO: Change this to the URL of your service
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
        //cb(null, file.originalname + '_' + Date.now() + path.extname(file.originalname)) // Filename + timestamp
        cb(null, file.originalname) // Filename + timestamp originalname
    }
});

export const upload = multer({ storage });

//Rate limit =======================================================================================
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});

// Register the service ============================================================================
export const registerService = async () => {
    try {
      const response = await axios.post(`${CENTRAL_SERVER}/register-service`, serviceInfo);
      if (response.status >= 200 && response.status < 300) {
        return true;
      } else {
        console.error('Failed to register service: ' + response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Failed to register service:' + error.message);
      return false;
    }
};

// Send a heartbeat to the central server ============================================
export const sendHeartbeat = async () => {
    try {
      const response = await axios.post(`${CENTRAL_SERVER}/service-heartbeat`, serviceInfo);
      if (response.status == 200){
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Failed to send heartbeat:' + error.message);
      return false;
    }
};

// Unregister the service. ============================================================
export const unregisterService = async () => {
    try {
      await axios.delete(`${CENTRAL_SERVER}/unregister-service`, { data: { _id: id } });
      console.log('Service unregistered');
    } catch (error) {
      console.error('Failed to unregister service:', error.message);
    }
};


// sort the matched files ==================================================================
export const sortFiles = (files) => {
  // if the file is a python file, put it in the front
  const pyFiles = files.filter(file => file.endsWith('.py'));
  const otherFiles = files.filter(file => !file.endsWith('.py'));
  return pyFiles.concat(otherFiles);
}

// Process the uploaded files ============================================================
export const processFiles = async (imageName, fileNames) => {
  const processedFiles = [];
  for (const file of files) {
    const result = await processFile(file);
    processedFiles.push(result);
  }
  return processedFiles;
};


// (docker inspect --format='{{.Config.WorkingDir}}' your-image-name) this command can get the working directory of the image
// (docker inspect --format='{{.Config.Entrypoint}}' your-image-name) this command can get the entrypoint of the image
// (docker inspect --format='{{.Config.Cmd}}' your-image-name) this command can get the cmd of the image

//get the working directory of the image
export const getWorkingDir = async(imageName) => {
  return new Promise((resolve, reject) => {
      exec(`docker inspect --format='{{.Config.WorkingDir}}' ${imageName}`, (err, stdout, stderr) => {
          if (err) {
              // Error handling
              console.error(`Error inspecting image: ${err}`);
              reject(stderr);
          } else {
              resolve(stdout.trim());
          }
      });
  });
}

//get the entrypoint of the image
export const getEntrypoint = async(imageName) => {
  return new Promise((resolve, reject) => {
      exec(`docker inspect --format='{{.Config.Entrypoint}}' ${imageName}`, (err, stdout, stderr) => {
          if (err) {
              // Error handling
              console.error(`Error inspecting image: ${err}`);
              reject(stderr);
          } else {
              resolve(stdout.trim());
          }
      });
  });
}

//get the cmd of the image
export const getCmd = async(imageName) => {
  return new Promise((resolve, reject) => {
      exec(`docker inspect --format='{{.Config.Cmd}}' ${imageName}`, (err, stdout, stderr) => {
          if (err) {
              // Error handling
              console.error(`Error inspecting image: ${err}`);
              reject(stderr);
          } else {
              resolve(stdout.trim());
          }
      });
  });
}