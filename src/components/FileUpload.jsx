import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiUpload, HiX, HiDocument, HiPhotograph } from 'react-icons/hi';

const FileUpload = ({ files, onFileChange, onRemoveFile, existingFiles = [] }) => {
  const onDrop = useCallback((acceptedFiles) => {
    onFileChange([...files, ...acceptedFiles]);
  }, [files, onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (fileToRemove) => {
    if (fileToRemove._id || fileToRemove.filename) {
      // This is an existing file from database
      onRemoveFile(fileToRemove.filename || fileToRemove.name);
    } else {
      // This is a new file
      const updatedFiles = files.filter(f => f !== fileToRemove);
      onFileChange(updatedFiles);
    }
  };

  const getFileIcon = (file) => {
    const type = file.type || file.mimetype;
    if (type?.startsWith('image/')) {
      return <HiPhotograph className="text-2xl text-blue-500" />;
    }
    return <HiDocument className="text-2xl text-gray-500" />;
  };

  const getFileSize = (size) => {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileName = (file) => {
    return file.name || file.originalName || file.filename;
  };

  const getFileSize_ = (file) => {
    return file.size || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Property Images/Documents</h2>
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <HiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Drag & drop files here, or click to select</p>
            <p className="text-sm text-gray-500">Supported: Images, PDF, DOC (Max 10MB each)</p>
          </div>
        )}
      </div>

      {/* File List */}
      {(files.length > 0 || existingFiles.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
          <div className="space-y-3">
            {/* Existing files from database */}
            {existingFiles.map((file, index) => (
              <div
                key={`existing-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="font-medium">{file.originalName || file.filename}</p>
                    <p className="text-sm text-gray-500">{getFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <HiX className="text-xl" />
                </button>
              </div>
            ))}

            {/* New files */}
            {files.map((file, index) => (
              <div
                key={`new-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {file.type?.startsWith('image/') ? (
                  
<img
  src={file.path ? `http://localhost:5000/${file.path}` : URL.createObjectURL(file)}
  alt={file.originalName || file.name}
  className="w-full h-40 object-cover rounded-lg"
/>
                  ) : (
                    getFileIcon(file)
                  )}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{getFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <HiX className="text-xl" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;