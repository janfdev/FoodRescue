import {
  User,
  Store,
  SurpriseBag,
  RescueBoxPackage,
  Order,
  RescueBoxOrder,
  Review
} from "@/types/domain";

export const SEED_USERS: User[] = [
  {
    id: "user-buyer-1",
    name: "Budi Santoso",
    email: "budi.cirebon@gmail.com",
    role: "buyer",
    phone: "081234567890",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  },
  {
    id: "user-seller-1",
    name: "Siti Rahma",
    email: "owner.ruby@gmail.com",
    role: "seller",
    phone: "081987654321",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    storeId: "store-ruby-bakery"
  },
  {
    id: "user-admin-1",
    name: "Ahmad Fauzi (Operations)",
    email: "admin@sisarasa.id",
    role: "super_admin",
    phone: "082111222333",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
  }
];

export const SEED_STORES: Store[] = [
  {
    id: "store-ruby-bakery",
    name: "Ruby Bakery & Cake",
    category: "Bakery & Pastry",
    address: "Jl. Tuparev No. 88, Kedawung",
    area: "Tuparev, Cirebon",
    latitude: -6.7172,
    longitude: 108.5412,
    rating: 4.8,
    reviewCount: 142,
    isOpen: true,
    status: "ACTIVE",
    pickupStartTime: "19:30",
    pickupEndTime: "21:30",
    boxComplianceRate: 98,
    boxesSoldTotal: 185,
    currentBoxStock: 42,
    walletBalance: 840000,
    bankAccount: {
      bankName: "BCA",
      accountNumber: "1340889211",
      accountHolder: "Siti Rahmawati"
    },
    kycDetails: {
      ktpNumber: "3274012903890002",
      ownerName: "Siti Rahmawati",
      ktpImage: "/mock-ktp.jpg",
      storeFrontImage: "/mock-store.jpg",
      submittedAt: "2026-02-10T10:00:00Z"
    }
  },
  {
    id: "store-kopi-nako",
    name: "Kopi Nako CSB",
    category: "Kafe & Minuman",
    address: "Cirebon Super Block (CSB Mall), Jl. Dr. Cipto No. 26",
    area: "Kesambi, Cirebon",
    latitude: -6.7245,
    longitude: 108.5521,
    rating: 4.7,
    reviewCount: 98,
    isOpen: true,
    status: "ACTIVE",
    pickupStartTime: "20:00",
    pickupEndTime: "21:45",
    boxComplianceRate: 94,
    boxesSoldTotal: 112,
    currentBoxStock: 18,
    walletBalance: 420000,
    bankAccount: {
      bankName: "Mandiri",
      accountNumber: "1180009823412",
      accountHolder: "PT Nako Cirebon Berkah"
    }
  },
  {
    id: "store-jamblang-dul",
    name: "Nasi Jamblang Mang Dul",
    category: "Makanan Berat",
    address: "Jl. Dr. Cipto Mangunkusumo No. 4",
    area: "Pekiringan, Cirebon",
    latitude: -6.7210,
    longitude: 108.5545,
    rating: 4.9,
    reviewCount: 320,
    isOpen: true,
    status: "ACTIVE",
    pickupStartTime: "20:30",
    pickupEndTime: "22:00",
    boxComplianceRate: 91,
    boxesSoldTotal: 240,
    currentBoxStock: 35,
    walletBalance: 1250000,
    bankAccount: {
      bankName: "BRI",
      accountNumber: "010901029384501",
      accountHolder: "Abdul Kadir Mang Dul"
    }
  },
  {
    id: "store-surya-market",
    name: "Surya Toserba Fresh Corner",
    category: "Swalayan & Buah",
    address: "Jl. Karanggetas No. 50, Panjunan",
    area: "Lemahwungkuk, Cirebon",
    latitude: -6.7161,
    longitude: 108.5670,
    rating: 4.6,
    reviewCount: 76,
    isOpen: true,
    status: "ACTIVE",
    pickupStartTime: "19:00",
    pickupEndTime: "20:30",
    boxComplianceRate: 97,
    boxesSoldTotal: 88,
    currentBoxStock: 24,
    walletBalance: 310000
  },
  {
    id: "store-dapur-ciremai",
    name: "Dapur Ciremai Sejahtera (Pendaftar Baru)",
    category: "Makanan Berat",
    address: "Jl. Pemuda No. 15, Sunyaragi",
    area: "Kesambi, Cirebon",
    latitude: -6.7312,
    longitude: 108.5398,
    rating: 5.0,
    reviewCount: 0,
    isOpen: false,
    status: "PENDING_APPROVAL", // for Admin Approval Simulation
    pickupStartTime: "18:30",
    pickupEndTime: "20:30",
    boxComplianceRate: 100,
    boxesSoldTotal: 0,
    currentBoxStock: 0,
    walletBalance: 0,
    kycDetails: {
      ktpNumber: "3274021105930004",
      ownerName: "Hendra Gunawan",
      ktpImage: "/mock-ktp-hendra.jpg",
      storeFrontImage: "/mock-store-ciremai.jpg",
      submittedAt: "2026-10-27T08:30:00Z"
    }
  }
];

