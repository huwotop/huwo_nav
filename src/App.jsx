import { useState, useEffect, useMemo } from 'react'
import './App.css'
import AddSiteForm from './components/AddSiteForm'
import ImportBookmarks from './components/ImportBookmarks'
import EditSiteForm from './components/EditSiteForm'
import { fallbackIcon, getFaviconUrl } from './utils/site'

function App() {
  const [sites, setSites] = useState([])
  const [selectedSites, setSelectedSites] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingSite, setEditingSite] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const backgroundTimestamp = useMemo(() => Date.now(), [])
  const categories = useMemo(
    () => [...new Set(sites.map(site => site.category).filter(Boolean))],
    [sites]
  )

  // 鑾峰彇绔欑偣鏁版嵁
  useEffect(() => {
    fetchSites()
  }, [])

  // 自动设置默认分类
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  // 杩囨护褰撳墠鍒嗙被鐨勭珯鐐?  const filteredSites = sites.filter(site => {
    const categoryMatch = !activeCategory || site.category === activeCategory
    const searchMatch = !searchTerm || 
                       site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       site.url.toLowerCase().includes(searchTerm.toLowerCase())
    
    return categoryMatch && searchMatch
  })

  // 鑾峰彇鎵€鏈夌珯鐐?  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites')
      
      // 妫€鏌ュ搷搴旂姸鎬?      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // 妫€鏌ュ搷搴旂被鍨?      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }
      
      const data = await response.json()
      setSites(data)
    } catch (error) {
      console.error('Error fetching sites:', error)
      // API 璇锋眰澶辫触鏃朵娇鐢ㄧ┖鏁版嵁
      setSites([])
    }
  }

  // 澶勭悊绔欑偣閫夋嫨
  const handleSiteSelect = (id) => {
    setSelectedSites(prev => {
      if (prev.includes(id)) {
        return prev.filter(siteId => siteId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // 澶勭悊鎵归噺鍒犻櫎
  const handleBatchDelete = async () => {
    if (selectedSites.length === 0) return

    try {
      const response = await fetch('/api/sites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedSites })
      })

      if (!response.ok) {
        throw new Error('鍒犻櫎绔欑偣澶辫触')
      }

      setSites(prev => prev.filter(site => !selectedSites.includes(site.id)))
      setSelectedSites([])
    } catch (error) {
      console.error('Error deleting sites:', error)
      // 鏈湴寮€鍙戞椂妯℃嫙鍒犻櫎
      setSites(prev => prev.filter(site => !selectedSites.includes(site.id)))
      setSelectedSites([])
    }
  }

  // 澶勭悊娣诲姞绔欑偣
  const handleAddSite = (newSite) => {
    setSites(prev => [...prev, newSite])
    setShowAddForm(false)
  }

  // 澶勭悊瀵煎叆瀹屾垚
  const handleImportComplete = () => {
    // 閲嶆柊鍔犺浇鏁版嵁锛岀‘淇濇湰鍦板瓨鍌ㄤ腑鐨勬暟鎹姝ｇ‘鏄剧ず
    const localData = localStorage.getItem('nav_sites')
    setSites(localData ? JSON.parse(localData) : [])
    setShowImportForm(false)
  }

  // 澶勭悊瀵嗙爜鎻愪氦
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    const correctPassword = import.meta.env.VITE_PASSWORD || 'admin123'
    if (password === correctPassword) {
      setEditMode(true)
      setShowPasswordForm(false)
      setPasswordError('')
    } else {
      setPasswordError('瀵嗙爜閿欒锛岃閲嶆柊杈撳叆')
    }
  }

  // 澶勭悊娣诲姞鍒嗙被
  const handleAddCategory = async (categoryName) => {
    if (!categoryName || categoryName.trim() === '') return

    try {
      if (categories.includes(categoryName.trim())) {
        alert('鍒嗙被宸插瓨鍦?)
        return
      }

      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: categoryName.trim() })
      })

      if (!response.ok) {
        throw new Error('娣诲姞鍒嗙被澶辫触')
      }

      const updatedSites = await response.json()
      setSites(updatedSites)
      setNewCategory('')
      setShowAddCategoryForm(false)
    } catch (error) {
      console.error('Error adding category:', error)
      alert('鍒嗙被娣诲姞鎴愬姛锛堟湰鍦版ā鎷燂級')
      setNewCategory('')
      setShowAddCategoryForm(false)
    }
  }

  // 澶勭悊缂栬緫缃戠珯
  const handleEditSite = (site) => {
    setEditingSite(site)
    setShowEditForm(true)
  }

  // 澶勭悊鏇存柊缃戠珯
  const handleUpdateSite = async (updatedSite) => {
    try {
      // 鍙戦€佽姹傚埌 API 鏇存柊缃戠珯
      const response = await fetch('/api/sites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSite)
      })

      if (!response.ok) {
        throw new Error('鏇存柊缃戠珯澶辫触')
      }

      // 鍒锋柊缃戠珯鍒楄〃
      const updatedSites = await response.json()
      setSites(updatedSites)
      setEditingSite(null)
      setShowEditForm(false)
    } catch (error) {
      console.error('Error updating site:', error)
      // 鏈湴寮€鍙戞椂妯℃嫙鏇存柊缃戠珯
      setSites(prev => prev.map(site => site.id === updatedSite.id ? updatedSite : site))
      setEditingSite(null)
      setShowEditForm(false)
      alert('缃戠珯鏇存柊鎴愬姛锛堟湰鍦版ā鎷燂級')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a2e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundImage: `url(https://api.xsot.cn/bing?jump=true&t=${backgroundTimestamp})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      transition: 'background 0.5s ease'
    }}>
      {/* 椤堕儴瀵艰埅鏍?*/}
      <header style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827'
            }}>鎴戠殑涓汉缃戝潃瀵艰埅</h1>
            {editMode ? (
              <button 
                onClick={() => setEditMode(false)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280'
                }}
              >
                閫€鍑虹紪杈?              </button>
            ) : (
              <button 
                onClick={() => setShowPasswordForm(true)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d97706'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f59e0b'
                }}
              >
                缂栬緫
              </button>
            )}
          </div>
          
          {/* 鎼滅储鏍?*/}
          <div style={{ 
            display: 'flex',
            gap: '8px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="杈撳叆鎼滅储鍐呭..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px 0 0 6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => setSearchTerm('')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              鎼滅储
            </button>
          </div>
          
          {/* 缂栬緫妯″紡宸ュ叿鏍?*/}
          {editMode && (
            <div style={{ 
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => setShowAddForm(true)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }}
              >
                娣诲姞绔欑偣
              </button>
              <button 
                onClick={() => setShowImportForm(true)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#15803d'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#16a34a'
                }}
              >
                瀵煎叆鏀惰棌澶?              </button>
              <button 
                onClick={() => setShowAddCategoryForm(true)}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#7c3aed'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b5cf6'
                }}
              >
                娣诲姞鍒嗙被
              </button>
              {filteredSites.length > 0 && (
                <button 
                  onClick={() => {
                    if (selectedSites.length === filteredSites.length) {
                      setSelectedSites([])
                    } else {
                      setSelectedSites(filteredSites.map(site => site.id))
                    }
                  }}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7c3aed'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#8b5cf6'
                  }}
                >
                  {selectedSites.length === filteredSites.length ? '鍙栨秷鍏ㄩ€? : '鍏ㄩ€?}
                </button>
              )}
              {selectedSites.length > 0 && (
                <button 
                  onClick={handleBatchDelete}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626'
                  }}
                >
                  鎵归噺鍒犻櫎 ({selectedSites.length})
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 鍒嗙被瀵艰埅 */}
      <div style={{ 
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{ 
              padding: '8px 16px',
              borderRadius: '6px 6px 0 0',
              backgroundColor: activeCategory === category ? '#2563eb' : 'white',
              color: activeCategory === category ? 'white' : '#4b5563',
              cursor: 'pointer',
              border: activeCategory === category ? '1px solid #2563eb' : '1px solid #e5e7eb',
              borderBottom: activeCategory === category ? '1px solid #2563eb' : '1px solid #e5e7eb'
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== category) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== category) {
                e.currentTarget.style.backgroundColor = 'white'
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 绔欑偣缃戞牸 */}
      <main style={{ 
        maxWidth: '1280px',
        margin: '20px auto',
        padding: '24px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px'
      }}>
        {/* 鍒嗙被鏍囬 */}
        {activeCategory && (
          <h2 style={{ 
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px'
          }}>{activeCategory}</h2>
        )}
        
        {/* 绔欑偣鍥炬爣缃戞牸 */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '16px'
        }}>
          {filteredSites.map(site => (
            <div 
              key={site.id} 
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                border: selectedSites.includes(site.id) ? '2px solid #2563eb' : 'none',
                cursor: editMode ? 'pointer' : 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              onClick={() => editMode && handleEditSite(site)}
            >
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`鎵撳紑 ${site.name}`}
                onClick={(e) => !editMode && e.stopPropagation()}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={getFaviconUrl(site.url)}
                  alt={`${site.name} icon`} 
                  style={{ 
                    width: '40px',
                    height: '40px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.src = fallbackIcon
                  }}
                />
              </a>
              <a 
                href={site.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '14px',
                  color: '#111827',
                  textDecoration: 'none',
                  textAlign: 'center',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#111827'
                }}
              >
                {site.name}
              </a>
              {editMode && (
                <input
                  type="checkbox"
                  checked={selectedSites.includes(site.id)}
                  onChange={() => handleSiteSelect(site.id)}
                  style={{ 
                    width: '16px',
                    height: '16px',
                    marginTop: '8px',
                    color: '#2563eb'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </main>
      {filteredSites.length === 0 && (
        <div style={{ 
          textAlign: 'center',
          padding: '48px',
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          <p style={{ 
            color: '#6b7280'
          }}>鏆傛棤绔欑偣锛岃娣诲姞鎴栧鍏ユ敹钘忓す</p>
        </div>
      )}

      {/* 娣诲姞绔欑偣琛ㄥ崟 */}
      {showAddForm && (
        <AddSiteForm 
          onAdd={handleAddSite} 
          onCancel={() => setShowAddForm(false)} 
          categories={categories}
        />
      )}

      {/* 瀵煎叆鏀惰棌澶硅〃鍗?*/}
      {showImportForm && (
        <ImportBookmarks 
          onComplete={handleImportComplete} 
          onCancel={() => setShowImportForm(false)} 
        />
      )}

      {/* 瀵嗙爜琛ㄥ崟 */}
      {showPasswordForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>璇疯緭鍏ュ瘑鐮佷互杩涘叆缂栬緫妯″紡</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div style={{
                marginBottom: '16px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>瀵嗙爜</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  required
                />
                {passwordError && (
                  <p style={{
                    color: '#dc2626',
                    fontSize: '12px',
                    marginTop: '4px'
                  }}>{passwordError}</p>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPassword('')
                    setPasswordError('')
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  鍙栨秷
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  纭畾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 娣诲姞鍒嗙被琛ㄥ崟 */}
      {showAddCategoryForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>娣诲姞鍒嗙被</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddCategory(newCategory)
            }}>
              <div style={{
                marginBottom: '16px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>鍒嗙被鍚嶇О</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  placeholder="渚嬪锛氭悳绱?
                  required
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryForm(false)
                    setNewCategory('')
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  鍙栨秷
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  娣诲姞
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 缂栬緫缃戠珯琛ㄥ崟 */}
      {showEditForm && editingSite && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#111827'
              }}>缂栬緫绔欑偣</h2>
              <button 
                onClick={() => {
                  setShowEditForm(false)
                  setEditingSite(null)
                }}
                style={{
                  color: '#6b7280',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4b5563'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280'
                }}
              >
                脳
              </button>
            </div>

            <EditSiteForm 
              site={editingSite} 
              categories={categories}
              onUpdate={handleUpdateSite} 
              onCancel={() => {
                setShowEditForm(false)
                setEditingSite(null)
              }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App





