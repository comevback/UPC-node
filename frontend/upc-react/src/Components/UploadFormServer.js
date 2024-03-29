// UploadForm.js
import { useContext, useState, useEffect } from "react";
import { uploadData_server } from '../Tools/api';
import { ParaContext } from "../Global.js";
import './UploadForm.css';

const UploadFormServer = (props) => {
    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('○');
    const { CENTRAL_SERVER_URL } = useContext(ParaContext);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        props.refreshFilesServer();
    }, [CENTRAL_SERVER_URL]);

    const handleDragOver = (event) => {
        event.preventDefault(); // 阻止默认行为
        if (!dragging) {
        setDragging(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault(); // 阻止默认行为
        setDragging(false);
    };

    const handleDrop = async (event) => {
        event.preventDefault(); // 阻止文件被打开
        setDragging(false);
        
        const dropedFiles = Array.from(event.dataTransfer.files);
        console.log(dropedFiles);
        // 处理文件上传逻辑
        setFiles(Array.from(dropedFiles));
        setUploadStatus('○');

        const formData = new FormData();
        dropedFiles.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        const result = await uploadData_server(CENTRAL_SERVER_URL, formData);
        if (result.length > 0) {
            setUploadStatus('✓');
        } else {
            setUploadStatus('✗');
        } // Display the result from the server
        props.refreshFilesServer(); // Refresh the list of files
        setFiles([]); // Clear the file input

        console.log(files);
    };

    const handleFileChange = (event) => {
        setFiles(Array.from(event.target.files));
        setUploadStatus('○');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();// Prevent the default form submit event
        console.log(files);
        const formData = new FormData();
        // Create an empty FormData object
        
        files.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        const result = await uploadData_server(CENTRAL_SERVER_URL, formData);
        if (result.length > 0) {
            setUploadStatus('✓');
        } else {
            setUploadStatus('✗');
        } // Display the result from the server
        props.refreshFilesServer(); // Refresh the list of files
        setFiles([]); // Clear the file input
    };

    let uploadStatusClass = 'upload-status';
    if (uploadStatus === '✓') {
        uploadStatusClass += ' success';
    } else if  (uploadStatus === '✗') {
        uploadStatusClass += ' failure';
    }

    return (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <h1>Upload a file (Register Server)</h1>
            <form className={`upload-form ${dragging ? "dragging" : "" }`} onSubmit={handleSubmit}>
                <div className="upload-input">
                    <div className="upload-panel">
                        {/* <input type="file" id="file-input" onChange={handleFileChange} webkitdirectory="true" multiple /> */}
                        <input type="file" id="file-input" onChange={handleFileChange} multiple placeholder="well"/>
                        <button type="submit" className={`${files.length ? 'actived' : ''} `}>Upload</button>
                    </div>
                    <div className={`upload-status ${uploadStatus === '✓' ? 'success' : uploadStatus === '✗' ? 'failure' : ''}`}>{uploadStatus}</div>
                </div>
            </form>
        </div>
    );
}

export default UploadFormServer;