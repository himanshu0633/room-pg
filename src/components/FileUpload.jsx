import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  HiUpload, HiX, HiDocument, HiPhotograph, 
  HiCloudUpload, HiCheckCircle, HiExclamationCircle,
  HiTrash, HiEye, HiDownload
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FileUpload = ({ files, onFileChange, onRemoveFile, existingFiles = [] }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const baseURL = import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles && rejectedFiles.length > 0) {
      rejectedFiles.forEach(rejection => {
        const { file, errors } = rejection;
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Max size 10MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} has invalid file type`);
          } else {
            toast.error(`${file.name}: ${error.message}`);
          }
        });
      });
    }

    // Handle accepted files
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Check for duplicates
      const existingNames = new Set([
        ...existingFiles.map(f => f.originalName || f.filename),
        ...files.map(f => f.name)
      ]);
      
      const newFiles = acceptedFiles.filter(file => !existingNames.has(file.name));
      
      if (newFiles.length === 0) {
        toast.error('All files already added');
        return;
      }
      
      if (newFiles.length !== acceptedFiles.length) {
        toast.warning(`${acceptedFiles.length - newFiles.length} duplicate file(s) skipped`);
      }
      
      onFileChange([...files, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added successfully`);
    }
  }, [files, existingFiles, onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 20,
  });

  const removeFile = (fileToRemove) => {
    if (fileToRemove._id || fileToRemove.filename) {
      // This is an existing file from database
      onRemoveFile(fileToRemove.filename || fileToRemove.name);
      toast.success('File removed successfully');
    } else {
      // This is a new file
      const updatedFiles = files.filter(f => f !== fileToRemove);
      onFileChange(updatedFiles);
      toast.success('File removed from upload list');
    }
  };

  const getFileIcon = (file) => {
    const type = file.type || file.mimetype;
    if (type?.startsWith('image/')) {
      return <HiPhotograph className="text-2xl text-blue-500" />;
    }
    if (type === 'application/pdf') {
      return <HiDocument className="text-2xl text-red-500" />;
    }
    return <HiDocument className="text-2xl text-gray-500" />;
  };

  const getFileSize = (size) => {
    if (!size) return 'Unknown';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileType = (file) => {
    const type = file.type || file.mimetype;
    if (type?.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    if (type?.includes('word')) return 'document';
    return 'file';
  };

  const getFileUrl = (file) => {
    if (file.path) {
      const filename = file.path.split('/').pop() || file.filename;
      return `${baseURL}/uploads/${filename}`;
    }
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handlePreview = (file) => {
    const url = getFileUrl(file);
    if (url && getFileType(file) === 'image') {
      setPreviewImage(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const totalFiles = existingFiles.length + files.length;
  const imageCount = [...existingFiles, ...files].filter(f => getFileType(f) === 'image').length;
  const documentCount = totalFiles - imageCount;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <HiCloudUpload className="text-blue-600 text-2xl" />
                Upload Files
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload property images and documents
              </p>
            </div>
            {totalFiles > 0 && (
              <div className="flex gap-3 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  📷 {imageCount} Image{imageCount !== 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  📄 {documentCount} Document{documentCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dropzone */}
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-all
                ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}
              `}>
                {isDragActive ? (
                  <HiCloudUpload className="text-3xl text-blue-600" />
                ) : (
                  <HiUpload className="text-3xl text-gray-500" />
                )}
              </div>
              
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop your files here...</p>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium mb-1">
                    Drag & drop files here, or <span className="text-blue-600">click to select</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported: Images (JPG, PNG, GIF, WEBP), PDF, DOC, DOCX (Max 10MB each, up to 20 files)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File List */}
        {(totalFiles > 0) && (
          <div className="px-6 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Uploaded Files ({totalFiles})
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove all files?')) {
                    // Remove all new files
                    if (files.length > 0) {
                      onFileChange([]);
                    }
                    // Remove all existing files
                    existingFiles.forEach(file => {
                      onRemoveFile(file.filename || file.name);
                    });
                    toast.success('All files removed');
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <HiTrash className="text-sm" />
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Existing files from database */}
              {existingFiles.map((file, index) => (
                <FileCard
                  key={`existing-${file._id || index}`}
                  file={file}
                  getFileIcon={getFileIcon}
                  getFileSize={getFileSize}
                  getFileType={getFileType}
                  getFileUrl={getFileUrl}
                  onRemove={() => removeFile(file)}
                  onPreview={() => handlePreview(file)}
                />
              ))}

              {/* New files */}
              {files.map((file, index) => (
                <FileCard
                  key={`new-${file.name}-${index}`}
                  file={file}
                  getFileIcon={getFileIcon}
                  getFileSize={getFileSize}
                  getFileType={getFileType}
                  getFileUrl={getFileUrl}
                  onRemove={() => removeFile(file)}
                  onPreview={() => handlePreview(file)}
                  isNew={true}
                />
              ))}
            </div>

            {/* Upload Tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                <span className="font-medium">💡 Tip:</span>
                <span>Upload clear images for better visibility</span>
                <span>•</span>
                <span>Keep file names descriptive</span>
                <span>•</span>
                <span>Maximum 20 files per property</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Separate File Card Component for better organization
const FileCard = ({ file, getFileIcon, getFileSize, getFileType, getFileUrl, onRemove, onPreview, isNew }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileType = getFileType(file);
  const fileUrl = getFileUrl(file);
  const isImage = fileType === 'image';

  return (
    <div className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all">
      {/* File Preview Area */}
      <div className="relative aspect-video bg-gray-100">
        {isImage && fileUrl ? (
          <div className="relative w-full h-full">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <img
              src={fileUrl}
              alt={file.name || file.originalName}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Preview+Error';
                setImageLoaded(true);
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {getFileIcon(file)}
            <span className="text-xs text-gray-500 uppercase font-medium">
              {fileType === 'pdf' ? 'PDF Document' : fileType === 'document' ? 'Word Document' : 'File'}
            </span>
          </div>
        )}
        
        {/* File Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${isImage ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}
          `}>
            {isImage ? 'IMAGE' : fileType === 'pdf' ? 'PDF' : 'DOC'}
          </span>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="transform scale-0 group-hover:scale-100 transition-all p-2 bg-white rounded-full hover:bg-blue-50 shadow-lg"
            title="Preview"
          >
            <HiEye className="text-gray-700 text-lg" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="transform scale-0 group-hover:scale-100 transition-all p-2 bg-white rounded-full hover:bg-red-50 shadow-lg"
            title="Remove"
          >
            <HiTrash className="text-red-600 text-lg" />
          </button>
        </div>
      </div>

      {/* File Info */}
      <div className="p-3">
        <p className="font-medium text-gray-800 text-sm truncate" title={file.name || file.originalName}>
          {file.name || file.originalName || file.filename}
        </p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">{getFileSize(file.size)}</p>
          {isNew && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              New
            </span>
          )}
          {file._id && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
