import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface TagNameData {
  tagName: string;
  hasTagName: boolean;
  isLoading: boolean;
}

export const useTagName = () => {
  const { address } = useAccount();
  const [tagNameData, setTagNameData] = useState<TagNameData>({
    tagName: '',
    hasTagName: false,
    isLoading: false
  });
  const [showTagNamePopup, setShowTagNamePopup] = useState(false);

  // Check if user has a tag name
  const checkTagName = async () => {
    if (!address) return;

    setTagNameData(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('🏷️ Checking tag name for:', address);
      
      const response = await fetch(`https://theorion.network/apis/index.php?action=getTagName&address=${address}`, {
        method: 'GET',
      });
      
      const data = await response.json();
      console.log('🏷️ Tag name API response:', data);
      
      if (data.status === 'success' && data.data?.tagName) {
        setTagNameData({
          tagName: data.data.tagName,
          hasTagName: true,
          isLoading: false
        });
      } else {
        setTagNameData({
          tagName: '',
          hasTagName: false,
          isLoading: false
        });
        
        // Show popup if user doesn't have a tag name
        setShowTagNamePopup(true);
      }
      
    } catch (error) {
      console.error('❌ Error checking tag name:', error);
      setTagNameData({
        tagName: '',
        hasTagName: false,
        isLoading: false
      });
      
      // Show popup on error as well (user might not have tag name)
      setShowTagNamePopup(true);
    }
  };

  // Set tag name
  const setTagName = async (newTagName: string): Promise<boolean> => {
    if (!address || !newTagName.trim()) return false;

    try {
      console.log('🏷️ Setting tag name for address:', address, 'tagName:', newTagName);
      
      const response = await fetch('https://theorion.network/apis/index.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          address: address.toLowerCase(),
          tagName: newTagName.trim()
        }),
      });
      
      console.log('📥 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('📥 Raw API Response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      console.log('📊 Parsed API Response:', data);
      
      if (data.status === 'success') {
        console.log('✅ Tag name set successfully');
        setTagNameData({
          tagName: newTagName.trim(),
          hasTagName: true,
          isLoading: false
        });
        setShowTagNamePopup(false);
        return true;
      } else {
        console.error('❌ API returned error:', data.message);
        throw new Error(data.message || 'Failed to set tag name');
      }
      
    } catch (error) {
      console.error('❌ Error setting tag name:', error);
      return false;
    }
  };

  // Auto-check when address changes
  useEffect(() => {
    if (address) {
      // Add delay to avoid too frequent API calls
      const timer = setTimeout(() => {
        checkTagName();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [address]);

  return {
    ...tagNameData,
    showTagNamePopup,
    setShowTagNamePopup,
    setTagName,
    checkTagName
  };
};