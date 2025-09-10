import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  ArrowLeft, 
  Users, 
  Crown, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Calendar,
  Award,
  Star,
  Shield,
  Zap
} from 'lucide-react';

interface TeamHistoryProps {
  onBack: () => void;
}

interface TeamMember {
  timestamp: string;
  address: string;
  sponser: string;
  name: string;
  level: number;
  direct: number;
  userTotalPh: number;
  userRank: string;
  status: number;
  team: number;
}

interface TeamLevel {
  level: number;
  members: TeamMember[];
  isLoading: boolean;
  isExpanded: boolean;
  hasMore: boolean;
}

// Cache for team data
const teamCache = new Map<string, TeamMember[]>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const CHUNK_SIZE = 50; // Load members in chunks

const TeamHistory: React.FC<TeamHistoryProps> = ({ onBack }) => {
  const { address } = useAccount();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [teamLevels, setTeamLevels] = useState<TeamLevel[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [totalTeamCount, setTotalTeamCount] = useState(0);
  const [loadingChunks, setLoadingChunks] = useState<Set<string>>(new Set());

  // Debug logging for component state
  console.log('🔍 TEAM HISTORY RENDER:', {
    address,
    teamLevelsLength: teamLevels.length,
    isInitialLoading,
    totalTeamCount,
    isDesktop
  });

  // Robust JSON extraction function
  const extractJSON = (responseText: string): any => {
    try {
      // First try direct parsing
      return JSON.parse(responseText);
    } catch (e) {
      // If direct parsing fails, extract JSON more robustly
      console.log('🔧 Direct JSON parse failed, extracting...');
      
      // Find the start of JSON (first [ or {)
      const jsonStart = Math.max(responseText.indexOf('['), responseText.indexOf('{'));
      if (jsonStart === -1) {
        throw new Error('No JSON found in response');
      }
      
      // Find the end of JSON by counting brackets
      let jsonEnd = -1;
      let bracketCount = 0;
      let inString = false;
      let escapeNext = false;
      const startChar = responseText[jsonStart];
      const endChar = startChar === '[' ? ']' : '}';
      
      for (let i = jsonStart; i < responseText.length; i++) {
        const char = responseText[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === startChar) {
            bracketCount++;
          } else if (char === endChar) {
            bracketCount--;
            if (bracketCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
      }
      
      if (jsonEnd === -1) {
        throw new Error('Could not find end of JSON');
      }
      
      const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
      console.log('🔧 Extracted JSON:', jsonString.substring(0, 200) + '...');
      
      return JSON.parse(jsonString);
    }
  };

  // Cache key generator
  const getCacheKey = (address: string, level: number, teamIds?: number[]): string => {
    if (level === 1) {
      return `team_${address}_level_1`;
    }
    return `team_${address}_level_${level}_${teamIds?.join(',') || ''}`;
  };

  // Check cache validity
  const isCacheValid = (key: string): boolean => {
    const cached = teamCache.get(key);
    return cached && cached.length > 0;
  };

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch initial team data (Level 1)
  const fetchInitialTeamData = async () => {
    if (!address) return;
    
    console.log('🚀 FETCH INITIAL TEAM DATA CALLED for address:', address);
    
    const cacheKey = getCacheKey(address, 1);
    if (isCacheValid(cacheKey)) {
      console.log('📦 Using cached initial team data');
      const cachedData = teamCache.get(cacheKey)!;
      setTeamLevels([{
        level: 1,
        members: cachedData,
        isLoading: false,
        isExpanded: true,
        hasMore: cachedData.length >= CHUNK_SIZE
      }]);
      setTotalTeamCount(cachedData.length);
      return;
    }

    setIsInitialLoading(true);
    console.log('🔄 Setting isInitialLoading to true');
    try {
      console.log('🔍 Fetching initial team data for wallet:', address);
      
      const response = await fetch(`https://theorion.network/fetchTeam.php?wallet=${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('📡 API Response status:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📝 Raw response:', responseText);
      
      // Parse JSON directly since API now returns clean JSON
      const data = JSON.parse(responseText);
      console.log('📊 Initial team data:', data);
      
      // Handle error responses
      if (data.error) {
        console.error('❌ API Error:', data.error);
        setTeamLevels([]);
        setTotalTeamCount(0);
        return;
      }
      
      if (Array.isArray(data)) {
        const level1Members = data.map(item => ({
          timestamp: item.timestamp || new Date().toISOString().split('T')[0],
          address: item.address || '',
          sponser: item.sponser || address,
          name: item.name || 'Unknown',
          level: 1,
          direct: item.direct || 0,
          userTotalPh: item.userTotalPh || 0,
          userRank: item.userRank || 'RUNRUP',
          status: item.status || 1,
          team: item.team || 0
        }));

        // Debug: Log team IDs for Level 1 members
        console.log('🔍 Level 1 members team IDs:', level1Members.map(m => ({ address: m.address.slice(0, 6), teamId: m.team })));

        // Cache the data
        teamCache.set(cacheKey, level1Members);

        setTeamLevels([{
          level: 1,
          members: level1Members,
          isLoading: false,
          isExpanded: true,
          hasMore: level1Members.length >= CHUNK_SIZE
        }]);

        setTotalTeamCount(level1Members.length);
        console.log('✅ Team levels set with', level1Members.length, 'members');
      } else {
        console.log('📊 No team data found or invalid format');
        setTeamLevels([]);
        setTotalTeamCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching initial team data:', error);
      
      // Set empty state instead of crashing
      setTeamLevels([]);
      setTotalTeamCount(0);
    } finally {
      setIsInitialLoading(false);
      console.log('🔄 Setting isInitialLoading to false');
    }
  };

  // Fetch next level team data
  const fetchNextLevel = async (currentLevel: number, teamIds: number[]): Promise<TeamMember[]> => {
    if (teamIds.length === 0) return [];
    
    console.log('🔍 Fetching next level with teamIds:', teamIds, 'for level:', currentLevel + 1);
    
    const cacheKey = getCacheKey(address!, currentLevel, teamIds);
    if (isCacheValid(cacheKey)) {
      console.log(`📦 Using cached level ${currentLevel + 1} data`);
      return teamCache.get(cacheKey)!;
    }
    
    const chunkKey = `${currentLevel}_${teamIds.join(',')}`;
    if (loadingChunks.has(chunkKey)) {
      console.log(`⏳ Already loading level ${currentLevel + 1}, skipping...`);
      return [];
    }
    
    setLoadingChunks(prev => new Set([...prev, chunkKey]));

    try {
      console.log('🔍 Fetching next level', currentLevel + 1, 'with nextList:', teamIds);
      
      const response = await fetch('https://theorion.network/fetchTeam.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: new URLSearchParams({
          nextList: teamIds.join(','), // Send as comma-separated string
          level: (currentLevel + 1).toString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log(`📝 Level ${currentLevel + 1} raw response:`, responseText);
      
      // Use robust JSON extraction
      const data = extractJSON(responseText);
      console.log(`📊 Level ${currentLevel + 1} team data:`, data);
      console.log(`🔍 API response for level ${currentLevel + 1}:`, data);
      
      // Handle error responses
      if (data.error) {
        console.error('❌ API Error:', data.error);
        return [];
      }
      
      if (Array.isArray(data)) {
        const nextLevelMembers = data.map(item => ({
          timestamp: item.timestamp || new Date().toISOString().split('T')[0],
          address: item.address || '',
          sponser: item.sponser || '',
          name: item.name || 'Unknown',
          level: currentLevel + 1,
          direct: item.direct || 0,
          userTotalPh: item.userTotalPh || 0,
          userRank: item.userRank || 'RUNRUP',
          status: item.status || 1,
          team: item.team || 0
        }));
        
        console.log(`🔍 Level ${currentLevel + 1} processed members:`, nextLevelMembers.map(m => ({ address: m.address.slice(0, 6), teamId: m.team })));
        return nextLevelMembers;
      }
      
      return [];
    } catch (error) {
      console.error(`❌ Error fetching level ${currentLevel + 1} data:`, error);
      
      return [];
    } finally {
      setLoadingChunks(prev => {
        const updated = new Set(prev);
        updated.delete(chunkKey);
        return updated;
      });
    }
  };

  // Expand level and load next level data
  const expandLevel = async (levelIndex: number) => {
    const level = teamLevels[levelIndex];
    if (!level) return;
    
    console.log('🔄 EXPAND LEVEL called for level:', level.level, 'isExpanded:', level.isExpanded);
    
    // If already expanded, just toggle to collapsed
    if (level.isExpanded) {
      console.log('🔽 Level already expanded, collapsing...');
      collapseLevel(levelIndex);
      return;
    }

    // Mark as loading
    setTeamLevels(prev => prev.map((l, i) => 
      i === levelIndex ? { ...l, isLoading: true } : l
    ));

    // Get team IDs from current level
    const teamIds = level.members.map(member => member.team).filter(id => id > 0);
    console.log('🔍 Team IDs for next level:', teamIds);
    
    if (teamIds.length > 0) {
      const nextLevelMembers = await fetchNextLevel(level.level, teamIds);
      
      if (nextLevelMembers.length > 0) {
        console.log('✅ Got next level members:', nextLevelMembers.length);
        // Add next level
        setTeamLevels(prev => {
          const updated = [...prev];
          
          // Mark current level as expanded
          updated[levelIndex] = { ...level, isLoading: false, isExpanded: true };
          
          // Check if next level already exists
          const nextLevelIndex = updated.findIndex(l => l.level === level.level + 1);
          if (nextLevelIndex === -1) {
            console.log('➕ Adding new level:', level.level + 1);
            // Add new level only if it doesn't exist
            updated.push({
              level: level.level + 1,
              members: nextLevelMembers,
              isLoading: false,
              isExpanded: false,
              hasMore: nextLevelMembers.length >= CHUNK_SIZE
            });
          } else {
            console.log('🔄 Updating existing level:', level.level + 1);
            // Update existing level with new data
            updated[nextLevelIndex] = {
              level: level.level + 1,
              members: nextLevelMembers,
              isLoading: false,
              isExpanded: false,
              hasMore: nextLevelMembers.length >= CHUNK_SIZE
            };
          }
          
          return updated;
        });

        setTotalTeamCount(prev => prev + nextLevelMembers.length);
      } else {
        console.log('❌ No next level members found');
        // No next level members, just mark as expanded
        setTeamLevels(prev => prev.map((l, i) => 
          i === levelIndex ? { ...l, isLoading: false, isExpanded: true } : l
        ));
      }
    } else {
      console.log('❌ No team IDs to fetch');
      // No team IDs to fetch, just mark as expanded
      setTeamLevels(prev => prev.map((l, i) => 
        i === levelIndex ? { ...l, isLoading: false, isExpanded: true } : l
      ));
    }
  };

  // Collapse level
  const collapseLevel = (levelIndex: number) => {
    console.log('🔽 COLLAPSE LEVEL called for index:', levelIndex);
    setTeamLevels(prev => {
      const updated = [...prev];
      // Mark current level as collapsed
      updated[levelIndex] = { ...updated[levelIndex], isExpanded: false };
      
      // Remove all levels AFTER this one (keep current level)
      const filteredLevels = updated.filter(l => l.level <= updated[levelIndex].level);
      console.log('🔽 Levels after collapse:', filteredLevels.map(l => l.level));
      return filteredLevels;
    });
    
    // Update total team count by removing collapsed levels
    setTotalTeamCount(prev => {
      const currentLevel = teamLevels[levelIndex];
      const removedLevels = teamLevels.filter(l => l.level > currentLevel.level);
      const removedCount = removedLevels.reduce((sum, level) => sum + level.members.length, 0);
      console.log('🔽 Removing', removedCount, 'members from collapsed levels');
      return prev - removedCount;
    });
  };

  // Get filtered members across all levels
  const getFilteredMembers = () => {
    if (!searchTerm) return teamLevels;

    return teamLevels.map(level => ({
      ...level,
      members: level.members.filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
          member.address.toLowerCase().includes(searchLower) ||
          member.name.toLowerCase().includes(searchLower) ||
          member.sponser.toLowerCase().includes(searchLower) ||
          member.userRank.toLowerCase().includes(searchLower)
        );
      })
    }));
  };

  const filteredLevels = getFilteredMembers();

  // Get rank color
  const getRankColor = (rank: string) => {
    switch (rank.toUpperCase()) {
      case 'STAR': return 'text-yellow-400';
      case 'GOLD': return 'text-yellow-500';
      case 'PLATINUM': return 'text-gray-300';
      case 'RUBY': return 'text-red-400';
      case 'DIAMOND': return 'text-blue-400';
      case 'CROWN DIAMOND': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank.toUpperCase()) {
      case 'STAR': return Star;
      case 'GOLD': return Award;
      case 'PLATINUM': return Shield;
      case 'RUBY': return Crown;
      case 'DIAMOND': return Crown;
      case 'CROWN DIAMOND': return Crown;
      default: return Star;
    }
  };

  // Load initial data
  useEffect(() => {
    if (address) {
      console.log('🔄 useEffect triggered for address:', address);
      fetchInitialTeamData();
    }
    else {
      console.log('❌ No address available for team data fetch');
    }
  }, [address]);

  // Force initial data load for mobile if not already loaded
  React.useEffect(() => {
    if (address && teamLevels.length === 0 && !isInitialLoading) {
      console.log('📱 MOBILE: Force loading initial team data...');
      fetchInitialTeamData();
    }
  }, [address, teamLevels.length, isInitialLoading]);

  return (
    <div className={`min-h-screen ${isDesktop ? 'desktop-bg' : 'mobile-bg'} ${isDesktop ? '' : 'pt-20 pb-20'}`}>
      <div className={`space-y-6 ${isDesktop ? 'max-w-6xl mx-auto p-8' : 'px-4 py-6'}`}>

        {/* Header */}
        <div className={`flex items-center justify-between ${isDesktop ? 'mb-8' : 'mb-6'}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className={`${isDesktop ? 'p-4 glass-card rounded-2xl' : 'p-3 glass-card-mobile rounded-2xl'} text-white hover:bg-white/10 transition-all`}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <h2 className={`${isDesktop ? 'text-2xl' : 'text-xl'} font-bold text-white font-orbitron`}>Team History</h2>
          <div className="flex items-center space-x-2">
            <div className="text-white/60 text-sm">
              {totalTeamCount} members
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team members..."
            className={`w-full pl-12 pr-4 ${isDesktop ? 'py-4 text-base' : 'py-3 text-sm'} bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all`}
          />
        </div>

        {/* Loading State */}
        {isInitialLoading && (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Team Levels */}
        {!isInitialLoading && (
          <div className="space-y-4">
            {filteredLevels.map((level, levelIndex) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: levelIndex * 0.1 }}
                className={`${isDesktop ? 'glass-card rounded-2xl p-6' : 'glass-card-mobile rounded-xl p-4'}`}
              >
                {/* Level Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`${isDesktop ? 'w-12 h-12' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center`}>
                      <Users className={`${isDesktop ? 'h-6 w-6' : 'h-5 w-5'} text-white`} />
                    </div>
                    <div>
                      <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-bold text-white font-orbitron`}>
                        Level {level.level}
                      </h3>
                      <p className={`text-white/60 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                        {level.members.length} members
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  {level.members.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => level.isExpanded ? collapseLevel(levelIndex) : expandLevel(levelIndex)}
                      disabled={level.isLoading}
                      className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all font-orbitron"
                    >
                      {level.isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : level.isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {level.isLoading ? 'Loading...' : level.isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                    </motion.button>
                  )}
                </div>

                {/* Team Members */}
                <AnimatePresence>
                  {level.isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {level.members.map((member, memberIndex) => {
                        const RankIcon = getRankIcon(member.userRank);
                        
                        return (
                          <motion.div
                            key={`${member.address}-${memberIndex}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: memberIndex * 0.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMember(member)}
                            className={`${isDesktop ? 'p-4' : 'p-3'} bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all`}
                          >
                            <div className={`flex items-center ${isDesktop ? 'space-x-4' : 'space-x-3'}`}>
                              {/* Status & Rank Icon */}
                              <div className="flex flex-col items-center space-y-1">
                                <div className={`${isDesktop ? 'w-10 h-10' : 'w-8 h-8'} bg-gradient-to-br ${
                                  member.status === 1 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
                                } rounded-xl flex items-center justify-center`}>
                                  {member.status === 1 ? (
                                    <CheckCircle className={`${isDesktop ? 'h-5 w-5' : 'h-4 w-4'} text-white`} />
                                  ) : (
                                    <XCircle className={`${isDesktop ? 'h-5 w-5' : 'h-4 w-4'} text-white`} />
                                  )}
                                </div>
                                <RankIcon className={`h-3 w-3 ${getRankColor(member.userRank)}`} />
                              </div>

                              {/* Member Info */}
                              <div className="flex-1 min-w-0">
                                <div className={`flex items-center justify-between ${isDesktop ? 'mb-1' : 'mb-0.5'}`}>
                                  <h4 className={`text-white font-semibold ${isDesktop ? 'text-base' : 'text-sm'} truncate pr-2 font-orbitron`}>
                                    {member.name}
                                  </h4>
                                  <div className={`text-white/60 font-orbitron ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                    Level {member.level}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className={`text-white/70 ${isDesktop ? 'text-sm' : 'text-xs'} font-mono`}>
                                      {member.address.slice(0, 6)}...{member.address.slice(-4)}
                                    </div>
                                    <div className={`text-white/50 ${isDesktop ? 'text-xs' : 'text-2xs'}`}>
                                      {member.timestamp}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-white font-bold ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                      {member.direct} Direct
                                    </div>
                                    <div className={`${getRankColor(member.userRank)} ${isDesktop ? 'text-xs' : 'text-2xs'} font-semibold`}>
                                      {member.userRank}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {level.members.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/60 text-sm">No team members at this level</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {teamLevels.length === 0 && !isInitialLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center ${isDesktop ? 'py-12' : 'py-8'}`}
              >
                <div className={`${isDesktop ? 'w-16 h-16' : 'w-12 h-12'} bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Users className={`${isDesktop ? 'h-8 w-8' : 'h-6 w-6'} text-white/40`} />
                </div>
                <h3 className={`text-white font-semibold mb-2 ${isDesktop ? 'text-lg' : 'text-base'}`}>No team data found</h3>
                <p className={`text-white/60 ${isDesktop ? 'text-sm' : 'text-xs'}`}>Start building your team to see members here</p>
                <button
                  onClick={fetchInitialTeamData}
                  className={`mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-all ${isDesktop ? 'text-sm' : 'text-xs'}`}
                >
                  Retry Loading
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-end justify-center p-4"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${isDesktop ? 'max-w-md w-full' : 'w-full max-w-sm mx-4'} glass-card-mobile rounded-3xl p-6 space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`${isDesktop ? 'text-xl' : 'text-lg'} font-bold text-white`}>
                    Team Member Details
                  </h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMember(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-white/60" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Name</span>
                    <span className="text-white font-semibold text-right">
                      {selectedMember.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Address</span>
                    <span className="text-white font-mono text-xs text-right">
                      {selectedMember.address.slice(0, 8)}...{selectedMember.address.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Sponsor</span>
                    <span className="text-white font-mono text-xs text-right">
                      {selectedMember.sponser.slice(0, 6)}...{selectedMember.sponser.slice(-4)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Level</span>
                    <span className="text-white font-semibold text-right">
                      {selectedMember.level}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Direct Team</span>
                    <span className="text-white font-semibold text-right">
                      {selectedMember.direct}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Total PH</span>
                    <span className="text-white font-semibold text-right">
                      ${selectedMember.userTotalPh.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Rank</span>
                    <span className={`font-semibold text-right ${getRankColor(selectedMember.userRank)}`}>
                      {selectedMember.userRank}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Status</span>
                    <span className={`font-semibold text-right ${selectedMember.status === 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedMember.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Join Date</span>
                    <span className="text-white font-semibold text-right">
                      {selectedMember.timestamp}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(`https://polygonscan.com/address/${selectedMember.address}`, '_blank')}
                  className={`w-full ${isDesktop ? 'py-3' : 'py-2'} bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2`}
                >
                  <span className={isDesktop ? 'text-base' : 'text-sm'}>View on Explorer</span>
                  <ExternalLink className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default TeamHistory;