import React from 'react';
import { downloadSubmissionFile, viewSubmissionFile } from '../services/api';
import { Download, Eye } from 'lucide-react';

const FileDownload = ({ submissionId, className = 'btn btn-secondary' }) => {
  const [busy, setBusy] = React.useState(null);

  const run = async (mode) => {
    setBusy(mode);
    try {
      if (mode === 'view') await viewSubmissionFile(submissionId);
      else await downloadSubmissionFile(submissionId);
    } catch (err) {
      window.alert(err.message || 'File action failed');
    } finally {
      setBusy(null);
    }
  };

  const compact = { padding: '0.3rem 0.65rem', fontSize: '0.8rem' };

  return (
    <span style={{ display: 'inline-flex', gap: '0.4rem' }}>
      <button type="button" className={className} style={compact} onClick={() => run('view')} disabled={!!busy}>
        <Eye size={14} />
        <span>{busy === 'view' ? '…' : 'View'}</span>
      </button>
      <button type="button" className={className} style={compact} onClick={() => run('download')} disabled={!!busy}>
        <Download size={14} />
        <span>{busy === 'download' ? '…' : 'Download'}</span>
      </button>
    </span>
  );
};

export default FileDownload;
