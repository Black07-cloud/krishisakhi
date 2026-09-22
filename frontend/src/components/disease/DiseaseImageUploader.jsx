import { useState, useEffect, useRef } from "react";
import { Upload, Image as ImageIcon, X, RefreshCw, AlertCircle, Camera } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const DiseaseImageUploader = ({ selectedFile, onFileSelect, onFileClear, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const validateAndProcessFile = (file) => {
    setError(null);

    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setError("Please upload a valid image (JPG, JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Image size must be less than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    onFileSelect(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="disease-uploader-wrapper">
      {error && (
        <div className="uploader-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* File Input (Standard Desktop Upload) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {/* Camera Input (Mobile Capture) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          className={`uploader-dropzone ${dragActive ? "dropzone-active" : ""} ${disabled ? "dropzone-disabled" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              !disabled && fileInputRef.current?.click();
            }
          }}
          aria-label="Upload crop leaf image"
        >
          <div className="dropzone-icon-badge">
            <Upload size={28} color="#16a34a" />
          </div>

          <div className="dropzone-text-group">
            <p className="dropzone-primary-text">
              <strong>Click to upload</strong> or drag & drop leaf image
            </p>
            <p className="dropzone-subtext">
              Supports JPG, JPEG, PNG, WebP (Max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>

          <div className="dropzone-camera-buttons">
            <button
              type="button"
              className="btn-camera-upload"
              onClick={(e) => {
                e.stopPropagation();
                !disabled && cameraInputRef.current?.click();
              }}
              disabled={disabled}
            >
              <Camera size={15} /> Take Photo with Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="uploader-preview-card">
          <div className="preview-image-container">
            {previewUrl ? (
              <img src={previewUrl} alt="Crop leaf preview" className="preview-img" />
            ) : (
              <div className="preview-placeholder">
                <ImageIcon size={32} />
              </div>
            )}
          </div>

          <div className="preview-info-row">
            <div className="preview-file-details">
              <span className="preview-file-name" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="preview-file-size">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>

            <div className="preview-actions">
              <button
                type="button"
                className="btn-preview-action action-replace"
                onClick={() => !disabled && fileInputRef.current?.click()}
                disabled={disabled}
                title="Replace image"
              >
                <RefreshCw size={14} /> Replace
              </button>

              <button
                type="button"
                className="btn-preview-action action-remove"
                onClick={onFileClear}
                disabled={disabled}
                title="Remove image"
              >
                <X size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseImageUploader;
