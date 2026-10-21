import React, { useState } from 'react';
import { X, UserPlus, Trash2, Save, Upload, User, Eye, EyeOff, Star, Layers } from 'lucide-react';
import PopupModal from '../PopupModal';
import { DEFAULT_CATEGORIES } from '../../lib/defaultData';

export function AdminModals({
  popupState, setPopupState,
  isCreateSubAdminOpen, setIsCreateSubAdminOpen, handleAddAdmin,
  newAdminName, setNewAdminName,
  newAdminEmail, setNewAdminEmail,
  newAdminPhone, setNewAdminPhone,
  newAdminPassword, setNewAdminPassword,
  currentAdmins = [],
  deletingPath, setDeletingPath, handleDeleteConfirm,
  editingAdminUser, setEditingAdminUser, handleSaveAdminUserEdit,
  editingCategory, setEditingCategory, handleSaveCategoryEdit,
  editingService, setEditingService, handleSaveServiceEdit,
  editingBanner, setEditingBanner, handleSaveBannerEdit,
  editingTestimonial, setEditingTestimonial, handleSaveTestimonialEdit,
  editingFaq, setEditingFaq, handleSaveFaqEdit,
  assigningBooking, setAssigningBooking, assignFilterTab, setAssignFilterTab,
  modalPartners = [], handleAssignPartnerConfirm,
  skillMatchedCount, freePartnersCount, allPartnersList = [], categoriesList = [],
  handleImageFileUpload
}) {
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [showEditPwd, setShowEditPwd] = useState(false);

  // Fallback to DEFAULT_CATEGORIES if categoriesList is empty or loading
  const activeCategoriesList = (categoriesList && categoriesList.length > 0) ? categoriesList : DEFAULT_CATEGORIES;

  // Pre-calculate matched category ID for editing service
  const matchedCategoryId = editingService ? (
    editingService.categoryId ||
    (activeCategoriesList.find(c => (c.name || '').toLowerCase() === (editingService.categoryName || '').toLowerCase())?.id) ||
    ''
  ) : '';

  return (
    <>
      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="Continue"
        onAction={popupState.onAction}
      />

      {/* CREATE SUB-ADMIN MODAL */}
      {isCreateSubAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddAdmin} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 sm:p-8 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setIsCreateSubAdminOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary flex items-center gap-2"><UserPlus className="w-5 h-5" /> Create Sub-Admin Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Max 3 Admins allowed ({currentAdmins.length}/3 registered).</p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Full Name *</label>
                <input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="e.g. Passang Bhutia" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Email Address *</label>
                <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="e.g. subadmin@gmail.com" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Phone Number *</label>
                <input type="text" value={newAdminPhone} onChange={(e) => setNewAdminPhone(e.target.value)} placeholder="e.g. +91 9563213089" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Sub-Admin Password *</label>
                <div className="relative">
                  <input
                    type={showCreatePwd ? "text" : "password"}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter Sub-Admin Password"
                    required
                    className="w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-redPrimary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePwd(!showCreatePwd)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    title={showCreatePwd ? "Hide Password" : "Show Password"}
                  >
                    {showCreatePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={currentAdmins.length >= 3} className={`btn-primary w-full py-3.5 text-xs font-black shadow-lg rounded-xl transition ${currentAdmins.length >= 3 ? 'bg-slate-300 dark:bg-neutral-800 text-slate-500 cursor-not-allowed' : 'bg-redPrimary text-white'}`}>
              Save & Create Sub-Admin
            </button>
          </form>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deletingPath && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-slate-900 dark:text-white shadow-2xl text-center space-y-5 relative">
            <div className="w-14 h-14 rounded-full bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Are you sure you want to delete?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This item will be permanently removed.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPath(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-xs font-extrabold text-slate-700 dark:text-slate-300 transition"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-xs font-extrabold text-white transition shadow-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR SUB-ADMIN USERS */}
      {editingAdminUser && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveAdminUserEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingAdminUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Sub-Admin Account Credentials</h3>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
              <input type="text" value={editingAdminUser.fullName || ''} onChange={(e) => setEditingAdminUser({ ...editingAdminUser, fullName: e.target.value })} placeholder="Full Name" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Email Address</label>
              <input type="email" value={editingAdminUser.email || ''} onChange={(e) => setEditingAdminUser({ ...editingAdminUser, email: e.target.value })} placeholder="Email Address" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Phone Number</label>
              <input type="text" value={editingAdminUser.phoneNumber || ''} onChange={(e) => setEditingAdminUser({ ...editingAdminUser, phoneNumber: e.target.value })} placeholder="Phone Number" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showEditPwd ? "text" : "password"}
                  value={editingAdminUser.password || ''}
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, password: e.target.value })}
                  placeholder="Sub-Admin Password"
                  className="w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPwd(!showEditPwd)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  title={showEditPwd ? "Hide Password" : "Show Password"}
                >
                  {showEditPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Sub-Admin Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR CATEGORIES */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategoryEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingCategory(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Category</h3>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Category Name</label>
              <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} placeholder="Category Name" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Upload New Icon File (&le;200KB) / URL</label>
              <div className="flex flex-col gap-2">
                <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4" /> 📷 Upload New Icon File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, (res) => setEditingCategory({ ...editingCategory, iconUrl: res }))}
                    className="hidden"
                  />
                </label>
                <input type="text" value={editingCategory.iconUrl} onChange={(e) => setEditingCategory({ ...editingCategory, iconUrl: e.target.value })} placeholder="Or paste Icon Image URL" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            {editingCategory.iconUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <img src={editingCategory.iconUrl} className="w-10 h-10 object-contain rounded-lg p-1 bg-white" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">New Icon Selected</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Category Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR SERVICES (PROMINENT CATEGORY CONNECTION DROPDOWN) */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveServiceEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setEditingService(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary flex items-center gap-2">
              <Layers className="w-5 h-5" /> Edit Service Details
            </h3>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Service Title *</label>
              <input type="text" value={editingService.title || ''} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} placeholder="Service Title" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
            </div>

            {/* Category Dropdown Selector inside Edit Service Modal */}
            <div>
              <label className="text-[11px] font-extrabold text-redPrimary block mb-1">Category Connection *</label>
              <select
                value={matchedCategoryId}
                onChange={(e) => {
                  const selectedCat = activeCategoriesList.find(c => c.id === e.target.value || c.name === e.target.value);
                  setEditingService({
                    ...editingService,
                    categoryId: e.target.value,
                    categoryName: selectedCat ? selectedCat.name : editingService.categoryName
                  });
                }}
                className="w-full p-3 rounded-lg border border-redPrimary/40 bg-redPrimary/10 text-xs font-extrabold text-redPrimary outline-none focus:border-redPrimary cursor-pointer"
              >
                <option value="">-- Select Category Connection --</option>
                {activeCategoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Original Price (₹)</label>
                <input type="number" value={editingService.originalPrice || ''} onChange={(e) => setEditingService({ ...editingService, originalPrice: e.target.value })} placeholder="Original Price" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Discount Price (₹)</label>
                <input type="number" value={editingService.discountedPrice || ''} onChange={(e) => setEditingService({ ...editingService, discountedPrice: e.target.value })} placeholder="Discount Price" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            {/* Service Rating Field */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Service Rating Average (★ Max 5.0)</label>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={editingService.ratingAverage || 5.0}
                  onChange={(e) => setEditingService({ ...editingService, ratingAverage: e.target.value })}
                  placeholder="Service Rating (e.g. 5.0)"
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Upload New Service Image File (&le;200KB) / URL</label>
              <div className="flex flex-col gap-2">
                <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4" /> 📷 Upload New Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, (res) => setEditingService({ ...editingService, imageUrl: res }))}
                    className="hidden"
                  />
                </label>
                <input type="text" value={editingService.imageUrl || ''} onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })} placeholder="Or paste Image URL" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            {editingService.imageUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <img src={editingService.imageUrl} className="w-16 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">New Image Selected</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Service Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR BANNERS */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBannerEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingBanner(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Marketing Banner</h3>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Banner Title</label>
              <input type="text" value={editingBanner.title} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} placeholder="Title" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Subtitle</label>
              <input type="text" value={editingBanner.subtitle} onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} placeholder="Subtitle" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Upload New Banner Image File (&le;200KB) / URL</label>
              <div className="flex flex-col gap-2">
                <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4" /> 📷 Upload New Banner Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, (res) => setEditingBanner({ ...editingBanner, imageUrl: res }))}
                    className="hidden"
                  />
                </label>
                <input type="text" value={editingBanner.imageUrl} onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })} placeholder="Or Banner Image URL" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            {editingBanner.imageUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <img src={editingBanner.imageUrl} className="w-20 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">New Banner Image Selected</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Banner Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR TESTIMONIALS */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTestimonialEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingTestimonial(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Customer Experience Review</h3>
            <input type="text" value={editingTestimonial.name} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })} placeholder="Name" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            <input type="text" value={editingTestimonial.location} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })} placeholder="Location" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            <textarea value={editingTestimonial.text} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })} placeholder="Text" rows={3} className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white"></textarea>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Review Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR FAQS */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveFaqEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingFaq(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit FAQ</h3>
            <input type="text" value={editingFaq.q} onChange={(e) => setEditingFaq({ ...editingFaq, q: e.target.value })} placeholder="Question" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            <textarea value={editingFaq.a} onChange={(e) => setEditingFaq({ ...editingFaq, a: e.target.value })} placeholder="Answer" rows={3} className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white"></textarea>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save FAQ Updates</button>
          </form>
        </div>
      )}

      {/* ASSIGN PARTNER MODAL */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-[#3A3A3A] rounded-3xl p-6 sm:p-8 w-full max-w-lg text-slate-900 dark:text-white shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">

            <button onClick={() => setAssigningBooking(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                Assign Partner for {assigningBooking.serviceTitle}
              </h2>
              <p className="text-xs font-bold text-redPrimary mt-1">
                Service Category: {assigningBooking.serviceCategory || 'Services'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-semibold">
                Select a verified partner to dispatch for order ref: <span className="text-slate-900 dark:text-white font-bold">{assigningBooking.bookingRef || assigningBooking.id}</span>
              </p>
            </div>

            {/* 3 Filter Tabs inside Modal */}
            <div className="flex border-b border-slate-200 dark:border-neutral-700 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setAssignFilterTab(0)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 0 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Skill Matched ({skillMatchedCount})
              </button>

              <button
                type="button"
                onClick={() => setAssignFilterTab(1)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 1 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                🟢 Free ({freePartnersCount})
              </button>

              <button
                type="button"
                onClick={() => setAssignFilterTab(2)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 2 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                👥 All Fleet ({allPartnersList.length})
              </button>
            </div>

            {/* Partners List */}
            <div className="space-y-3 pt-1">
              {modalPartners.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-bold">
                  No partners found matching this filter.
                </div>
              ) : (
                modalPartners.map((partner) => {
                  const isSkillMatch = (partner.skillCategory || '').toLowerCase().includes((assigningBooking.serviceCategory || '').toLowerCase()) ||
                    (partner.skillCategory || '').toLowerCase().includes((assigningBooking.serviceTitle || '').toLowerCase());
                  const isFree = partner.isOnline === true || partner.isOnline === 'true';

                  return (
                    <div key={partner.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] flex justify-between items-center shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <User className="w-5 h-5" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-black text-slate-900 dark:text-white">{partner.fullName}</strong>
                            {isSkillMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30">
                                ★ Skill Match
                              </span>
                            )}
                            {isFree && !isSkillMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30">
                                🟢 FREE
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-redPrimary font-bold">
                            Skill: {partner.skillCategory || 'Craftsman Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Phone: {partner.phoneNumber || '+91 9564111224'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAssignPartnerConfirm(assigningBooking.id, partner)}
                        className="btn-primary py-2 px-4 text-xs font-extrabold rounded-full bg-redPrimary hover:bg-redDark text-white shadow-md shrink-0"
                      >
                        Assign
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="text-xs font-bold text-redPrimary hover:underline px-4 py-2"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