export const SEED_SURPRISE_BAGS: SurpriseBag[] = [
  {
    id: "bag-ruby-1",
    storeId: "store-ruby-bakery",
    title: "Surprise Bag: Aneka Roti & Danish Pastry",
    category: "Bakery & Pastry",
    description: "Kombinasi 3-4 macam roti manis, croissant, atau savory pastry premium yang dipanggang hari ini. Masih sangat lembut dan nikmat disantap.",
    originalPrice: 65000,
    discountedPrice: 24000,
    quotaToday: 6,
    quotaRemaining: 4,
    isActive: true,
    pickupWindow: "19:30 - 21:30 WIB",
    estimatedWeightKg: 0.7,
    allergensWarning: "Mengandung gluten, susu, dan telur."
  },
  {
    id: "bag-nako-1",
    storeId: "store-kopi-nako",
    title: "Surprise Bag: Pastry & Croissant Cafe",
    category: "Kafe & Minuman",
    description: "Paket 2 pcs pastry/toast andalan kafe (misal: choco croissant atau cinnamon roll) pendamping santai malam.",
    originalPrice: 50000,
    discountedPrice: 19000,
    quotaToday: 4,
    quotaRemaining: 2,
    isActive: true,
    pickupWindow: "20:00 - 21:45 WIB",
    estimatedWeightKg: 0.5,
    allergensWarning: "Mengandung telur dan gandum."
  },
  {
    id: "bag-jamblang-1",
    storeId: "store-jamblang-dul",
    title: "Rescue Box: Paket Lauk Komplit Daun Jati",
    category: "Makanan Berat",
    description: "Porsi kenyang nasi jamblang hangat dengan variasi 3 lauk lezat (semur daging, paru goreng, perkedel/telur puyuh sambal) siap santap.",
    originalPrice: 42000,
    discountedPrice: 17000,
    quotaToday: 8,
    quotaRemaining: 5,
    isActive: true,
    pickupWindow: "20:30 - 22:00 WIB",
    estimatedWeightKg: 0.9
  },
  {
    id: "bag-surya-1",
    storeId: "store-surya-market",
    title: "Surprise Pack: Buah Segar & Whole Wheat Bread",
    category: "Swalayan & Buah",
    description: "Campuran buah potong segar (melon, semangka, pepaya) higienis ditambah 1 loaf roti gandum yang masih bagus untuk sarapan.",
    originalPrice: 48000,
    discountedPrice: 18000,
    quotaToday: 5,
    quotaRemaining: 3,
    isActive: true,
    pickupWindow: "19:00 - 20:30 WIB",
    estimatedWeightKg: 1.1
  }
];

export const SEED_BOX_PACKAGES: RescueBoxPackage[] = [
  {
    id: "box-50",
    name: "Starter Pack (50 Pcs)",
    quantityPcs: 50,
    price: 75000,
    description: "Ideal untuk kafe kecil atau toko roti pemula. Bahan kraft anti-minyak ramah lingkungan food grade.",
    dimensions: "18 x 18 x 7 cm"
  },
  {
    id: "box-100",
    name: "Reguler Pack (100 Pcs)",
    quantityPcs: 100,
    price: 140000,
    description: "Paket paling populer mitra aktif. Menghemat Rp 10.000 dibanding paket starter.",
    dimensions: "20 x 20 x 8 cm"
  },
  {
    id: "box-200",
    name: "Bisnis Jumbo (200 Pcs)",
    quantityPcs: 200,
    price: 260000,
    description: "Stok maksimal untuk resto & swalayan dengan perputaran surplus harian tinggi. Hemat Rp 40.000.",
    dimensions: "22 x 22 x 9 cm"
  }
];

export const SEED_ORDERS: Order[] = [
  {
    id: "RB-7821",
    buyerId: "user-buyer-1",
    buyerName: "Budi Santoso",
    buyerPhone: "081234567890",
    storeId: "store-ruby-bakery",
    storeName: "Ruby Bakery & Cake",
    bagId: "bag-ruby-1",
    bagTitle: "Surprise Bag: Aneka Roti & Danish Pastry",
    quantity: 1,
    unitPrice: 24000,
    totalPrice: 24000,
    platformFee: 2880,
    sellerEarning: 21120,
    status: "PAID",
    paymentMethod: "QRIS",
    paidAt: "2026-10-28T18:40:00Z",
    pickupCode: "4829",
    pickupQrData: "RESCUE_ORDER:RB-7821:4829",
    isChatLocked: false
  }
];

export const SEED_BOX_ORDERS: RescueBoxOrder[] = [
  {
    id: "BOX-ORD-101",
    storeId: "store-ruby-bakery",
    storeName: "Ruby Bakery & Cake",
    packageId: "box-100",
    quantityPcs: 100,
    totalPrice: 140000,
    shippingAddress: "Jl. Tuparev No. 88, Cirebon",
    trackingNumber: "JNE-CRB-998822",
    status: "DELIVERED",
    orderedAt: "2026-10-20T11:00:00Z"
  },
  {
    id: "BOX-ORD-102",
    storeId: "store-kopi-nako",
    storeName: "Kopi Nako CSB",
    packageId: "box-50",
    quantityPcs: 50,
    totalPrice: 75000,
    shippingAddress: "CSB Mall Lt. 1, Jl. Dr. Cipto No. 26",
    trackingNumber: "SICEPAT-CRB-112233",
    status: "SHIPPED",
    orderedAt: "2026-10-26T14:15:00Z"
  }
];

export const SEED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    orderId: "RB-6100",
    storeId: "store-ruby-bakery",
    buyerId: "user-buyer-1",
    buyerName: "Budi Santoso",
    rating: 5,
    comment: "Rotinya masih empuk banget dan wangi! Dapat 4 macam roti yang biasanya seharga 60 ribuan. Mantap SisaRasa!",
    usedOfficialRescueBox: true,
    createdAt: "2026-10-25T20:15:00Z"
  }
];
