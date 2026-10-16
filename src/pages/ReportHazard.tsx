import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, formatLocationEWKT } from '../lib/supabase';
import {
  HazardCategory,
  SeverityLevel,
  SimilarReportMatch,
  CategoryConfig,
} from '../types/database';
import { CATEGORY_LABELS, SEVERITY_DEFINITIONS } from '../lib/i18n';
import { ReportLocationPicker } from '../components/ReportLocationPicker';
import { FormField, Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/Feedback';
import { StatusBadge } from '../components/ui/StatusBadge';
import { saveOfflineDraft } from '../lib/offlineSync';
import {
  MapPin,
  FileText,
  CheckCircle,
  Camera,
  X,
  Mic,
  MicOff,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ThumbsUp,
} from 'lucide-react';

interface PhotoFile {
  file: File;
  previewUrl: string;
  base64: string;
}

export const ReportHazard: React.FC = () => {
  const { user, language, t } = useAuth();
  const navigate = useNavigate();

  // Step state: 1 (Location) -> 2 (Details) -> 3 (Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [lat, setLat] = useState<number>(17.385);
  const [lng, setLng] = useState<number>(78.4867);
  const [address, setAddress] = useState<string>('');

  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [category, setCategory] = useState<HazardCategory>('pothole');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  // Duplicate detection state
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [similarReports, setSimilarReports] = useState<SimilarReportMatch[]>([]);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [upvotedId, setUpvotedId] = useState<string | null>(null);

  // Speech-to-text
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successRefCode, setSuccessRefCode] = useState<string | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  // Fetch category configs from DB
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await supabase.from('category_config').select('*');
        if (data && data.length > 0) {
          setCategories(data as CategoryConfig[]);
        }
      } catch (err) {
        console.warn('Could not fetch category_config:', err);
      }
    }
    loadCategories();
  }, []);

  // Duplicate Check via RPC
  const checkDuplicates = async () => {
    if (!lat || !lng || !category) return;
    setCheckingDuplicates(true);
    try {
      const { data, error } = await supabase.rpc('find_similar_reports', {
        p_lat: lat,
        p_lng: lng,
        p_category: category,
        p_radius_m: 30,
        p_days: 30,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        setSimilarReports(data as SimilarReportMatch[]);
        setDuplicateAcknowledged(false);
      } else {
        setSimilarReports([]);
        setDuplicateAcknowledged(true);
      }
    } catch (err) {
      console.warn('find_similar_reports rpc check:', err);
      setSimilarReports([]);
      setDuplicateAcknowledged(true);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // Upvote an existing similar report
  const handleConfirmDuplicate = async (existingReportId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('report_upvotes').insert({
        report_id: existingReportId,
        user_id: user.id,
      });
      if (!error) {
        setUpvotedId(existingReportId);
      } else {
        setSubmitError(error.message);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Could not record confirmation.');
    }
  };

  // Speech to Text handler
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.speechUnsupported);
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Compress image client side
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // WebP or JPEG 80% quality
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 3) {
      alert('You can attach a maximum of 3 photographs.');
      return;
    }

    const newPhotos: PhotoFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5 MB limit.`);
        continue;
      }
      try {
        const base64 = await compressImage(file);
        newPhotos.push({
          file,
          previewUrl: URL.createObjectURL(file),
          base64,
        });
      } catch (err) {
        console.error('Photo compression error:', err);
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 3));
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate step transitions
  const goToStep2 = () => {
    if (!lat || !lng) {
      setSubmitError('Please place a location marker on the map.');
      return;
    }
    setSubmitError(null);
    checkDuplicates();
    setCurrentStep(2);
  };

  const goToStep3 = () => {
    if (!title.trim()) {
      setSubmitError('Please provide a summary title for the hazard.');
      return;
    }
    if (similarReports.length > 0 && !duplicateAcknowledged) {
      setSubmitError('Please review similar nearby reports before continuing.');
      return;
    }
    setSubmitError(null);
    setCurrentStep(3);
  };

  // Submit Final Report
  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    // If device is offline, store draft locally
    if (!navigator.onLine) {
      try {
        saveOfflineDraft({
          category,
          severity,
          title: title.trim(),
          description: description.trim(),
          address: address.trim(),
          lat,
          lng,
          photos: photos.map((p) => ({
            name: p.file.name,
            type: p.file.type || 'image/jpeg',
            base64: p.base64,
          })),
        });
        alert(t.offlineDraftSaved);
        navigate('/my-reports');
        return;
      } catch (err: any) {
        setSubmitError('Could not save offline draft: ' + err.message);
        setSubmitting(false);
        return;
      }
    }

    try {
      // 1. Insert report on municipal ledger
      const locationEWKT = formatLocationEWKT(lng, lat);
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          category,
          severity,
          title: title.trim(),
          description: description.trim() || null,
          location: locationEWKT,
          address: address.trim() || null,
          status: 'submitted',
        })
        .select('id, ref_code')
        .single();

      if (reportError || !reportData) {
        throw new Error(reportError?.message || 'Municipal database rejected the report.');
      }

      const reportId = reportData.id;
      const refCode = reportData.ref_code;
      setCreatedReportId(reportId);
      setSuccessRefCode(refCode);

      // 2. Upload photos to 'report-media' bucket
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        const ext = p.file.name.split('.').pop() || 'jpg';
        const filename = `evidence_${Date.now()}_${i}.${ext}`;
        const storagePath = `${user.id}/${reportId}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('report-media')
          .upload(storagePath, p.file, { contentType: p.file.type });

        if (!uploadError) {
          await supabase.from('report-media').insert({
            report_id: reportId,
            storage_path: storagePath,
            kind: 'evidence',
            caption: 'Initial citizen photo evidence',
            uploaded_by: user.id,
          });
        } else {
          console.warn('Photo upload warning:', uploadError);
        }
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'An error occurred while filing the report.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (successRefCode && createdReportId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-[#121916] border border-[#223128] rounded-xs p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="inline-flex p-3 bg-[#14271B] border border-[#234A31] rounded-full text-[#B8F36B] mb-4">
            <CheckCircle className="w-8 h-8 stroke-[2]" />
          </div>

          <h2 className="font-display text-2xl font-bold text-[#F2F0E8] mb-2">
            Report registered on ledger
          </h2>

          <p className="text-xs text-[#9AA69C] mb-6 leading-relaxed">
            {t.successMsg} Municipal reviewers will verify and assign within the SLA target.
          </p>

          <div className="bg-[#19221D] border border-[#223128] p-4 rounded-xs mb-6 text-center">
            <div className="text-[11px] uppercase tracking-wider text-[#9AA69C] font-semibold mb-1 font-mono">
              {t.successRefCode}
            </div>
            <div className="font-mono text-3xl font-bold text-[#B8F36B] tracking-wider tabular-nums">
              {successRefCode}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to={`/reports/${createdReportId}`}>
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                {t.trackReport} &rarr;
              </Button>
            </Link>
            <Link to="/my-reports">
              <Button variant="secondary" size="md" className="w-full sm:w-auto">
                {t.myReports}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If upvoted an existing duplicate successfully
  if (upvotedId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-[#121916] border border-[#223128] rounded-xs p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="inline-flex p-3 bg-[#10222D] border border-[#1B384A] rounded-full text-[#70B8F5] mb-4">
            <ThumbsUp className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#F2F0E8] mb-2">
            Confirmation recorded
          </h2>
          <p className="text-xs text-[#9AA69C] mb-6 leading-relaxed">
            Your confirmation has reinforced the existing report. This raises its priority on the
            municipal resolution queue.
          </p>
          <div className="flex justify-center gap-3">
            <Link to={`/reports/${upvotedId}`}>
              <Button variant="primary" size="md">
                Track existing report &rarr;
              </Button>
            </Link>
            <Link to="/my-reports">
              <Button variant="secondary" size="md">
                {t.myReports}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header and Step Progress Indicator */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#19221D] border border-[#223128] rounded-xs text-[11px] font-mono text-[#B8F36B] uppercase tracking-wider mb-2">
          <MapPin className="w-3 h-3" />
          CIVIC RESOLUTION LEDGER INTAKE
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F2F0E8]">
          {t.reportHazard}
        </h1>
        <p className="text-xs text-[#9AA69C] mt-1 leading-relaxed">
          Record public infrastructure hazards directly on the municipal resolution ledger.
        </p>

        {/* 3-Step Progress Header */}
        <div className="mt-6 border border-[#223128] bg-[#121916] rounded-xs flex divide-x divide-[#223128] overflow-hidden text-xs">
          <div
            className={`flex-1 p-2.5 text-center font-medium ${
              currentStep === 1
                ? 'bg-[#14271B] text-[#B8F36B] font-semibold border-b-2 border-b-[#B8F36B]'
                : currentStep > 1
                ? 'text-[#B8F36B] bg-[#121916]'
                : 'text-[#9AA69C]'
            }`}
          >
            <span className="font-mono tabular-nums">1.</span> Location
          </div>
          <div
            className={`flex-1 p-2.5 text-center font-medium ${
              currentStep === 2
                ? 'bg-[#14271B] text-[#B8F36B] font-semibold border-b-2 border-b-[#B8F36B]'
                : currentStep > 2
                ? 'text-[#B8F36B] bg-[#121916]'
                : 'text-[#9AA69C]'
            }`}
          >
            <span className="font-mono tabular-nums">2.</span> Hazard Details
          </div>
          <div
            className={`flex-1 p-2.5 text-center font-medium ${
              currentStep === 3
                ? 'bg-[#14271B] text-[#B8F36B] font-semibold border-b-2 border-b-[#B8F36B]'
                : 'text-[#9AA69C]'
            }`}
          >
            <span className="font-mono tabular-nums">3.</span> Review & Submit
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-6">
          <ErrorState message={submitError} onRetry={() => setSubmitError(null)} />
        </div>
      )}

      {/* STEP 1: LOCATION */}
      {currentStep === 1 && (
        <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-5 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
          <div>
            <h2 className="text-base font-semibold text-[#F2F0E8] mb-1 font-heading">
              Select hazard location
            </h2>
            <p className="text-xs text-[#9AA69C]">{t.locationHelp}</p>
          </div>

          <ReportLocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
            onAddressLookup={(foundAddress) => {
              if (!address) setAddress(foundAddress);
            }}
          />

          <FormField
            label={t.addressLabel}
            hint="Provide landmark or street name if available"
            id="report-address"
          >
            <Input
              id="report-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Charminar circle, Main road"
            />
          </FormField>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="md" onClick={goToStep2} className="gap-2">
              <span>Next: Details</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS & DUPLICATE CHECK */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* DUPLICATE CHECK WARNING */}
          {similarReports.length > 0 && !duplicateAcknowledged && (
            <div className="bg-[#241E10] border border-[#423419] rounded-xs p-5 shadow-lg">
              <div className="flex items-start gap-2.5 mb-3">
                <AlertTriangle className="w-5 h-5 text-[#F0B65A] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F0B65A]">
                    {t.duplicateNotice}
                  </h3>
                  <p className="text-xs text-[#9AA69C] mt-0.5 leading-relaxed">
                    An existing report for this hazard was already registered nearby. Confirming an
                    existing report raises its urgency without creating administrative clutter.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#223128] border border-[#223128] bg-[#19221D] rounded-xs mb-4 overflow-hidden">
                {similarReports.map((item) => (
                  <div key={item.id} className="p-3 text-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-[#B8F36B]">
                          {item.ref_code}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <p className="text-[#F2F0E8] line-clamp-1">{item.title}</p>
                      <div className="text-[11px] text-[#9AA69C] mt-0.5 flex gap-2 font-mono">
                        <span>Distance: ~{Math.round(item.distance_m || 10)}m</span>
                        <span>•</span>
                        <span>Confirmations: {item.upvote_count || 1}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfirmDuplicate(item.id)}
                      className="shrink-0 text-xs gap-1 border-[#423419] text-[#F0B65A] hover:bg-[#241E10]"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{t.duplicateConfirmThis}</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDuplicateAcknowledged(true)}
                >
                  {t.duplicateIsDifferent}
                </Button>
              </div>
            </div>
          )}

          {/* Details Form Card */}
          <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-5 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
            {/* Category Select */}
            <FormField label={t.category} required id="report-category">
              <Select
                id="report-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as HazardCategory);
                  checkDuplicates();
                }}
              >
                {(Object.keys(CATEGORY_LABELS) as HazardCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat][language]}
                  </option>
                ))}
              </Select>
            </FormField>

            {/* Severity Radio Group with One-line plain-language definitions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9AA69C]">
                {t.severityLabel} <span className="text-[#F87171]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map((lvl) => {
                  const def = SEVERITY_DEFINITIONS[lvl];
                  const isChecked = severity === lvl;
                  return (
                    <label
                      key={lvl}
                      className={`flex flex-col p-3 border rounded-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-[#B8F36B] bg-[#14271B] ring-1 ring-[#B8F36B]'
                          : 'border-[#223128] bg-[#19221D] hover:bg-[#1C2620]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="severity"
                          value={lvl}
                          checked={isChecked}
                          onChange={() => setSeverity(lvl)}
                          className="accent-[#B8F36B]"
                        />
                        <span className="font-semibold text-xs text-[#F2F0E8] capitalize">
                          {def.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#9AA69C] leading-tight">
                        {def.desc}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <FormField label={t.titleLabel} required id="report-title">
              <Input
                id="report-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole on outer ring road"
                maxLength={100}
                required
              />
            </FormField>

            {/* Description with Character Counter & Speech-to-Text */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="report-desc"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#9AA69C]"
                >
                  {t.descLabel}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#9AA69C] font-mono tabular-nums">
                    {description.length} / 500
                  </span>
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-xs border transition-colors ${
                      isRecording
                        ? 'bg-[#291414] border-[#521E1E] text-[#FCA5A5] animate-pulse'
                        : 'bg-[#19221D] border-[#223128] text-[#9AA69C] hover:text-[#B8F36B]'
                    }`}
                    title={isRecording ? t.speechToTextStop : t.speechToTextStart}
                  >
                    {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isRecording ? 'Listening...' : 'Voice input'}</span>
                  </button>
                </div>
              </div>
              <Textarea
                id="report-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Specify dimensions, traffic impact, nearby hazards..."
                rows={3}
              />
            </div>

            {/* Photos (1 to 3 images, max 5 MB each, preview and remove) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9AA69C]">
                {t.photosLabel}
              </label>
              <p className="text-[11px] text-[#9AA69C]">{t.photosHelp}</p>

              <div className="grid grid-cols-3 gap-3">
                {photos.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square border border-[#223128] rounded-xs overflow-hidden group bg-[#19221D]"
                  >
                    <img
                      src={p.previewUrl}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-[#FCA5A5] rounded-full transition-colors"
                      aria-label="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {photos.length < 3 && (
                  <label className="aspect-square border-2 border-dashed border-[#223128] hover:border-[#B8F36B] rounded-xs flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors bg-[#19221D]/50">
                    <Camera className="w-6 h-6 text-[#9AA69C] mb-1 group-hover:text-[#B8F36B]" />
                    <span className="text-[11px] font-medium text-[#9AA69C]">
                      Add photo
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      multiple
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex justify-between">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCurrentStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button variant="primary" size="md" onClick={goToStep3} className="gap-2">
                <span>Next: Review</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW AND SUBMIT */}
      {currentStep === 3 && (
        <div className="bg-[#121916] border border-[#223128] rounded-xs p-5 sm:p-6 space-y-6 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
          <div className="border-b border-[#223128] pb-3">
            <h2 className="text-base font-semibold text-[#F2F0E8] font-heading">
              Review hazard entry before filing
            </h2>
            <p className="text-xs text-[#9AA69C] mt-1 leading-relaxed">
              Verify the details below. This submission creates an official record on the municipal register.
            </p>
          </div>

          <div className="divide-y divide-[#223128] text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-xs text-[#9AA69C] uppercase tracking-wider font-semibold font-mono">
                Category
              </span>
              <span className="font-medium text-[#F2F0E8]">
                {CATEGORY_LABELS[category][language]}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-xs text-[#9AA69C] uppercase tracking-wider font-semibold font-mono">
                Severity
              </span>
              <span className="capitalize font-semibold text-[#F0B65A]">
                {severity}
              </span>
            </div>

            <div className="py-2.5">
              <span className="text-xs text-[#9AA69C] uppercase tracking-wider font-semibold block mb-1 font-mono">
                Summary title
              </span>
              <span className="text-[#F2F0E8] font-medium">{title}</span>
            </div>

            {description && (
              <div className="py-2.5">
                <span className="text-xs text-[#9AA69C] uppercase tracking-wider font-semibold block mb-1 font-mono">
                  Description
                </span>
                <p className="text-xs text-[#9AA69C] leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            )}

            <div className="py-2.5">
              <span className="text-xs text-[#9AA69C] uppercase tracking-wider font-semibold block mb-1 font-mono">
                Location & Coordinates
              </span>
              <p className="text-xs text-[#F2F0E8]">
                {address ? `${address} ` : ''}
                <span className="text-[#B8F36B] font-mono text-[11px]">
                  ({lat.toFixed(6)}, {lng.toFixed(6)})
                </span>
              </p>
            </div>

            {photos.length > 0 && (
              <div className="py-3">
                <span className="text-xs text-[#9AA69C] uppercase tracking-wider font-semibold block mb-2 font-mono">
                  Photographic Evidence ({photos.length})
                </span>
                <div className="flex gap-2">
                  {photos.map((p, idx) => (
                    <img
                      key={idx}
                      src={p.previewUrl}
                      alt={`Review photo ${idx + 1}`}
                      className="w-16 h-16 object-cover border border-[#223128] rounded-xs"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(2)}
              disabled={submitting}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={submitting}
              className="min-w-[140px]"
            >
              {t.submitReport}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
