import React from 'react';
import { Person } from '@/types/person';

interface FamilyTreePersonCardProps {
  person: Person;
  onClick?: (person: Person) => void;
  isHighlighted?: boolean;
  className?: string;
  generationColor?: string;
}

export function FamilyTreePersonCard({ 
  person, 
  onClick, 
  isHighlighted = false, 
  className = '',
  generationColor 
}: FamilyTreePersonCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(person);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAge = () => {
    if (!person.date_of_birth) return null;
    const birthDate = new Date(person.date_of_birth);
    if (isNaN(birthDate.getTime())) return null;
    return new Date().getFullYear() - birthDate.getFullYear();
  };

  return (
    <div 
      className={`
        relative bg-white rounded-lg shadow-sm
        w-48 h-64 p-4 cursor-pointer transition-all duration-200 
        hover:shadow-md hover:scale-105 flex flex-col
        ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        ${className}
      `}
      style={{
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: generationColor || '#e5e7eb'
      }}
      onClick={handleClick}
    >
      {/* Avatar at top */}
      <div className="flex justify-center mb-3">
        <div className="relative w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
          {person.profile_photo_url ? (
            <img
              src={person.profile_photo_url}
              alt={person.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold text-lg">
              {getInitials(person.name)}
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="text-center mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {person.name.length > 18 ? person.name.substring(0, 18) + '...' : person.name}
        </h3>
      </div>

      {/* Age */}
      {getAge() && (
        <div className="text-center mb-2">
          <p className="text-xs text-gray-600">
            Age {getAge()}
          </p>
        </div>
      )}

      {/* Contact info */}
      <div className="flex-1 text-center mb-3">
        {person.email && (
          <p className="text-xs text-gray-500 mb-1">
            {person.email.length > 20 ? person.email.substring(0, 20) + '...' : person.email}
          </p>
        )}
        {person.phone && !person.email && (
          <p className="text-xs text-gray-500 mb-1">
            {person.phone}
          </p>
        )}
        {person.notes && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {person.notes.length > 40 ? person.notes.substring(0, 40) + '...' : person.notes}
          </p>
        )}
      </div>

      {/* Badges at bottom */}
      <div className="flex flex-wrap gap-1 justify-center">
        {/* Status badge */}
        <span className={`
          text-xs px-2 py-1 rounded-full border text-center
          ${person.status === 'living' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-gray-50 text-gray-700 border-gray-200'
          }
        `}>
          {person.status}
        </span>

        {/* Self badge */}
        {person.is_self && (
          <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full border border-red-600">
            Self
          </span>
        )}

        {/* Donor badge */}
        {person.donor && (
          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full border border-orange-300">
            Donor
          </span>
        )}

        {/* Gender badge */}
        {person.gender && (
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}

// SVG version for D3 integration
export function FamilyTreePersonCardSVG({ 
  person, 
  onClick, 
  isHighlighted = false,
  generationColor,
  x = 0,
  y = 0 
}: FamilyTreePersonCardProps & { x?: number; y?: number }) {
  const handleClick = () => {
    if (onClick) {
      onClick(person);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAge = () => {
    if (!person.date_of_birth) return null;
    const birthDate = new Date(person.date_of_birth);
    if (isNaN(birthDate.getTime())) return null;
    return new Date().getFullYear() - birthDate.getFullYear();
  };

  return (
    <g transform={`translate(${x - 96}, ${y - 128})`}>
      {/* Card shadow */}
      <rect
        width="192"
        height="256"
        x="2"
        y="2"
        rx="8"
        ry="8"
        fill="#00000010"
      />

      {/* Card background */}
      <rect
        width="192"
        height="256"
        x="0"
        y="0"
        rx="8"
        ry="8"
        fill="white"
        stroke={isHighlighted ? "#3b82f6" : (generationColor || "#e5e7eb")}
        strokeWidth={isHighlighted ? "2" : "3"}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      />

      {/* Avatar circle background */}
      <circle
        cx="96"
        cy="48"
        r="32"
        fill="#f3f4f6"
        stroke="#e5e7eb"
        strokeWidth="1"
      />

      {/* Avatar image or initials */}
      {person.profile_photo_url ? (
        <image
          x="64"
          y="16"
          width="64"
          height="64"
          href={person.profile_photo_url}
          clipPath="circle(32px at 32px 32px)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text
          x="96"
          y="56"
          textAnchor="middle"
          fill="#6b7280"
          fontSize="16"
          fontWeight="600"
        >
          {getInitials(person.name)}
        </text>
      )}

      {/* Name */}
      <text
        x="96"
        y="108"
        textAnchor="middle"
        fill="#111827"
        fontSize="14"
        fontWeight="600"
      >
        {person.name.length > 18 ? person.name.substring(0, 18) + '...' : person.name}
      </text>

      {/* Age */}
      {getAge() && (
        <text
          x="96"
          y="128"
          textAnchor="middle"
          fill="#6b7280"
          fontSize="12"
        >
          Age {getAge()}
        </text>
      )}

      {/* Contact info */}
      {person.email && (
        <text
          x="96"
          y="148"
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="10"
        >
          {person.email.length > 20 ? person.email.substring(0, 20) + '...' : person.email}
        </text>
      )}

      {person.phone && !person.email && (
        <text
          x="96"
          y="148"
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="10"
        >
          {person.phone}
        </text>
      )}

      {/* Notes */}
      {person.notes && (
        <text
          x="96"
          y="168"
          textAnchor="middle"
          fill="#d1d5db"
          fontSize="9"
        >
          {person.notes.length > 25 ? person.notes.substring(0, 25) + '...' : person.notes}
        </text>
      )}

      {/* Badges at bottom */}
      <g>
        {/* Status badge */}
        <rect
          x="30"
          y="200"
          width="50"
          height="18"
          rx="9"
          fill={person.status === 'living' ? '#ecfdf5' : '#f9fafb'}
          stroke={person.status === 'living' ? '#10b981' : '#6b7280'}
          strokeWidth="1"
        />
        <text
          x="55"
          y="211"
          textAnchor="middle"
          fill={person.status === 'living' ? '#047857' : '#374151'}
          fontSize="9"
          fontWeight="500"
        >
          {person.status}
        </text>

        {/* Self badge */}
        {person.is_self && (
          <>
            <rect
              x="85"
              y="200"
              width="30"
              height="18"
              rx="9"
              fill="#dc2626"
              stroke="#dc2626"
              strokeWidth="1"
            />
            <text
              x="100"
              y="211"
              textAnchor="middle"
              fill="white"
              fontSize="9"
              fontWeight="500"
            >
              Self
            </text>
          </>
        )}

        {/* Donor badge */}
        {person.donor && (
          <>
            <rect
              x={person.is_self ? "120" : "85"}
              y="200"
              width="35"
              height="18"
              rx="9"
              fill="#fed7aa"
              stroke="#ea580c"
              strokeWidth="1"
            />
            <text
              x={person.is_self ? "137.5" : "102.5"}
              y="211"
              textAnchor="middle"
              fill="#ea580c"
              fontSize="9"
              fontWeight="500"
            >
              Donor
            </text>
          </>
        )}

        {/* Gender badge (second row if needed) */}
        {person.gender && (
          <>
            <rect
              x="30"
              y="225"
              width="40"
              height="18"
              rx="9"
              fill="#dbeafe"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            <text
              x="50"
              y="236"
              textAnchor="middle"
              fill="#1d4ed8"
              fontSize="9"
              fontWeight="500"
            >
              {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
            </text>
          </>
        )}
      </g>
    </g>
  );
} 