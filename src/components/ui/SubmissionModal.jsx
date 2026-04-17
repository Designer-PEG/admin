import React from 'react';
import { FiX, FiMail, FiUser, FiGlobe, FiClock } from 'react-icons/fi';
import Badge from './Badge';

const SubmissionModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch { return dateStr || '—'; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-all duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submission Details</h2>
            <Badge variant={submission.type === 'contact' ? 'info' : 'primary'}>
              {submission.type === 'contact' ? 'Contact Form' : 'Subscription'}
            </Badge>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-gray-300 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FiUser className="w-4 h-4"/> Name / Company</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">{submission.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FiMail className="w-4 h-4"/> Email Address</p>
              <a href={`mailto:${submission.email}`} className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline">{submission.email || 'No email'}</a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FiGlobe className="w-4 h-4"/> Source Website</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">{submission.sourceSite || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FiClock className="w-4 h-4"/> Received Date</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 tabular-nums">{formatDate(submission.submittedAt)}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Subject</p>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
              {submission.subject || 'No subject'}
            </p>
          </div>

          <div className="pb-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Message Content</p>
            <div className="text-base text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/50 p-5 rounded-xl border border-gray-100 dark:border-slate-700/50 whitespace-pre-wrap leading-relaxed shadow-inner">
              {submission.message || 'No message content provided.'}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;
