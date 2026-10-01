import React, { useState } from 'react';

export type MedicalAssetType =
  | 'hero_hospital'
  | 'icu_ward'
  | 'trauma_bay'
  | 'blood_bank'
  | 'admin_command'
  | 'doctor_consult';

interface MedicalVisualAssetProps {
  type: MedicalAssetType;
  className?: string;
  alt?: string;
  overlayOpacity?: string;
}

const ASSET_PHOTOS: Record<MedicalAssetType, { url: string; label: string; fallbackGrad: string }> = {
  hero_hospital: {
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    label: 'Modern Medical Center Architectural Complex',
    fallbackGrad: 'from-[#0f172a] via-[#164A41] to-[#123831]',
  },
  icu_ward: {
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
    label: 'Intensive Care Unit & Advanced Life Support Telemetry',
    fallbackGrad: 'from-[#0e302a] via-[#1c5248] to-[#123831]',
  },
  trauma_bay: {
    url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=80',
    label: 'Emergency Trauma & Surgical Resuscitation Bay',
    fallbackGrad: 'from-[#1e1b4b] via-[#164A41] to-[#0e302a]',
  },
  blood_bank: {
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
    label: 'Cold-Chain Blood Component Reserve',
    fallbackGrad: 'from-[#4c0519] via-[#164A41] to-[#0e302a]',
  },
  admin_command: {
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    label: 'Hospital Executive Director Operations Console',
    fallbackGrad: 'from-[#164A41] via-[#1c5248] to-[#123831]',
  },
  doctor_consult: {
    url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1000&q=80',
    label: 'Clinical Triage Evaluation & Physician Telemetry',
    fallbackGrad: 'from-[#123831] via-[#164A41] to-[#1c5248]',
  },
};

export const MedicalVisualAsset: React.FC<MedicalVisualAssetProps> = ({
  type,
  className = '',
  alt,
  overlayOpacity = 'bg-[#123831]/50',
}) => {
  const [hasError, setHasError] = useState(false);
  const asset = ASSET_PHOTOS[type] || ASSET_PHOTOS.hero_hospital;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!hasError ? (
        <img
          src={asset.url}
          alt={alt || asset.label}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
        />
      ) : (
        <div className={`w-full h-full bg-linear-to-br ${asset.fallbackGrad} flex items-center justify-center p-6 text-center`}>
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#F1B24A] font-bold block uppercase tracking-wider">
              {type.replace('_', ' ')}
            </span>
            <span className="text-sm font-display text-white font-medium block">
              {asset.label}
            </span>
          </div>
        </div>
      )}

      {/* Subtle Forest Ambient Vignette to blend perfectly into dark green theme */}
      <div className={`absolute inset-0 ${overlayOpacity} mix-blend-multiply pointer-events-none`} />
      <div className="absolute inset-0 bg-linear-to-t from-[#164A41]/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
