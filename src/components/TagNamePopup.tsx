import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CheckCircle, AlertCircle } from 'lucide-react';

interface TagNamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tagName: string) => Promise<boolean>;
}

const TagNamePopup: React.FC<TagNamePopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const [tagName, setTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      setError('Please enter a tag name');
      return;
    }

    if (tagName.trim().length < 3) {
      setError('Tag name must be at least 3 characters');
      return;
    }

    if (tagName.trim().length > 20) {
      setError('Tag name must be less than 20 characters');
      return;
    }

    // Check for valid characters (alphanumeric and basic symbols)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(tagName.trim())) {
      setError('Tag name can only contain letters, numbers, underscore, and dash');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const success = await onSubmit(tagName.trim());
      if (success) {
        // Success is handled by the parent component
        setTagName('');
      } else {
        setError('Failed to set tag name. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTagName('');
      setError('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${isDesktop ? 'max-w-md w-full' : 'w-full max-w-sm'} glass-card-mobile rounded-3xl p-6 relative`}
          >
            {/* Close Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors opacity-0 pointer-events-none cursor-not-allowed"
            >
              <X className="h-5 w-5 text-white/60" />
            </motion.button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Set Your Tag Name</h3>
              <p className="text-white/70 text-sm">Choose a unique identifier for your ORION profile</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => {
                    setTagName(e.target.value);
                    setError(''); // Clear error when typing
                  }}
                  placeholder="Enter your tag name"
                  maxLength={20}
                  disabled={isSubmitting}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all disabled:opacity-50"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                  {tagName.length}/20
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-400"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Guidelines */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-white/70 text-sm mb-2">Guidelines:</div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !tagName.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Set Tag Name</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TagNamePopup;