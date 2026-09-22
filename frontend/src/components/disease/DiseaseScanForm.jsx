import { useState, useEffect } from "react";
import { ScanSearch, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DiseaseImageUploader from "./DiseaseImageUploader";

const DiseaseScanForm = ({
  farms = [],
  crops = [],
  selectedFarmId = "",
  selectedCropId = "",
  onFarmChange,
  onCropChange,
  onSubmitScan,
  submitting = false,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Clear crop error when crops change
    if (errors.crop && selectedCropId) {
      setErrors((prev) => ({ ...prev, crop: null }));
    }
  }, [selectedCropId, errors.crop]);

  const validate = () => {
    const newErrors = {};

    if (!selectedFarmId) {
      newErrors.farm = "Please select a farm.";
    }

    if (!selectedCropId) {
      newErrors.crop = "Please select a crop.";
    }

    if (!selectedFile) {
      newErrors.image = "Please upload a leaf image to scan.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Create FormData for multipart submission
    const formData = new FormData();
    formData.append("farm", selectedFarmId);
    formData.append("crop", selectedCropId);
    formData.append("image", selectedFile);
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }
    formData.append("source", "ai");

    onSubmitScan(formData);
  };

  const hasNoFarms = farms.length === 0;
  const hasNoCrops = selectedFarmId && crops.length === 0;

  return (
    <div className="disease-scan-form-card">
      <div className="form-card-header">
        <div className="header-icon-wrap">
          <ScanSearch size={22} color="#16a34a" />
        </div>
        <div>
          <h3 className="form-card-title">New Disease Scan</h3>
          <p className="form-card-subtitle">
            Upload a clear photo of the infected crop leaf for automated disease analysis.
          </p>
        </div>
      </div>

      {hasNoFarms ? (
        <div className="no-farms-warning">
          <AlertCircle size={32} color="#d97706" />
          <h4>No Farms Available</h4>
          <p>You need to create a farm before scanning crops for disease.</p>
          <Link to="/farms" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Add Farm
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-body">
            {/* Select Farm & Crop Row */}
            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="scan-farm" className="form-label">
                  Select Farm <span className="required-star">*</span>
                </label>
                <select
                  id="scan-farm"
                  className={`form-select ${errors.farm ? "input-error" : ""}`}
                  value={selectedFarmId}
                  onChange={(e) => onFarmChange(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">-- Choose Farm --</option>
                  {farms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.location?.district || f.location?.state || "Farm"})
                    </option>
                  ))}
                </select>
                {errors.farm && (
                  <span className="error-message">
                    <AlertCircle size={12} /> {errors.farm}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="scan-crop" className="form-label">
                  Select Crop <span className="required-star">*</span>
                </label>
                <select
                  id="scan-crop"
                  className={`form-select ${errors.crop ? "input-error" : ""}`}
                  value={selectedCropId}
                  onChange={(e) => onCropChange(e.target.value)}
                  disabled={submitting || !selectedFarmId || hasNoCrops}
                >
                  <option value="">
                    {!selectedFarmId
                      ? "-- Select Farm First --"
                      : hasNoCrops
                      ? "-- No Crops in Farm --"
                      : "-- Choose Crop --"}
                  </option>
                  {crops.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.variety ? `(${c.variety})` : ""}
                    </option>
                  ))}
                </select>
                {errors.crop && (
                  <span className="error-message">
                    <AlertCircle size={12} /> {errors.crop}
                  </span>
                )}
                {hasNoCrops && (
                  <span className="subtext-warning">
                    No crops found for this farm. <Link to="/crops">Add a Crop</Link>
                  </span>
                )}
              </div>
            </div>

            {/* Image Uploader */}
            <div className="form-group">
              <label className="form-label">
                Crop Leaf Photo <span className="required-star">*</span>
              </label>
              <DiseaseImageUploader
                selectedFile={selectedFile}
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
                }}
                onFileClear={() => setSelectedFile(null)}
                disabled={submitting}
              />
              {errors.image && (
                <span className="error-message">
                  <AlertCircle size={12} /> {errors.image}
                </span>
              )}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="scan-notes" className="form-label">
                Notes / Symptoms Observed <span className="sublabel">(Optional)</span>
              </label>
              <textarea
                id="scan-notes"
                rows={2}
                className="form-input"
                placeholder="e.g. Yellow spots on lower leaves, noticed 2 days ago"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full-width"
              disabled={submitting || !selectedFarmId || !selectedCropId || !selectedFile}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Analyzing crop image...</span>
                </>
              ) : (
                <>
                  <ScanSearch size={18} />
                  <span>Analyze Crop Image</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DiseaseScanForm;
