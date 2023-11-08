import axios from 'axios';

// Get data
export const API_URL = 'http://localhost:4000'; // replace with your backend URL
export const CENTRAL_SERVER_URL = 'http://localhost:8000'; // replace with your central register server URL
export const WebSocketURL = 'ws://localhost:4000'; // replace with your backend WS URL

export const uploadData = async (data) => {
        try {
                const response = await axios.post(`${API_URL}/api/upload`, data);
                console.log(response.data)
                return response.data;
        } catch (error) {
                console.error(error);
        }
};

// Get the list of files
export const getFiles = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/files`);
        return response.data;
    } catch (error) {
        console.error('Error fetching files:', error);
    }
};

// Get the list of results
export const getResults = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/results`);
        return response.data;
    } catch (error) {
        console.error('Error fetching results:', error);
    }
};

//delete a file
export const deleteFile = async (fileName) => {
    try {
        const response = await axios.delete(`${API_URL}/api/files/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

//delete a result
export const deleteResult = async (fileName) => {
    try {
        const response = await axios.delete(`${API_URL}/api/results/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting result:', error);
    }
};

// Download a file
export const downloadFile = async (fileName) => {
    try {
        const response = await axios({
            url: `${API_URL}/api/files/${fileName}`,
            method: 'GET',
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};

// Download a result
export const downloadResult = async (fileName) => {
    try {
        const response = await axios({
            url: `${API_URL}/api/results/${fileName}`,
            method: 'GET',
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error downloading result:', error);
    }
};

// Generate image
export const generateImage = async (fileName) => {
    try {
        const response = await axios.post(`${API_URL}/api/files/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error generating image:', error);
    }
};

// Get the list of images
export const getImages = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/images`);
        return response.data;
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// View an image details
export const viewImage = async (fileName) => {
    try {
        const response = await axios.get(`${API_URL}/api/images/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error viewing image:', error);
    }
};

// Delete an image
export const deleteImage = async (fileName) => {
    try {
        const response = await axios.delete(`${API_URL}/api/images/${fileName}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

// export const runImage = async () => {
//     try {
//       const response = await axios.post('${API_URL}/api/images/docker-run', { imageName, fileName });
//       console.log(response.data); // 
//     } catch (error) {
//       console.error('Error running docker:', error);
//     }
// };
