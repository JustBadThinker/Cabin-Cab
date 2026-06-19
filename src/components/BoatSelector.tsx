import React, { useState, useMemo } from 'react';
import { Search, Anchor, X, CalendarX, CalendarCheck, Ship } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'motion/react';
import { CabinList } from './CabinList';

export const BoatSelector: React.FC = () => {
  const { 
    boats, 
    tabs, 
    activeTabId, 
    setSelectedBoatName, 
    toggleBoatAvailability, 
    setActiveSectionTab 
  } = useStore();
  
  const activeTab = (tabs.find(t => t.id === activeTabId) || tabs[0] || {}) as any;
  const { 
    selectedBoatName, 
    unavailableBoatNames = [], 
    activeSectionTab = 'BOATS', 
    language = 'FR', 
    mode = 'CABIN' 
  } = activeTab;

  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(boats, {
    keys: ['name'],
    threshold: 0.3,
  }), [boats]);

  const filteredBoats = useMemo(() => {
    if (!search) return boats;
    return fuse.search(search).map(result => result.item);
  }, [search, boats, fuse]);

  if (boats.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Search Input always visible at the top */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          placeholder={language === 'FR' ? "Rechercher un bateau..." : "Search boat name..."}
          value={search}
          onFocus={(e) => {
            if (activeSectionTab !== 'BOATS') {
              setActiveSectionTab('BOATS');
            }
            if (search) {
              e.currentTarget.select();
            }
          }}
          onClick={(e) => {
            if (search) {
              e.currentTarget.select();
            }
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            if (activeSectionTab !== 'BOATS') {
              setActiveSectionTab('BOATS');
            }
          }}
          className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm animate-fade-in"
        />
        <AnimatePresence>
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setSearch('');
                setActiveSectionTab('BOATS');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs list (Only show if CABIN mode and a boat is available/selected) */}
      {mode === 'CABIN' && (
        <div className="flex border-b border-border/60">
          <button
            onClick={() => setActiveSectionTab('BOATS')}
            className={cn(
              "flex-1 pb-3 text-center text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer relative",
              activeSectionTab === 'BOATS'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {language === 'FR' ? 'Bateau' : 'Boat'}
            {selectedBoatName && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-mono lowercase">
                {selectedBoatName}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              if (selectedBoatName) {
                setActiveSectionTab('CABINS');
              }
            }}
            disabled={!selectedBoatName}
            className={cn(
              "flex-1 pb-3 text-center text-xs font-bold uppercase tracking-widest border-b-2 transition-all relative flex items-center justify-center gap-1.5",
              activeSectionTab === 'CABINS'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
              !selectedBoatName ? "opacity-35 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            {language === 'FR' ? 'Cabines' : 'Cabins'}
            {!selectedBoatName && (
              <span className="text-[8px] font-black uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full scale-90">
                {language === 'FR' ? 'Inactif' : 'Locked'}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Tab Panels content */}
      <AnimatePresence mode="wait">
        {mode === 'CHARTER' || activeSectionTab === 'BOATS' ? (
          <motion.div
            key="boats-panel"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar"
          >
            {filteredBoats.map((boat) => {
              const isUnavailable = unavailableBoatNames?.includes(boat.name);
              return (
                <div
                  key={boat.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedBoatName(boat.name)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedBoatName(boat.name)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group relative overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-primary/20",
                    selectedBoatName === boat.name 
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                      : "border-border bg-card/50 hover:border-primary/50 hover:bg-card",
                    isUnavailable && selectedBoatName !== boat.name && "opacity-40"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    selectedBoatName === boat.name ? "bg-white/20" : "bg-muted group-hover:bg-primary/5"
                  )}>
                    <Anchor className={cn("w-4 h-4", selectedBoatName === boat.name ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-6">
                    <span className={cn(
                      "text-sm font-medium truncate block",
                      isUnavailable && "line-through opacity-70"
                    )}>
                      {boat.name}
                    </span>
                    {isUnavailable && <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">Booked / N.A.</span>}
                  </div>

                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBoatAvailability(boat.name);
                      }}
                      title={isUnavailable ? "Mark as Available" : "Mark as Booked/Full"}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        selectedBoatName === boat.name 
                          ? "hover:bg-white/20" 
                          : (isUnavailable ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted")
                      )}
                    >
                      {isUnavailable ? <CalendarCheck className="w-3.5 h-3.5" /> : <CalendarX className="w-3.5 h-3.5" />}
                    </button>
                    
                    {selectedBoatName === boat.name && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white ml-1" />
                    )}
                  </div>
                </div>
              );
            })}
            {filteredBoats.length === 0 && (
              <div className="col-span-full py-12 text-center space-y-2">
                <p className="text-muted-foreground text-sm italic">No boats matching your search.</p>
                <button onClick={() => setSearch('')} className="text-xs text-primary font-medium hover:underline">Clear search</button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="cabins-panel"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <CabinList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
