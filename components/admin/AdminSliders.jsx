import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Users, UserPlus, Upload } from 'lucide-react';

export function AdminSliders({
  activeTab,
  // Lists
  usersList = [],
  categoriesList = [],
  servicesList = [],
  bannersList = [],
  testimonialsList = [],
  faqsList = [],
  currentAdmins = [],
  // Slider Indices
  userSliderIdx, setUserSliderIdx,
  catSliderIdx, setCatSliderIdx,
  srvSliderIdx, setSrvSliderIdx,
  bnrSliderIdx, setBnrSliderIdx,
  testSliderIdx, setTestSliderIdx,
  faqSliderIdx, setFaqSliderIdx,
  // Modal Triggers & Handlers
  setIsCreateSubAdminOpen,
  setEditingAdminUser,
  setDeletingPath,
  setEditingCategory,
  setEditingService,
  setEditingBanner,
  setEditingTestimonial,
  setEditingFaq,
  // Creation Handlers & Forms
  handleAddCategory, newCatName, setNewCatName, newCatIcon, setNewCatIcon,
  handleAddService, newSrvTitle, setNewSrvTitle, newSrvCatId, setNewSrvCatId, newSrvPrice, setNewSrvPrice, newSrvDiscount, setNewSrvDiscount, newSrvImage, setNewSrvImage,
  handleAddBanner, newBnrTitle, setNewBnrTitle, newBnrSub, setNewBnrSub, newBnrImg, setNewBnrImg,
  handleAddTestimonial, newTestName, setNewTestName, newTestLoc, setNewTestLoc, newTestText, setNewTestText,
  handleAddFaq, newFaqQ, setNewFaqQ, newFaqA, setNewFaqA,
  handleImageFileUpload
}) {
  // Clamped Indices
  const safeUserIdx = userSliderIdx % (usersList.length || 1);
  const currentUserObj = usersList[safeUserIdx] || usersList[0];

  const safeCatIdx = catSliderIdx % (categoriesList.length || 1);
  const currentCatObj = categoriesList[safeCatIdx] || categoriesList[0];

  const safeSrvIdx = srvSliderIdx % (servicesList.length || 1);
  const currentSrvObj = servicesList[safeSrvIdx] || servicesList[0];

  const safeBnrIdx = bnrSliderIdx % (bannersList.length || 1);
  const currentBnrObj = bannersList[safeBnrIdx] || bannersList[0];

  const safeTestIdx = testSliderIdx % (testimonialsList.length || 1);
  const currentTestObj = testimonialsList[safeTestIdx] || testimonialsList[0];

  const safeFaqIdx = faqSliderIdx % (faqsList.length || 1);
  const currentFaqObj = faqsList[safeFaqIdx] || faqsList[0];

  return (
    <div className="space-y-6">
      {/* TAB 4: REGISTERED USERS SLIDER */}
      {activeTab === 4 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary">
              <Users className="w-5 h-5" /> Registered User Accounts ({usersList.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsCreateSubAdminOpen(true)}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2 px-4 shadow-md font-black"
            >
              <UserPlus className="w-4 h-4 inline mr-1" /> + Create Sub-Admin Account ({currentAdmins.length}/3)
            </button>
          </div>

          {usersList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No registered users found.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  User Account <span className="text-redPrimary font-black">{safeUserIdx + 1}</span> of {usersList.length}
                </span>
                {usersList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setUserSliderIdx((prev) => (prev - 1 + usersList.length) % usersList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{safeUserIdx + 1} / {usersList.length}</span>
                    <button type="button" onClick={() => setUserSliderIdx((prev) => (prev + 1) % usersList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {currentUserObj && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentUserObj.id || safeUserIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs shadow-xl max-w-lg mx-auto gap-4 w-full"
                  >
                    <div>
                      <strong className="text-base block text-slate-900 dark:text-white font-extrabold">{currentUserObj.fullName || 'User'}</strong>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentUserObj.email || 'N/A'} • {currentUserObj.phoneNumber || 'N/A'}</p>
                    </div>

                    <div className="flex gap-2 items-center w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${(currentUserObj.role || '').toUpperCase() === 'ADMIN' ? 'bg-redPrimary/20 text-redPrimary border border-redPrimary/30' : (currentUserObj.role || '').toUpperCase().includes('PARTNER') ? 'bg-orangeSecondary/20 text-orangeSecondary' : 'bg-emerald-600/20 text-emerald-600'}`}>
                        {currentUserObj.role || 'CUSTOMER'}
                      </span>

                      {(currentUserObj.role || '').toUpperCase() === 'ADMIN' && (
                        <button type="button" onClick={() => setEditingAdminUser({ ...currentUserObj })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold">Edit</button>
                      )}

                      <button onClick={() => setDeletingPath(`users/${currentUserObj.id}`)} className="bg-rose-800 text-white text-xs px-3 py-1.5 rounded-xl font-bold">Delete</button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {usersList.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {usersList.map((_, i) => (
                    <button key={i} type="button" onClick={() => setUserSliderIdx(i)} className={`h-2 rounded-full transition-all ${safeUserIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CATEGORIES SLIDER */}
      {activeTab === 5 && (
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
            <h3 className="font-extrabold text-base text-redPrimary">Add New Category</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category Name (e.g. Mason)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">Category Icon (Upload File &le;200KB or Paste URL)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition shrink-0">
                    <Upload className="w-4 h-4" /> 📷 Upload Icon File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setNewCatIcon)}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="Or paste Icon Image URL"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white flex-1 outline-none focus:border-redPrimary"
                  />
                </div>
              </div>
            </div>

            {newCatIcon && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <img src={newCatIcon} className="w-12 h-12 object-contain rounded-lg bg-white p-1" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Icon Selected & Previewed</span>
              </div>
            )}

            <button type="submit" className="btn-primary py-3.5 px-6 font-extrabold text-xs"><Plus className="w-4 h-4 inline mr-1" /> Save Category</button>
          </form>

          {categoriesList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No categories found.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Category <span className="text-redPrimary font-black">{safeCatIdx + 1}</span> of {categoriesList.length}
                </span>
                {categoriesList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCatSliderIdx((prev) => (prev - 1 + categoriesList.length) % categoriesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{safeCatIdx + 1} / {categoriesList.length}</span>
                    <button type="button" onClick={() => setCatSliderIdx((prev) => (prev + 1) % categoriesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {currentCatObj && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCatObj.id || safeCatIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="web-card text-center p-6 sm:p-8 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl flex flex-col items-center gap-4 relative max-w-md mx-auto w-full"
                  >
                    <img src={currentCatObj.iconUrl || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'} alt="" className="w-16 h-16 object-contain" />
                    <strong className="text-lg block text-slate-900 dark:text-white font-extrabold">{currentCatObj.name}</strong>

                    <div className="flex gap-2 justify-center pt-2 w-full">
                      <button onClick={() => setEditingCategory({ ...currentCatObj })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                      <button onClick={() => setDeletingPath(`categories/${currentCatObj.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {categoriesList.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {categoriesList.map((_, i) => (
                    <button key={i} type="button" onClick={() => setCatSliderIdx(i)} className={`h-2 rounded-full transition-all ${safeCatIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SERVICES SLIDER */}
      {activeTab === 6 && (
        <div className="space-y-6">
          <form onSubmit={handleAddService} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
            <h3 className="font-extrabold text-base text-redPrimary">Add New Service (Connected to Category)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={newSrvTitle} onChange={(e) => setNewSrvTitle(e.target.value)} placeholder="Service Title (e.g. Pipe Leak Repair)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

              <select value={newSrvCatId} onChange={(e) => setNewSrvCatId(e.target.value)} className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary">
                {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <input type="number" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} placeholder="Original Price (₹)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              <input type="number" value={newSrvDiscount} onChange={(e) => setNewSrvDiscount(e.target.value)} placeholder="Discount Price (₹)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">Service Image (Upload File &le;200KB or Paste Image URL)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition shrink-0">
                    <Upload className="w-4 h-4" /> 📷 Upload Service Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setNewSrvImage)}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={newSrvImage}
                    onChange={(e) => setNewSrvImage(e.target.value)}
                    placeholder="Or paste Service Icon Image URL"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white flex-1 outline-none focus:border-redPrimary"
                  />
                </div>
              </div>
            </div>

            {newSrvImage && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <img src={newSrvImage} className="w-16 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Service Image Selected & Previewed</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3.5 font-extrabold text-xs"><Plus className="w-4 h-4 inline mr-1" /> Create & Link Service to Category</button>
          </form>

          {servicesList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No services found.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Service <span className="text-redPrimary font-black">{safeSrvIdx + 1}</span> of {servicesList.length}
                </span>
                {servicesList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setSrvSliderIdx((prev) => (prev - 1 + servicesList.length) % servicesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{safeSrvIdx + 1} / {servicesList.length}</span>
                    <button type="button" onClick={() => setSrvSliderIdx((prev) => (prev + 1) % servicesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {currentSrvObj && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSrvObj.id || safeSrvIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative max-w-md mx-auto w-full"
                  >
                    <div>
                      {/* 100% Full Square Artwork Container with object-contain */}
                      <div className="w-full aspect-square rounded-xl mb-3 overflow-hidden bg-slate-100 dark:bg-neutral-800/80 flex items-center justify-center p-1.5 border border-slate-200 dark:border-neutral-700/60 shadow-inner">
                        <img src={currentSrvObj.imageUrl || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'} alt="" className="w-full h-full object-contain rounded-lg" />
                      </div>
                      <span className="text-[10px] font-bold text-redPrimary uppercase">{currentSrvObj.categoryName || 'General'}</span>
                      <h4 className="font-bold text-base mt-0.5 text-slate-900 dark:text-white">{currentSrvObj.title}</h4>
                      <p className="text-lg font-black text-redPrimary mt-1">₹{currentSrvObj.discountedPrice || currentSrvObj.originalPrice}</p>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800">
                      <button onClick={() => setEditingService({ ...currentSrvObj })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                      <button onClick={() => setDeletingPath(`services/${currentSrvObj.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {servicesList.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {servicesList.map((_, i) => (
                    <button key={i} type="button" onClick={() => setSrvSliderIdx(i)} className={`h-2 rounded-full transition-all ${safeSrvIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: BANNERS SLIDER */}
      {activeTab === 7 && (
        <div className="space-y-6">
          <form onSubmit={handleAddBanner} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
            <h3 className="font-extrabold text-base text-redPrimary">Add New Marketing Banner</h3>

            <div className="space-y-3">
              <input type="text" value={newBnrTitle} onChange={(e) => setNewBnrTitle(e.target.value)} placeholder="Headline Title" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              <input type="text" value={newBnrSub} onChange={(e) => setNewBnrSub(e.target.value)} placeholder="Subtitle" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">Banner Image (Upload File &le;200KB or Paste URL)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition shrink-0">
                    <Upload className="w-4 h-4" /> 📷 Upload Banner Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setNewBnrImg)}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={newBnrImg}
                    onChange={(e) => setNewBnrImg(e.target.value)}
                    placeholder="Or paste Banner Image URL"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white flex-1 outline-none focus:border-redPrimary"
                  />
                </div>
              </div>
            </div>

            {newBnrImg && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <img src={newBnrImg} className="w-20 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Banner Image Selected & Previewed</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold"><Plus className="w-4 h-4 inline mr-1" /> Save Marketing Banner</button>
          </form>

          {bannersList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No banners found.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Banner <span className="text-redPrimary font-black">{safeBnrIdx + 1}</span> of {bannersList.length}
                </span>
                {bannersList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setBnrSliderIdx((prev) => (prev - 1 + bannersList.length) % bannersList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{safeBnrIdx + 1} / {bannersList.length}</span>
                    <button type="button" onClick={() => setBnrSliderIdx((prev) => (prev + 1) % bannersList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {currentBnrObj && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBnrObj.id || safeBnrIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl flex flex-col gap-4 shadow-2xl relative max-w-lg mx-auto w-full"
                  >
                    <img src={currentBnrObj.imageUrl} className="w-full h-40 sm:h-48 object-cover rounded-xl" alt="" />
                    <div>
                      <strong className="block text-base sm:text-lg font-bold text-slate-900 dark:text-white">{currentBnrObj.title}</strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{currentBnrObj.subtitle}</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <button onClick={() => setEditingBanner({ ...currentBnrObj })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                      <button onClick={() => setDeletingPath(`banners/${currentBnrObj.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {bannersList.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {bannersList.map((_, i) => (
                    <button key={i} type="button" onClick={() => setBnrSliderIdx(i)} className={`h-2 rounded-full transition-all ${safeBnrIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: CUSTOMER EXPERIENCE SLIDER */}
      {activeTab === 9 && (
        <div className="space-y-6">
          <form onSubmit={handleAddTestimonial} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl">
            <h3 className="font-extrabold text-base text-redPrimary">Add Customer Experience Review</h3>
            <div className="space-y-3">
              <input type="text" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} placeholder="Customer Name (e.g. Mohor Ghosh)" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              <input type="text" value={newTestLoc} onChange={(e) => setNewTestLoc(e.target.value)} placeholder="Location (e.g. Upper Syari, Gangtok)" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              <textarea value={newTestText} onChange={(e) => setNewTestText(e.target.value)} placeholder="Review Content..." rows={3} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary"></textarea>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold"><Plus className="w-4 h-4 inline mr-1" /> Save Customer Review</button>
          </form>

          {testimonialsList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No customer reviews found.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Review <span className="text-redPrimary font-black">{safeTestIdx + 1}</span> of {testimonialsList.length}
                </span>
                {testimonialsList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTestSliderIdx((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{safeTestIdx + 1} / {testimonialsList.length}</span>
                    <button type="button" onClick={() => setTestSliderIdx((prev) => (prev + 1) % testimonialsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {currentTestObj && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestObj.id || safeTestIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl space-y-3 shadow-2xl relative max-w-lg mx-auto w-full"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-neutral-800 pb-2">
                      <strong className="block text-base font-bold text-slate-900 dark:text-white">{currentTestObj.name}</strong>
                      <span className="text-xs text-slate-400">({currentTestObj.location})</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{currentTestObj.text}"</p>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <button onClick={() => setEditingTestimonial({ ...currentTestObj })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                      <button onClick={() => setDeletingPath(`testimonials/${currentTestObj.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {testimonialsList.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {testimonialsList.map((_, i) => (
                    <button key={i} type="button" onClick={() => setTestSliderIdx(i)} className={`h-2 rounded-full transition-all ${safeTestIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 10: FAQS SLIDER */}
      {activeTab === 10 && (
        <div className="space-y-6">
          <form onSubmit={handleAddFaq} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl">
            <h3 className="font-extrabold text-base text-redPrimary">Add Frequently Asked Question</h3>
            <div className="space-y-3">
              <input type="text" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder="Question" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              <textarea value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder="Answer" rows={3} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary"></textarea>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold"><Plus className="w-4 h-4 inline mr-1" /> Save FAQ</button>
          </form>

          {faqsList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No FAQs found.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  FAQ <span className="text-redPrimary font-black">{safeFaqIdx + 1}</span> of {faqsList.length}
                </span>
                {faqsList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setFaqSliderIdx((prev) => (prev - 1 + faqsList.length) % faqsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{safeFaqIdx + 1} / {faqsList.length}</span>
                    <button type="button" onClick={() => setFaqSliderIdx((prev) => (prev + 1) % faqsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {currentFaqObj && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFaqObj.id || safeFaqIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl space-y-3 shadow-2xl relative max-w-lg mx-auto w-full"
                  >
                    <strong className="block text-base font-bold text-redPrimary">Q: {currentFaqObj.q}</strong>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">A: {currentFaqObj.a}</p>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <button onClick={() => setEditingFaq({ ...currentFaqObj })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                      <button onClick={() => setDeletingPath(`faqs/${currentFaqObj.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {faqsList.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {faqsList.map((_, i) => (
                    <button key={i} type="button" onClick={() => setFaqSliderIdx(i)} className={`h-2 rounded-full transition-all ${safeFaqIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
