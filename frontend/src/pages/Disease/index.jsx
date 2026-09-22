import { useState, useEffect, useCallback, useRef } from "react";
import { Leaf, ScanSearch, RefreshCw, AlertCircle } from "lucide-react";
import { getFarms } from "../../api/farmApi";
import { getCropsByFarm } from "../../api/cropApi";
import {
  createDiseaseScan,
  getDiseaseScans,
  getLatestDiseaseScan,
  deleteDiseaseScan,
} from "../../api/diseaseApi";
import DiseaseScanForm from "../../components/disease/DiseaseScanForm";
import DiseaseResult from "../../components/disease/DiseaseResult";
import DiseaseHistory from "../../components/disease/DiseaseHistory";
import DiseaseScanDetailsModal from "../../components/disease/DiseaseScanDetailsModal";
import ConfirmDeleteScanModal from "../../components/disease/ConfirmDeleteScanModal";
import ToastNotification from "../../components/farms/ToastNotification";
import "./Disease.css";

const Disease = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Crops for selected farm
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [loadingCrops, setLoadingCrops] = useState(false);

  // Latest scan result for current farm/crop
  const [latestScan, setLatestScan] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(false);

  // Scan history list
  const [scansHistory, setScansHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modals state
  const [viewingScan, setViewingScan] = useState(null);
  const [deletingScan, setDeletingScan] = useState(null);

  // Action loading flags
  const [submittingScan, setSubmittingScan] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const topScanRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // 1. Fetch user's farms
  const fetchFarmsList = useCallback(async () => {
    setLoadingFarms(true);
    try {
      const res = await getFarms();
      const farmList = res?.data?.data ?? (Array.isArray(res?.data) ? res.data : []);
      const validFarms = Array.isArray(farmList) ? farmList : [];
      setFarms(validFarms);
      if (validFarms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(validFarms[0]._id);
      }
    } catch (err) {
      console.error("Failed to load farms:", err);
    } finally {
      setLoadingFarms(false);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    fetchFarmsList();
  }, [fetchFarmsList]);

  // 2. Fetch crops & scan data when selected farm changes
  const fetchFarmData = useCallback(async (farmId) => {
    if (!farmId) return;
    setLoadingCrops(true);
    setLoadingLatest(true);
    setLoadingHistory(true);

    // Fetch crops
    try {
      const cropsRes = await getCropsByFarm(farmId);
      const cropList = Array.isArray(cropsRes?.data?.data) ? cropsRes.data.data : [];
      setCrops(cropList);
      if (cropList.length > 0) {
        setSelectedCropId(cropList[0]._id);
      } else {
        setSelectedCropId("");
      }
    } catch (err) {
      console.error("Failed to load crops:", err);
      setCrops([]);
      setSelectedCropId("");
    } finally {
      setLoadingCrops(false);
    }

    // Fetch latest scan & history for this farm
    try {
      const [latestRes, historyRes] = await Promise.allSettled([
        getLatestDiseaseScan({ farm: farmId }),
        getDiseaseScans({ farm: farmId }),
      ]);

      if (latestRes.status === "fulfilled" && latestRes.value?.data?.data) {
        setLatestScan(latestRes.value.data.data);
      } else {
        setLatestScan(null);
      }
      setLoadingLatest(false);

      if (historyRes.status === "fulfilled" && historyRes.value?.data?.data) {
        const historyList = Array.isArray(historyRes.value.data.data)
          ? historyRes.value.data.data
          : [];
        setScansHistory(historyList);
      } else {
        setScansHistory([]);
      }
      setLoadingHistory(false);
    } catch (err) {
      console.error("Failed to load disease scans:", err);
      setLoadingLatest(false);
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      fetchFarmData(selectedFarmId);
    }
  }, [selectedFarmId, fetchFarmData]);

  // Handle Farm Change
  const handleFarmChange = (newFarmId) => {
    setSelectedFarmId(newFarmId);
  };

  // Handle Crop Change
  const handleCropChange = async (newCropId) => {
    setSelectedCropId(newCropId);
    if (!newCropId) return;
    setLoadingLatest(true);
    try {
      const res = await getLatestDiseaseScan({ farm: selectedFarmId, crop: newCropId });
      if (res?.data?.data) {
        setLatestScan(res.data.data);
      } else {
        setLatestScan(null);
      }
    } catch (err) {
      console.error("Failed to fetch latest crop scan:", err);
    } finally {
      setLoadingLatest(false);
    }
  };

  // Handle Submit Scan (multipart FormData)
  const handleScanSubmit = async (formData) => {
    setSubmittingScan(true);
    try {
      const res = await createDiseaseScan(formData);
      showToast("Disease scan submitted successfully.");
      if (res?.data?.data) {
        setLatestScan(res.data.data);
      }
      await fetchFarmData(selectedFarmId);
    } catch (err) {
      console.error("Scan submission error:", err);
      showToast("Unable to process crop scan. Please try again.", "error");
    } finally {
      setSubmittingScan(false);
    }
  };

  // Handle Delete Scan
  const handleDeleteScan = async (scanId) => {
    setDeleting(true);
    try {
      await deleteDiseaseScan(scanId);
      showToast("Disease scan deleted successfully.");
      setDeletingScan(null);
      await fetchFarmData(selectedFarmId);
    } catch (err) {
      console.error("Delete scan error:", err);
      showToast("Unable to delete disease scan. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const scrollToNewScan = () => {
    topScanRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="disease-page">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="disease-page-header" ref={topScanRef}>
        <div className="disease-header-title-wrap">
          <h1 className="disease-title">
            <Leaf size={26} color="#16a34a" /> Disease Detection
          </h1>
          <p className="disease-subtitle">
            Upload a crop image and analyze it for possible diseases.
          </p>
        </div>

        <button type="button" className="btn-new-scan" onClick={scrollToNewScan}>
          <ScanSearch size={18} />
          <span>New Scan</span>
        </button>
      </div>

      {/* Two Column Main Grid */}
      <div className="disease-main-grid">
        {/* Left: Scan Form & Image Uploader */}
        <DiseaseScanForm
          farms={farms}
          crops={crops}
          selectedFarmId={selectedFarmId}
          selectedCropId={selectedCropId}
          onFarmChange={handleFarmChange}
          onCropChange={handleCropChange}
          onSubmitScan={handleScanSubmit}
          submitting={submittingScan}
        />

        {/* Right: Latest Scan Result */}
        <DiseaseResult scanResult={latestScan} loading={loadingLatest} />
      </div>

      {/* Bottom: Scan History Table & Mobile Cards */}
      <DiseaseHistory
        scans={scansHistory}
        onViewScan={(scan) => setViewingScan(scan)}
        onDeleteScan={(scan) => setDeletingScan(scan)}
        loading={loadingHistory}
        farms={farms}
      />

      {/* View Details Modal */}
      {viewingScan && (
        <DiseaseScanDetailsModal
          scan={viewingScan}
          onClose={() => setViewingScan(null)}
        />
      )}

      {/* Confirm Delete Scan Modal */}
      {deletingScan && (
        <ConfirmDeleteScanModal
          scan={deletingScan}
          onClose={() => setDeletingScan(null)}
          onConfirm={handleDeleteScan}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Disease;
