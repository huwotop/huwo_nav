import React from 'react'
import { fallbackIcon, getFaviconUrl } from '../utils/site'

const SiteCard = ({ site, onSelect, isSelected }) => {
  const faviconUrl = getFaviconUrl(site.url)

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`打开 ${site.name}`}
              className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0"
            >
              <img 
                src={faviconUrl} 
                alt={`${site.name} icon`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = fallbackIcon
                }}
              />
            </a>
            <div>
              <h3 className="font-medium text-gray-900 truncate max-w-[160px]">{site.name}</h3>
              {site.category && (
                <p className="text-xs text-gray-500 mt-1">{site.category}</p>
              )}
            </div>
          </div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(site.id)}
            className="h-4 w-4 text-blue-600 rounded"
          />
        </div>
        <a 
          href={site.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 truncate block"
        >
          {site.url}
        </a>
      </div>
    </div>
  )
}

export default SiteCard
