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
  // Super Admin Accounts
  {
    id: "user-admin-1",
    name: "Ahmad Fauzi",
    email: "admin@rerasa.com",
    role: "super_admin",
    phone: "082111222333",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    createdAt: "2026-01-15T08:00:00Z"
  },
  {
    id: "user-admin-2",
    name: "Dewi Sartika",
    email: "dewi.ops@rerasa.com",
    role: "super_admin",
    phone: "082111222334",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    createdAt: "2026-01-20T09:30:00Z"
  },
  // Mitra Toko (Sellers)
  {
    id: "user-seller-1",
    name: "Siti Rahmawati (Ruby Bakery)",
    email: "ruby@rerasa.com",
    role: "seller",
    phone: "081987654321",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    storeId: "store-ruby-bakery",
    createdAt: "2026-02-10T10:00:00Z"
  },
  {
    id: "user-seller-2",
    name: "Bambang Pratama (Kopi Nako)",
    email: "nako@rerasa.com",
    role: "seller",
    phone: "081987654322",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    storeId: "store-kopi-nako",
    createdAt: "2026-02-12T11:00:00Z"
  },
  {
    id: "user-seller-3",
    name: "H. Mang Dul (Nasi Jamblang)",
    email: "mangdul@rerasa.com",
    role: "seller",
    phone: "081987654323",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    storeId: "store-jamblang-dul",
    createdAt: "2026-02-15T14:20:00Z"
  },
  {
    id: "user-seller-4",
    name: "H. Apud (Empal Gentong)",
    email: "apud@rerasa.com",
    role: "seller",
    phone: "081987654324",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    storeId: "store-empal-apud",
    createdAt: "2026-02-18T16:00:00Z"
  },
  {
    id: "user-seller-5",
    name: "Kevin Sanjaya (Martabak SF)",
    email: "sanfran@rerasa.com",
    role: "seller",
    phone: "081987654325",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    storeId: "store-martabak-sanfran",
    createdAt: "2026-02-22T13:45:00Z"
  },
  {
    id: "user-seller-6",
    name: "Hendra Gunawan (Dapur Ciremai)",
    email: "ciremai@rerasa.com",
    role: "seller",
    phone: "081987654326",
    status: "SUSPENDED",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    storeId: "store-dapur-ciremai",
    createdAt: "2026-10-27T08:30:00Z"
  },
  // Pelanggan (Buyers)
  {
    id: "user-buyer-1",
    name: "Fauzan Rizqi Noor",
    email: "fauzan@gmail.com",
    role: "buyer",
    phone: "081234567890",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    createdAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "user-buyer-2",
    name: "Budi Santoso",
    email: "budi.cirebon@gmail.com",
    role: "buyer",
    phone: "081234567891",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    createdAt: "2026-03-05T11:30:00Z"
  },
  {
    id: "user-buyer-3",
    name: "Anisa Nurhaliza",
    email: "anisa.crb@gmail.com",
    role: "buyer",
    phone: "081234567892",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    createdAt: "2026-03-08T15:10:00Z"
  },
  {
    id: "user-buyer-4",
    name: "Dimas Anggara",
    email: "dimas.ang@gmail.com",
    role: "buyer",
    phone: "081234567893",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    createdAt: "2026-03-12T09:20:00Z"
  },
  {
    id: "user-buyer-5",
    name: "Rina Kartika",
    email: "rina.ktk@gmail.com",
    role: "buyer",
    phone: "081234567894",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    createdAt: "2026-03-16T14:00:00Z"
  },
  {
    id: "user-buyer-6",
    name: "Eko Prasetyo",
    email: "eko.pras@gmail.com",
    role: "buyer",
    phone: "081234567895",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
    createdAt: "2026-03-20T17:40:00Z"
  },
  {
    id: "user-buyer-7",
    name: "Mega Utami",
    email: "mega.crb@gmail.com",
    role: "buyer",
    phone: "081234567896",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    createdAt: "2026-03-25T12:15:00Z"
  },
  {
    id: "user-buyer-8",
    name: "Reza Pratama",
    email: "reza.prat@gmail.com",
    role: "buyer",
    phone: "081234567897",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    createdAt: "2026-03-28T16:50:00Z"
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
    id: "store-empal-apud",
    name: "Empal Gentong H. Apud",
    category: "Makanan Berat",
    address: "Jl. Ir. H. Juanda No. 24, Battembat",
    area: "Tuparev, Cirebon",
    latitude: -6.7118,
    longitude: 108.5320,
    rating: 4.9,
    reviewCount: 410,
    isOpen: true,
    status: "ACTIVE",
    pickupStartTime: "20:00",
    pickupEndTime: "21:30",
    boxComplianceRate: 96,
    boxesSoldTotal: 195,
    currentBoxStock: 28,
    walletBalance: 960000,
    bankAccount: {
      bankName: "BCA",
      accountNumber: "1340998877",
      accountHolder: "H. Apud Cirebon"
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
    walletBalance: 310000,
    bankAccount: {
      bankName: "BCA",
      accountNumber: "1340112233",
      accountHolder: "PT Surya Cirebon Jaya"
    }
  },
  {
    id: "store-martabak-sanfran",
    name: "Martabak San Francisco Cirebon",
    category: "Bakery & Pastry",
    address: "Jl. Siliwangi No. 112, Kejaksan",
    area: "Kejaksan, Cirebon",
    latitude: -6.7095,
    longitude: 108.5582,
    rating: 4.8,
    reviewCount: 165,
    isOpen: true,
    status: "ACTIVE",
    pickupStartTime: "21:00",
    pickupEndTime: "22:30",
    boxComplianceRate: 93,
    boxesSoldTotal: 130,
    currentBoxStock: 16,
    walletBalance: 520000,
    bankAccount: {
      bankName: "BCA",
      accountNumber: "1340776655",
      accountHolder: "Kevin Sanjaya"
    }
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
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    originalPrice: 42000,
    discountedPrice: 17000,
    quotaToday: 8,
    quotaRemaining: 5,
    isActive: true,
    pickupWindow: "20:30 - 22:00 WIB",
    estimatedWeightKg: 0.9
  },
  {
    id: "bag-empal-1",
    storeId: "store-empal-apud",
    title: "Surprise Meal: Daging Empal Gentong Gurih",
    category: "Makanan Berat",
    description: "Satu porsi empal gentong bumbu rempah kuning khas Cirebon dengan potongan daging empuk dan kuah santan gurih ditambah lontong.",
    imageUrl: "https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=600&auto=format&fit=crop&q=80",
    originalPrice: 45000,
    discountedPrice: 20000,
    quotaToday: 5,
    quotaRemaining: 3,
    isActive: true,
    pickupWindow: "20:00 - 21:30 WIB",
    estimatedWeightKg: 0.8
  },
  {
    id: "bag-surya-1",
    storeId: "store-surya-toserba",
    title: "Surprise Fresh: Buah Segar & Roti Gandum",
    category: "Swalayan & Buah",
    description: "Kombinasi buah potong segar supermarket (melon/semangka) dan 1 pack roti gandum sehat tanggal display terakhir.",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80",
    originalPrice: 38000,
    discountedPrice: 15000,
    quotaToday: 7,
    quotaRemaining: 4,
    isActive: true,
    pickupWindow: "19:00 - 21:00 WIB",
    estimatedWeightKg: 1.1
  },
  {
    id: "bag-martabak-1",
    storeId: "store-martabak-sanfran",
    title: "Surprise Box: Martabak Manis Campur Cokelat Keju",
    category: "Bakery & Pastry",
    description: "Porsi setengah loyang martabak manis adonan tebal mentega wijsman dengan taburan cokelat butir dan keju cheddar gurih.",
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80",
    originalPrice: 55000,
    discountedPrice: 22000,
    quotaToday: 4,
    quotaRemaining: 2,
    isActive: true,
    pickupWindow: "21:00 - 22:30 WIB",
    estimatedWeightKg: 0.6
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
  },
  {
    id: "RB-6100",
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
    status: "COMPLETED",
    paymentMethod: "GoPay",
    paidAt: "2026-10-25T19:00:00Z",
    completedAt: "2026-10-25T20:10:00Z",
    pickupCode: "1092",
    pickupQrData: "RESCUE_ORDER:RB-6100:1092",
    isChatLocked: true
  },
  {
    id: "RB-5219",
    buyerId: "user-buyer-1",
    buyerName: "Budi Santoso",
    buyerPhone: "081234567890",
    storeId: "store-jamblang-dul",
    storeName: "Nasi Jamblang Mang Dul",
    bagId: "bag-jamblang-1",
    bagTitle: "Rescue Box: Paket Lauk Komplit Daun Jati",
    quantity: 1,
    unitPrice: 17000,
    totalPrice: 17000,
    platformFee: 2040,
    sellerEarning: 14960,
    status: "COMPLETED",
    paymentMethod: "QRIS",
    paidAt: "2026-10-26T19:30:00Z",
    completedAt: "2026-10-26T21:05:00Z",
    pickupCode: "6541",
    pickupQrData: "RESCUE_ORDER:RB-5219:6541",
    isChatLocked: true
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
  },
  {
    id: "BOX-ORD-103",
    storeId: "store-empal-apud",
    storeName: "Empal Gentong H. Apud",
    packageId: "box-100",
    quantityPcs: 100,
    totalPrice: 140000,
    shippingAddress: "Jl. Ir. H. Juanda No. 24, Battembat, Cirebon",
    trackingNumber: "SICEPAT-CRB-445566",
    status: "SHIPPED",
    orderedAt: "2026-10-27T16:20:00Z"
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
  },
  {
    id: "rev-2",
    orderId: "RB-5219",
    storeId: "store-jamblang-dul",
    buyerId: "user-buyer-1",
    buyerName: "Budi Santoso",
    rating: 5,
    comment: "Porsi lauk daun jatinya melimpah, ada semur daging dan perkedel. Kotak rescue box nya higienis dan tebal.",
    usedOfficialRescueBox: true,
    createdAt: "2026-10-26T21:15:00Z"
  }
];
