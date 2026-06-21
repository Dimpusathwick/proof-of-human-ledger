// frontend/src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // Navigation tabs toggle state switcher ('upload' or 'search')
  const [activeTab, setActiveTab] = useState('upload');

  // Core functional processing hooks states
  const [file, setFile] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Clear states when navigating across feature tabs
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    setError('');
    setResult(null);
    setFile(null);
    setSearchId('');
    setCopied(false);
  };

  // Process Document Upload Execution
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please choose a local document file before processing.');

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('http://localhost:5000/api/verify', formData);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during blockchain verification routing.');
    } finally {
      setLoading(false);
    }
  };

  // Process Database Public ID Ledger Search Lookup Execution
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return setError('Please input a valid 24-character Record Ledger ID string.');

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/verify/${searchId.trim()}`);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Network error looking up this registration signature record.');
    } finally {
      setLoading(false);
    }
  };

  // Utility copy button handler
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.dashboardCard}>
        
        {/* Header Header Brand Banner */}
        <header style={styles.headerArea}>
          <div style={styles.logoBadge}>🛡️</div>
          <h1 style={styles.appTitle}>Proof of Human</h1>
          <p style={styles.appSubtitle}>Cryptographic Authenticity Engine & Public Registry Ledger</p>
        </header>

        {/* Tab Navigation Switches Controls Bar */}
        <div style={styles.navTabsBar}>
          <button 
            onClick={() => handleTabSwitch('upload')}
            style={{...styles.tabButton, ...(activeTab === 'upload' ? styles.activeTabButton : {})}}
          >
            📥 Issue New Certificate
          </button>
          <button 
            onClick={() => handleTabSwitch('search')}
            style={{...styles.tabButton, ...(activeTab === 'search' ? styles.activeTabButton : {})}}
          >
            🔍 Public Registry Search
          </button>
        </div>

        {/* Panel View Mode Switch Box Router */}
        {activeTab === 'upload' ? (
          <form onSubmit={handleUploadSubmit} style={styles.formContainer}>
            <div style={styles.uploadDropzone}>
              <input 
                type="file" 
                onChange={(e) => { setFile(e.target.files[0]); setError(''); setResult(null); }} 
                style={styles.hiddenFileInput} 
                id="file-uploader"
              />
              <label htmlFor="file-uploader" style={styles.uploadLabel}>
                <span style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}>📄</span>
                <strong>{file ? file.name : "Click to select document file"}</strong>
                <span style={styles.uploadHelpText}>{file ? `${(file.size / 1024).toFixed(1)} KB File Loaded` : "Supports plain text documents and assets"}</span>
              </label>
            </div>
            
            <button type="submit" disabled={loading} style={styles.primaryActionButton}>
              {loading ? 'Executing Cryptographic Matrix Analysis...' : 'Authenticate & Log to Ledger'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSearchSubmit} style={styles.formContainer}>
            <div style={styles.searchBarWrapper}>
              <input 
                type="text"
                placeholder="Paste unique 24-character Ledger Record ID (e.g. 6a266daf31c86...)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={styles.searchInputElement}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.secondaryActionButton}>
              {loading ? 'Querying Secure Vault Registry...' : 'Lookup Digital Identity'}
            </button>
          </form>
        )}

        {/* Alert Notification Display Error Box Row */}
        {error && (
          <div style={styles.errorAlertPanel}>
            <strong>⚠️ Security Exception:</strong> {error}
          </div>
        )}

        {/* The Beautiful Certificate Output Presentation Card */}
        {result && (
          <div style={styles.certificateWrapperCard}>
            <div style={styles.certDecorativeHeader}>
              <span>VERIFIED ORIGINAL SECURE LEDGER ASSET</span>
              <span>ID: {result._id.slice(-6).toUpperCase()}</span>
            </div>

            <h3 style={styles.certMainHeadline}>🛡️ Certificate of Digital Verification</h3>
            
            <div style={styles.certMetricScoreRow}>
              <div style={styles.scoreGaugeCircle}>
                <span style={styles.scoreNumberText}>{result.humanScore}%</span>
                <span style={styles.scoreLabelSub}>Human Index</span>
              </div>
              <div style={styles.certQuickSummarySummary}>
                <h4>{result.fileName}</h4>
                <p>Status: <span style={{color: '#16a34a', fontWeight: 'bold'}}>Locked & Timestamped</span></p>
                <p style={{fontSize: '11px', color: '#64748b'}}>Registered: {new Date(result.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div style={styles.metadataOutputStackContainer}>
              <div style={styles.metaRowField}>
                <span style={styles.metaLabelHeader}>Unique Storage Identifier (Record ID)</span>
                <div style={styles.copyFlexWrapper}>
                  <code style={styles.codeSnippetFont}>{result._id}</code>
                  <button 
                    onClick={() => copyToClipboard(result._id)}
                    style={styles.copyEmbedButton}
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div style={styles.metaRowField}>
                <span style={styles.metaLabelHeader}>Cryptographic File Signature Fingerprint (SHA-256)</span>
                <code style={{...styles.codeSnippetFont, wordBreak: 'break-all'}}>{result.fileHash}</code>
              </div>
            </div>

            <footer style={styles.certWatermarkFooter}>
              SECURE CRYPTO PROTOCOL PROOF-OF-HUMAN INFRASTRUCTURE NETWORK LABS
            </footer>
          </div>
        )}

      </div>
    </div>
  );
}

// Advanced Premium Design System CSS Styles Guide Object
const styles = {
  appContainer: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#0f172a', // Deep dark slate premium luxury dark mode vibe
    backgroundLinearGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    minHeight: '100vh',
    padding: '60px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardCard: {
    maxWidth: '680px',
    width: '100%',
    backgroundColor: '#1e293b', // Sleek dark panel fill
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
  },
  headerArea: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  logoBadge: {
    fontSize: '40px',
    marginBottom: '12px',
    display: 'inline-block',
  },
  appTitle: {
    color: '#f8fafc',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: '0 0 8px 0',
  },
  appSubtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
  navTabsBar: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    backgroundColor: '#0f172a',
    padding: '6px',
    borderRadius: '12px',
    marginBottom: '30px',
  },
  tabButton: {
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTabButton: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  uploadDropzone: {
    border: '2px dashed #475569',
    borderRadius: '12px',
    backgroundColor: '#111827',
    padding: '40px 20px',
    textAlign: 'center',
    transition: 'border-color 0.2s',
    cursor: 'pointer',
  },
  hiddenFileInput: {
    display: 'none',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
    color: '#e2e8f0',
  },
  uploadHelpText: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px',
  },
  searchBarWrapper: {
    backgroundColor: '#111827',
    border: '1px solid #475569',
    borderRadius: '12px',
    padding: '4px',
  },
  searchInputElement: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    color: '#f8fafc',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  primaryActionButton: {
    padding: '14px',
    backgroundColor: '#6366f1', // Indigo modern theme button
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
  },
  secondaryActionButton: {
    padding: '14px',
    backgroundColor: '#0ea5e9', // Sky blue query button
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
  },
  errorAlertPanel: {
    padding: '14px',
    backgroundColor: '#451a03',
    color: '#fca5a5',
    borderRadius: '10px',
    fontSize: '13px',
    borderLeft: '4px solid #ef4444',
  },
  certificateWrapperCard: {
    marginTop: '35px',
    backgroundColor: '#ffffff', // High-fidelity clean white contrast certificate sheet paper look
    color: '#0f172a',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
    backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 0)',
    backgroundSize: '24px 24px',
  },
  certDecorativeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '1px',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  certMainHeadline: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e3a8a',
    margin: '0 0 25px 0',
  },
  certMetricScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '25px',
  },
  scoreGaugeCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
  },
  scoreNumberText: {
    fontSize: '22px',
    fontWeight: '800',
  },
  scoreLabelSub: {
    fontSize: '8px',
    textTransform: 'uppercase',
    fontWeight: '600',
    opacity: 0.9,
  },
  certQuickSummarySummary: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metadataOutputStackContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  metaRowField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metaLabelHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  copyFlexWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  codeSnippetFont: {
    flex: 1,
    fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
    backgroundColor: '#f1f5f9',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
  },
  copyEmbedButton: {
    padding: '8px 14px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  certWatermarkFooter: {
    textAlign: 'center',
    fontSize: '9px',
    color: '#94a3b8',
    letterSpacing: '0.5px',
    marginTop: '30px',
    borderTop: '1px dashed #e2e8f0',
    paddingTop: '15px',
    fontWeight: '600',
  }
};

export default App;