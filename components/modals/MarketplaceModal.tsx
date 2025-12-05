
import React, { useState } from 'react';
import { User, StoreItem } from '../types';
import { X, Zap, Shirt, Sparkles, Smile, ShoppingBag, Check, Gift } from 'lucide-react';
import { STORE_CATALOG, purchaseItem, equipItem, unequipItem } from '../services/backend';
import BrutalistButton from './ui/BrutalistButton';
import Mascot from './ui/Mascot';

interface Props {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
}

const MarketplaceModal: React.FC<Props> = ({ user, onClose, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'skin' | 'accessory' | 'effect'>('skin');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredItems = STORE_CATALOG.filter(item => item.type === activeTab);
  const rewardsItems = STORE_CATALOG.filter(item => item.type === 'gift_card');

  const isOwned = (itemId: string) => user.inventory.includes(itemId);
  const isEquipped = (itemId: string) => {
    if (activeTab === 'skin') return user.equipped.skin === itemId;
    if (activeTab === 'accessory') return user.equipped.accessory === itemId;
    if (activeTab === 'effect') return user.equipped.effect === itemId;
    return false;
  };

  const handleAction = async (item: StoreItem) => {
    if (!item) return;
    setIsProcessing(true);

    if (item.type === 'gift_card') {
        // Gift cards are just purchased (Redeemed)
        const res = await purchaseItem(user.id, item.id);
        if (res.success && res.user) {
            onUpdateUser(res.user);
            alert("Reward sent to your email!");
        } else {
            alert(res.message);
        }
    } else if (isOwned(item.id)) {
      // Toggle Equip
      if (isEquipped(item.id) && activeTab !== 'skin') {
         // Unequip (Skins cannot be unequipped, only swapped)
         const res = await unequipItem(user.id, activeTab as 'accessory' | 'effect');
         if (res.success && res.user) onUpdateUser(res.user);
      } else {
         // Equip
         const res = await equipItem(user.id, item.id);
         if (res.success && res.user) onUpdateUser(res.user);
      }
    } else {
      // Purchase
      const res = await purchaseItem(user.id, item.id);
      if (res.success && res.user) onUpdateUser(res.user);
      else alert(res.message);
    }
    
    setIsProcessing(false);
  };

  const getRarityColor = (rarity: string) => {
      switch(rarity) {
          case 'legendary': return 'border-yellow-400 bg-yellow-400/10 text-yellow-600';
          case 'epic': return 'border-purple-400 bg-purple-400/10 text-purple-600';
          case 'rare': return 'border-blue-400 bg-blue-400/10 text-blue-600';
          default: return 'border-gray-200 bg-gray-50 text-gray-500';
      }
  };

  // Preview Logic: Create a temporary user object to show how it looks
  const previewUser = selectedItem && selectedItem.type !== 'gift_card' ? {
      ...user,
      equipped: {
          ...user.equipped,
          [activeTab]: selectedItem.id
      }
  } : user;

  const handleActionClick = () => {
      if(selectedItem) handleAction(selectedItem);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md">
      <div className="w-full h-full sm:max-w-md sm:h-[90vh] bg-[#f2f2f7] sm:rounded-[40px] flex flex-col overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md z-10 p-6 flex items-center justify-between border-b border-gray-200 sticky top-0">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">THE DROP</h2>
                <div className="flex items-center gap-1 text-sm font-bold text-gray-500">
                    <Zap size={14} className="fill-acid-green text-acid-green" />
                    {user.coins.toLocaleString()}
                </div>
            </div>
            <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200">
                <X size={24} />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-32">
            
            {/* Mascot Preview Stage */}
            <div className="h-64 flex items-center justify-center bg-gradient-to-b from-white to-[#f2f2f7] relative">
                <div className="scale-150 transform transition-all duration-500">
                     <Mascot userStats={previewUser.stats} equipped={previewUser.equipped} />
                </div>
                {/* Floor Reflection */}
                <div className="absolute bottom-10 w-32 h-4 bg-black/10 blur-xl rounded-[100%]"></div>
            </div>

            {/* REWARDS BANNER (Hero Carousel) */}
            <div className="mb-8 pl-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rewards</span>
                    <div className="h-px bg-gray-200 flex-1 mr-6"></div>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 pr-6 no-scrollbar snap-x">
                    {rewardsItems.map(item => (
                        <div 
                            key={item.id}
                            className="snap-center shrink-0 w-64 h-32 rounded-2xl relative overflow-hidden shadow-lg border border-white/20 group cursor-pointer"
                            onClick={() => { setSelectedItem(item); }} // Select for purchasing
                        >
                             {/* Card Background */}
                             <div className={`absolute inset-0 bg-gradient-to-br ${item.id.includes('starbucks') ? 'from-green-700 to-green-900' : item.id.includes('amazon') ? 'from-orange-400 to-yellow-600' : item.id.includes('nike') ? 'from-gray-800 to-black' : item.id.includes('apple') ? 'from-gray-300 to-gray-500' : 'from-red-600 to-red-800'}`}></div>
                             <div className="absolute inset-0 bg-black/10"></div>
                             
                             {/* Content */}
                             <div className="absolute inset-0 p-4 flex flex-col justify-between text-white z-10">
                                 <div className="flex justify-between items-start">
                                     <span className="text-2xl">{item.icon}</span>
                                     <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-white/20">
                                         <Zap size={10} className="fill-acid-green text-acid-green" /> {item.price}
                                     </div>
                                 </div>
                                 <div>
                                     <div className="font-bold text-lg leading-tight">{item.name}</div>
                                     <div className="text-[10px] opacity-80">{item.description}</div>
                                 </div>
                             </div>

                             {/* Purchase Overlay (Active on Selection) */}
                             {selectedItem?.id === item.id && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleAction(item); }}
                                        className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase hover:scale-105 active:scale-95 transition-transform shadow-lg"
                                    >
                                        Redeem Now
                                    </button>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'skin', label: 'Skins', icon: '🎭' },
                    { id: 'accessory', label: 'Gear', icon: '🧢' },
                    { id: 'effect', label: 'FX', icon: '✨' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setSelectedItem(null); }}
                        className={`
                            px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-all whitespace-nowrap
                            ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}
                        `}
                    >
                        <span className="text-sm">{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 px-6">
                {filteredItems.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`
                            bg-white rounded-3xl p-4 border-2 transition-all relative overflow-hidden group cursor-pointer
                            ${selectedItem?.id === item.id ? 'border-black shadow-lg scale-[1.02]' : 'border-transparent shadow-sm hover:shadow-md'}
                        `}
                    >
                        <div className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                        </div>

                        <div className="text-4xl mb-3 mt-4 text-center group-hover:scale-110 transition-transform">{item.icon}</div>
                        
                        <div className="text-center">
                            <h4 className="font-bold text-sm text-gray-900 leading-tight">{item.name}</h4>
                            {isOwned(item.id) ? (
                                <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                    <Check size={12} /> Owned
                                </div>
                            ) : (
                                <div className="mt-2 text-xs font-bold text-acid-green uppercase tracking-wider bg-black/90 rounded-full px-2 py-1 inline-block">
                                    {item.price}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Floating Action Bar (Only for Items, Gifts handled inline) */}
        {selectedItem && selectedItem.type !== 'gift_card' && (
            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 p-6 pb-safe z-20 animate-in slide-in-from-bottom-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">{selectedItem.name}</h3>
                        <p className="text-xs text-gray-500 font-medium">{selectedItem.description}</p>
                    </div>
                    {(!isOwned(selectedItem.id)) && (
                        <div className="text-right">
                             <div className="text-xs text-gray-400 uppercase font-bold">Price</div>
                             <div className="text-xl font-black text-gray-900 flex items-center gap-1">
                                 {selectedItem.price} <Zap size={18} className="fill-acid-green text-acid-green" />
                             </div>
                        </div>
                    )}
                </div>

                <BrutalistButton 
                    disabled={isProcessing || (!isOwned(selectedItem.id) && user.coins < selectedItem.price)}
                    onClick={handleActionClick}
                    className={`w-full ${isOwned(selectedItem.id) ? 'bg-gray-900' : 'bg-acid-green text-black'}`}
                    label={isProcessing ? 'Processing...' : (
                        isOwned(selectedItem.id) 
                            ? (isEquipped(selectedItem.id) ? 'Equipped' : 'Equip Now') 
                            : 'Purchase'
                    )}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceModal;
