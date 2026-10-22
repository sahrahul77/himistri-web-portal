export const DEFAULT_CATEGORIES = [
  { id: 'cat_catering', name: 'Catering Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1830/1830839.png' },
  { id: 'cat_delivery', name: 'Delivery Boy Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830312.png' },
  { id: 'cat_education', name: 'Education Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png' },
  { id: 'cat_electronics', name: 'Electronics Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2933/2933820.png' },
  { id: 'cat_event', name: 'Event Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3200/3200789.png' },
  { id: 'cat_contractor', name: 'General Contactor Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2682/2682065.png' },
  { id: 'cat_household', name: 'Household Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3079/3079165.png' },
  { id: 'cat_retail', name: 'Retail Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  { id: 'cat_services', name: 'Services Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2933/2933921.png' },
  { id: 'cat_software', name: 'Software Manpower', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png' }
];

export const DEFAULT_SERVICES = [
  { id: 'srv_doorlock', categoryId: 'cat_household', categoryName: 'Household Manpower', title: 'Door Lock & Hinge Repair', discountedPrice: 200, originalPrice: 300, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/CARPENTER.png', shortDescription: 'Door lock, wooden furniture & cabinet repair at doorstep' },
  { id: 'srv_ac_fan', categoryId: 'cat_electronics', categoryName: 'Electronics Manpower', title: 'AC/Fan Repairer', discountedPrice: 600, originalPrice: 700, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/ELECTRICIAN.png', shortDescription: 'Experienced technician for AC and Fan repair at doorstep' },
  { id: 'srv_camera', categoryId: 'cat_electronics', categoryName: 'Electronics Manpower', title: 'CCTV Camera Installation & DVR Fix', discountedPrice: 800, originalPrice: 1000, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/CCTV-INSTALLER.png', shortDescription: 'HD security camera setup, DVR configuration & wiring' },
  { id: 'srv_wiring', categoryId: 'cat_services', categoryName: 'Services Manpower', title: 'Full House Wiring & Switchboard Repair', discountedPrice: 600, originalPrice: 800, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/ELECTRICIAN.png', shortDescription: 'Full house electrical wiring, switchboard & MCB repair' },
  { id: 'srv_accountant', categoryId: 'cat_software', categoryName: 'Software Manpower', title: 'Accountant', discountedPrice: 17000, originalPrice: 25000, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/HOME-TUTOR.png', shortDescription: 'Qualified and experienced accountant for transparent data and accurate results' },
  { id: 'srv_mobile_app', categoryId: 'cat_software', categoryName: 'Software Manpower', title: 'Mobile Application Developer', discountedPrice: 21000, originalPrice: 25000, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/RIDER.png', shortDescription: 'Custom mobile app development solutions right from scratch to deployment' },
  { id: 'srv_plumber', categoryId: 'cat_services', categoryName: 'Services Manpower', title: 'Plumber Leak Fix & Fitting', discountedPrice: 900, originalPrice: 1000, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png', shortDescription: 'Reliable plumbing for drain clogging & leaks' },
  { id: 'srv_cleaner', categoryId: 'cat_household', categoryName: 'Household Manpower', title: 'Full Home & Sofa Deep Cleaning', discountedPrice: 2000, originalPrice: 2500, ratingAverage: 5.0, ratingCount: 1, imageUrl: 'https://himistri.techcoders.in/wp-content/uploads/2022/10/CLEANER.png', shortDescription: 'Deep cleaning for kitchen, bathroom & sofa' }
];

export const DEFAULT_BANNERS = [
  { id: 'b1', title: 'LOOKING FOR A RELIABLE SERVICE?', subtitle: 'Doorstep Plumbing, Electrical, Cleaning & Salon across Gangtok.', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=2400&q=100' },
  { id: 'b2', title: 'VERIFIED TECHNICAL MANPOWER IN SIKKIM', subtitle: 'Background checked mistris & skilled manpower at affordable prices.', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2400&q=100' }
];

export const DEFAULT_COUPONS = [
  { id: 'c1', code: 'SIKKIM10', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 200, isActive: true, description: '10% OFF on all doorstep bookings in Sikkim' },
  { id: 'c2', code: 'FESTIVE100', discountType: 'FLAT', discountValue: 100, minOrderAmount: 500, isActive: true, description: 'Flat ₹100 OFF on orders above ₹500' },
  { id: 'c3', code: 'WELCOME50', discountType: 'FLAT', discountValue: 50, minOrderAmount: 300, isActive: true, description: 'Flat ₹50 OFF for new customers' }
];

export const FALLBACK_ICON = 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png';
