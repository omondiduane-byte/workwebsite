import React, { useState, useMemo, useEffect, } from 'react';
import { supabase } from './supabase/supabaseClient';
import { 
  Search, Smartphone, ArrowRight, 
  HelpCircle, ShoppingCart, 
  Layers, Shield, X, AlertCircle,
  Lock, Plus, Minus, Trash2, CheckCircle2, Sparkles,
  LogOut, Users, Flame, ShieldAlert
} from 'lucide-react';
// Example usage in a component
// import { inquiryService } from './services/inquiryService'; // unused - commented out to fix lint error

// Utility functions defined locally to avoid missing module import errors
const generateUniqueId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
};
const generateSecureOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// Functions outside the React lifecycle prevent linter compilation crashes

/* STRICT TYPESCRIPT INTERFACES */
interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  storeName: string;
  image?: string;
  isFeatured?: boolean; // Vendor Advertisement Banner
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  subType: string;
  rating: number;
  deliveryTime: string;
  minOrder: number;
  badge: string;
  image: string;
  approved: boolean; // Auto-add to category when approved
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface Inquiry {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  topic: string;
  message: string;
  timestamp: string;
  status: 'Pending' | 'Answered';
  adminResponse?: string;
}

interface Notification {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  read: boolean;
  type: 'support' | 'system' | 'message';
}

interface VendorApprovalRequest {
  id: string;
  shopName: string;
  category: string;
  phone: string;
  status: 'Pending' | 'Approved' | 'Declined';
  timestamp: string;
  loginEmail?: string;
}

interface DeliveryApprovalRequest {
  id: string;
  riderName: string;
  motorcyclePlate: string;
  phone: string;
  status: 'Pending' | 'Approved' | 'Declined';
  timestamp: string;
  loginEmail?: string;
}

interface DeliveryJob {
  id: string;
  orderId: string;
  destination: string;
  fee: number;
  status: 'Available' | 'Assigned' | 'Picked Up' | 'Delivered';
  riderName?: string;
  customerPhone: string;
  merchantName: string;
  itemsSummary: string;
  otp: string; // Anti-Liar Payment Handshake System
  bodaPoolActive?: boolean;
}

interface EscrowTransaction {
  id: string;
  orderId: string;
  amount: number;
  payer: string;
  vendorName: string;
  status: 'Holding' | 'Released' | 'Refunded';
  timestamp: string; // For audit trail and dispute resolution for Payments
}

interface ChamaDeal {
  id: string;
  title: string;
  merchant: string;
  category: string;
  totalPrice: number;
  portionPrice: number;
  targetPortions: number;
  filledPortions: number;
  backers: string[]; // for users that have pledged to the group buy-in deal
}

interface GasPrediction {
  userId: string;
  gasSize: string;
  householdSize: number;
  daysRemaining: number;
  lastRefillDate: string; // for tracking and prediction of the next refill date based on usage patterns
}

interface AuthUser {
  id: string;
  email?: string;
  username: string;
  phone: string;
  role: 'customer' | 'vendor' | 'rider' | 'admin';
  linkedEntityName?: string; // Links custom uploaded items
  profilePhotoUrl?: string;
  address?: string;
  deliveryPoint?: string;
  bio?: string;
  pickupNote?: string;
}

const BASELINE_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Yusuf Dishes (Rongai Stage)',
    category: 'Food & Beverages',
    subType: 'Swahili Pilau & Biryani Specialists',
    rating: 4.8,
    deliveryTime: '20-30 mins',
    minOrder: 150,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    approved: true
  },
  {
    id: 'v2',
    name: 'Kisero Nairobi (Soko Plaza)',
    category: 'M & M Soko',
    subType: 'Fresh Organic Farm Produce & Greens',
    rating: 4.7,
    deliveryTime: '15-25 mins',
    minOrder: 100,
    badge: 'Verified',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    approved: true
  },
  {
    id: 'v3',
    name: 'Quick Gas & Dry cleaners',
    category: 'M & M Services',
    subType: 'LPG Refills & Laundry pickup',
    rating: 4.9,
    deliveryTime: '15-30 mins',
    minOrder: 500,
    badge: 'Fast Delivery & service',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    approved: true
  },
  {
    id: 'v4',
    name: 'Fun Zone Liquor Store',
    category: 'M & M Fun Zone',
    subType: 'Premium Drinks, Ice & Party Mixes',
    rating: 4.6,
    deliveryTime: '10-20 mins',
    minOrder: 300,
    badge: '24/7 Delivery',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    approved: true
  }
];

const BASELINE_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Beef Pilau Royal', price: 250, description: 'Fragrant beef pilau served with spicy kachumbari.', category: 'Food & Beverages', storeName: 'Yusuf Dishes (Rongai Stage)', isFeatured: true },
  { id: 'm2', name: 'Swahili Chicken Biryani', price: 350, description: 'Spiced rice layering tender simmered chicken sauce.', category: 'Food & Beverages', storeName: 'Yusuf Dishes (Rongai Stage)' },
  { id: 'm3', name: 'Fresh Sukuma Wiki Box', price: 80, description: 'Pre-washed, pre-shredded traditional kales.', category: 'M & M Soko', storeName: 'Kisero Nairobi (Soko Plaza)' },
  { id: 'm4', name: 'Red Onion Net (2KG)', price: 180, description: 'Crisp organic red cooking onions sourced directly.', category: 'M & M Soko', storeName: 'Kisero Nairobi (Soko Plaza)', isFeatured: true },
  { id: 'm5', name: 'Gas Refill 6KG (Total/K-Gas)', price: 1200, description: 'Instant cylinder replacement brought to your doorstep.', category: 'M & M Services', storeName: 'Quick Gas & Dry cleaners' },
  { id: 'm6', name: 'Duvet Laundry Wash', price: 600, description: 'Professional deep clean wash & fragrance tumble dry.', category: 'M & M Services', storeName: 'Quick Gas & Dry cleaners' },
  { id: 'm7', name: 'Scotch Whisky Blend 750ml', price: 1800, description: 'Smooth blended scotch, perfect for evening chilling.', category: 'M & M Fun Zone', storeName: 'Fun Zone Liquor Store', isFeatured: true },
  { id: 'm8', name: 'Artisanal Tonic Mixers (Pack of 4)', price: 400, description: 'Crisp, refreshing botanical mixers for drinks.', category: 'M & M Fun Zone', storeName: 'Fun Zone Liquor Store' }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('Food & Beverages');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [dashboardTab, setDashboardTab] = useState<'customer' | 'vendor' | 'rider' | 'admin'>('customer');
  const [profileReturnTab, setProfileReturnTab] = useState<'customer' | 'vendor' | 'rider' | 'admin'>('customer');

  // Advanced Onboarding, Security & Authentication System States
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('mm_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authUsername, setAuthUsername] = useState<string>(currentUser?.username || '');
  const [authEmail, setAuthEmail] = useState<string>(currentUser?.email || '');
  const [authPhone, setAuthPhone] = useState<string>(currentUser?.phone || '');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>('');
  let initialRole: 'customer' | 'vendor' | 'rider' = 'customer';
  if (currentUser?.role === 'customer' || currentUser?.role === 'vendor' || currentUser?.role === 'rider') {
    initialRole = currentUser.role;
  }
  const [authRole, setAuthRole] = useState<'customer' | 'vendor' | 'rider'>(initialRole);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(currentUser?.profilePhotoUrl || '');
  const [profileAddress, setProfileAddress] = useState<string>(currentUser?.address || '');
  const [profileDeliveryPoint, setProfileDeliveryPoint] = useState<string>(currentUser?.deliveryPoint || '');
  const [profileBio, setProfileBio] = useState<string>(currentUser?.bio || '');
  const [profilePickupNote, setProfilePickupNote] = useState<string>(currentUser?.pickupNote || '');
  const [profileSaveLoading, setProfileSaveLoading] = useState<boolean>(false);

  // Interactive Local Concept States
  const [bodaPoolOption, setBodaPoolOption] = useState<boolean>(false);
  const [bodaPoolWindow, setBodaPoolWindow] = useState<number | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<{ [jobId: string]: string }>({});
  const [cookieConsent, setCookieConsent] = useState<string | null>(() => {
    return localStorage.getItem('mm_cookie_consent');
  });
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Security gate states (Admin hidden decryption access)
  const [isAdminGatewayOpen, setIsAdminGatewayOpen] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const syncUserFields = (user: AuthUser | null) => {
    if (!user) return;
    setAuthUsername(user.username || '');
    setAuthEmail(user.email || '');
    setAuthPhone(user.phone || '');
    const role: 'customer' | 'vendor' | 'rider' = user.role === 'customer'
      ? 'customer'
      : user.role === 'vendor'
      ? 'vendor'
      : user.role === 'rider'
      ? 'rider'
      : 'customer';
    setAuthRole(role);
    setProfilePhotoUrl(user.profilePhotoUrl || '');
    setProfileAddress(user.address || '');
    setProfileDeliveryPoint(user.deliveryPoint || '');
    setProfileBio(user.bio || '');
    setProfilePickupNote(user.pickupNote || '');
  };

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out from Supabase:', e);
    }
    setCurrentUser(null);
    setAuthUsername('');
    setAuthEmail('');
    setAuthPhone('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    setAuthRole('customer');
    setProfilePhotoUrl('');
    setProfileAddress('');
    setProfileDeliveryPoint('');
    setProfileBio('');
    setProfilePickupNote('');
    localStorage.removeItem('mm_current_user');
    setCart([]);
    triggerToast('Logged out of platform session safely.', 'info');
  };

  const [vendors, setVendors] = useState<Vendor[]>(BASELINE_VENDORS);
  const [customMarketplace, setCustomMarketplace] = useState<MenuItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [vendorApprovals, setVendorApprovals] = useState<VendorApprovalRequest[]>([]);
  const [riderApprovals, setRiderApprovals] = useState<DeliveryApprovalRequest[]>([]);
  const [deliveryFleet, setDeliveryFleet] = useState<DeliveryJob[]>([]);
  const [escrowLedger, setEscrowLedger] = useState<EscrowTransaction[]>([]);
  const [chamaDeals, setChamaDeals] = useState<ChamaDeal[]>([]);
  const [gasPredictions, setGasPredictions] = useState<GasPrediction[]>([]);
  const [bannedVendors, setBannedVendors] = useState<string[]>([]);

  const resolveRoleFromApprovals = (phone: string, fallbackRole: 'customer' | 'vendor' | 'rider') => {
    if (vendorApprovals.some(req => req.phone === phone && req.status === 'Approved')) {
      return 'vendor' as const;
    }
    if (riderApprovals.some(req => req.phone === phone && req.status === 'Approved')) {
      return 'rider' as const;
    }
    return fallbackRole;
  };

  const hasVendorHubAccess = !!currentUser && (
    currentUser.role === 'vendor' ||
    vendorApprovals.some(req => req.phone === currentUser.phone && req.status === 'Approved') ||
    vendors.some(v => v.approved && v.name.toLowerCase().includes((currentUser.username || '').toLowerCase()))
  );

  const hasRiderTransitAccess = !!currentUser && (
    currentUser.role === 'rider' ||
    riderApprovals.some(req => req.phone === currentUser.phone && req.status === 'Approved') ||
    riderApprovals.some(req => req.riderName.toLowerCase() === (currentUser.username || '').toLowerCase() && req.status === 'Approved')
  );

  // Load initial data from Supabase on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load vendors
        const { data: dbVendors, error: errVendors } = await supabase.from('vendors').select('*');
        if (!errVendors && dbVendors && dbVendors.length > 0) {
          setVendors(dbVendors.map(v => ({
            id: v.id,
            name: v.name,
            category: v.category,
            subType: v.sub_type || '',
            rating: Number(v.rating),
            deliveryTime: v.delivery_time || '',
            minOrder: Number(v.min_order),
            badge: v.badge || '',
            image: v.image || '',
            approved: !!v.approved
          })));
        } else if (!dbVendors || dbVendors.length === 0) {
          // Map local types to db columns
          const toInsert = BASELINE_VENDORS.map(v => ({
            id: v.id,
            name: v.name,
            category: v.category,
            sub_type: v.subType,
            rating: v.rating,
            delivery_time: v.deliveryTime,
            min_order: v.minOrder,
            badge: v.badge,
            image: v.image,
            approved: v.approved
          }));
          await supabase.from('vendors').insert(toInsert);
        }

        // Load menu items
        const { data: dbMenuItems, error: errMenuItems } = await supabase.from('menu_items').select('*');
        if (!errMenuItems && dbMenuItems && dbMenuItems.length > 0) {
          setCustomMarketplace(dbMenuItems.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            description: item.description || '',
            category: item.category,
            storeName: item.store_name,
            isFeatured: !!item.is_featured
          })));
        } else if (!dbMenuItems || dbMenuItems.length === 0) {
          const toInsert = BASELINE_MENU_ITEMS.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            store_name: item.storeName,
            is_featured: !!item.isFeatured
          }));
          await supabase.from('menu_items').insert(toInsert);
          setCustomMarketplace(BASELINE_MENU_ITEMS);
        }

        // Load inquiries
        const { data: dbInquiries } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
        if (dbInquiries) {
          setInquiries(dbInquiries.map(item => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
            topic: item.topic,
            message: item.message,
            userId: item.user_id ?? undefined,
            timestamp: new Date(item.created_at).toLocaleString(),
            status: item.status as 'Pending' | 'Answered'
          })));
        }

        // Load vendor approvals
        const { data: dbVendorApprovals } = await supabase.from('vendor_approvals').select('*').order('created_at', { ascending: false });
        if (dbVendorApprovals) {
          setVendorApprovals(dbVendorApprovals.map(item => ({
            id: item.id,
            shopName: item.shop_name,
            category: item.category,
            phone: item.phone,
            status: item.status as 'Pending' | 'Approved' | 'Declined',
            timestamp: new Date(item.created_at).toLocaleString()
          })));
        }

        // Load rider approvals
        const { data: dbRiderApprovals } = await supabase.from('rider_approvals').select('*').order('created_at', { ascending: false });
        if (dbRiderApprovals) {
          setRiderApprovals(dbRiderApprovals.map(item => ({
            id: item.id,
            riderName: item.rider_name,
            motorcyclePlate: item.motorcycle_plate,
            phone: item.phone,
            status: item.status as 'Pending' | 'Approved' | 'Declined',
            timestamp: new Date(item.created_at).toLocaleString()
          })));
        }

        // Load delivery jobs
        const { data: dbDeliveryFleet } = await supabase.from('delivery_jobs').select('*').order('created_at', { ascending: false });
        if (dbDeliveryFleet && dbDeliveryFleet.length > 0) {
          setDeliveryFleet(dbDeliveryFleet.map(j => ({
            id: j.id,
            orderId: j.order_id,
            destination: j.destination,
            fee: Number(j.fee),
            status: j.status as 'Available' | 'Assigned' | 'Picked Up' | 'Delivered',
            riderName: j.rider_name || undefined,
            customerPhone: j.customer_phone,
            merchantName: j.merchant_name,
            itemsSummary: j.items_summary || '',
            otp: j.otp,
            bodaPoolActive: !!j.boda_pool_active
          })));
        } else if (!dbDeliveryFleet || dbDeliveryFleet.length === 0) {
          const defaultJob = {
            id: generateUniqueId('job'),
            order_id: 'ORD-98827',
            destination: 'Maasai Lodge Route',
            fee: 150,
            status: 'Available',
            customer_phone: '0712334455',
            merchant_name: 'Yusuf Dishes (Rongai Stage)',
            items_summary: 'Beef Pilau Royal (x2)',
            otp: '4582',
            boda_pool_active: false
          };
          await supabase.from('delivery_jobs').insert([defaultJob]);
          setDeliveryFleet([{
            id: defaultJob.id,
            orderId: defaultJob.order_id,
            destination: defaultJob.destination,
            fee: defaultJob.fee,
            status: defaultJob.status as 'Available' | 'Assigned' | 'Picked Up' | 'Delivered',
            customerPhone: defaultJob.customer_phone,
            merchantName: defaultJob.merchant_name,
            itemsSummary: defaultJob.items_summary,
            otp: defaultJob.otp,
            bodaPoolActive: defaultJob.boda_pool_active
          }]);
        }

        // Load escrow transactions
        const { data: dbEscrowLedger } = await supabase.from('escrow_transactions').select('*').order('created_at', { ascending: false });
        if (dbEscrowLedger && dbEscrowLedger.length > 0) {
          setEscrowLedger(dbEscrowLedger.map(tx => ({
            id: tx.id,
            orderId: tx.order_id,
            amount: Number(tx.amount),
            payer: tx.payer,
            vendorName: tx.vendor_name,
            status: tx.status as 'Holding' | 'Released' | 'Refunded',
            timestamp: new Date(tx.created_at).toLocaleString()
          })));
        } else if (!dbEscrowLedger || dbEscrowLedger.length === 0) {
          const defaultTx: {
            id: string;
            order_id: string;
            amount: number;
            payer: string;
            vendor_name: string;
            status: 'Holding' | 'Released' | 'Refunded';
          } = {
            id: generateUniqueId('tx'),
            order_id: 'ORD-98827',
            amount: 650,
            payer: 'Customer (Jane)',
            vendor_name: 'Yusuf Dishes (Rongai Stage)',
            status: 'Holding'
          };
          await supabase.from('escrow_transactions').insert([defaultTx]);
          setEscrowLedger([{
            id: defaultTx.id,
            orderId: defaultTx.order_id,
            amount: defaultTx.amount,
            payer: defaultTx.payer,
            vendorName: defaultTx.vendor_name,
            status: defaultTx.status,
            timestamp: new Date().toLocaleString()
          }]);
        }

        // Load chama deals
        const { data: dbChamaDeals } = await supabase.from('chama_deals').select('*');
        if (dbChamaDeals && dbChamaDeals.length > 0) {
          setChamaDeals(dbChamaDeals.map(d => ({
            id: d.id,
            title: d.title,
            merchant: d.merchant,
            category: d.category,
            totalPrice: Number(d.total_price),
            portionPrice: Number(d.portion_price),
            targetPortions: Number(d.target_portions),
            filledPortions: Number(d.filled_portions),
            backers: d.backers || []
          })));
        } else if (!dbChamaDeals || dbChamaDeals.length === 0) {
          const defaultDeal = {
            id: generateUniqueId('chama'),
            title: '50KG Sack Red Onions (Soko Bulk Group Buy)',
            merchant: 'Kisero Nairobi (Soko Plaza)',
            category: 'M & M Soko',
            total_price: 4000,
            portion_price: 400,
            target_portions: 10,
            filled_portions: 4,
            backers: ['0712345678', '0722334455', '0799887766', '0700112233']
          };
          await supabase.from('chama_deals').insert([defaultDeal]);
          setChamaDeals([{
            id: defaultDeal.id,
            title: defaultDeal.title,
            merchant: defaultDeal.merchant,
            category: defaultDeal.category,
            totalPrice: defaultDeal.total_price,
            portionPrice: defaultDeal.portion_price,
            targetPortions: defaultDeal.target_portions,
            filledPortions: defaultDeal.filled_portions,
            backers: defaultDeal.backers
          }]);
        }

        // Load gas predictions
        const { data: dbGasPredictions } = await supabase.from('gas_predictions').select('*');
        if (dbGasPredictions) {
          setGasPredictions(dbGasPredictions.map(p => ({
            userId: p.user_id,
            gasSize: p.gas_size,
            householdSize: Number(p.household_size),
            daysRemaining: Number(p.days_remaining),
            lastRefillDate: p.last_refill_date
          })));
        }

        // Load banned vendors
        const { data: dbBannedVendors } = await supabase.from('banned_vendors').select('*');
        if (dbBannedVendors) {
          setBannedVendors(dbBannedVendors.map(v => v.store_name));
        }
      } catch (err) {
        console.error("Failed to load initial Supabase data:", err);
      }
    };
    loadInitialData();
  }, []);

  // Checkout forms binding
  const [deliveryPlace, setDeliveryPlace] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isProcessingEscrow, setIsProcessingEscrow] = useState<boolean>(false);

  // SaaS Product upload forms binding
  const [newProductTitle, setNewProductTitle] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<string>('');
  const [newProductCategory, setNewProductCategory] = useState<string>('Food & Beverages');
  const [newProductStore, setNewProductStore] = useState<string>('');
  const [newProductDesc, setNewProductDesc] = useState<string>('');

  // Support inquiry forms binding
  const [helpName, setHelpName] = useState<string>('');
  const [helpPhone, setHelpPhone] = useState<string>('');
  const [helpTopic, setHelpTopic] = useState<string>('Payment Dispute');
  const [helpMsg, setHelpMsg] = useState<string>('');

  // Notification and admin reply bindings
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminReplyText, setAdminReplyText] = useState<Record<string, string>>({});

  // Self Onboarding Registration Forms
  const [regShopName, setRegShopName] = useState<string>('');
  const [regCategory, setRegCategory] = useState<string>('Food & Beverages');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regShopPassword, setRegShopPassword] = useState<string>('');
  const [regShopConfirmPassword, setRegShopConfirmPassword] = useState<string>('');

  const [regRiderName, setRegRiderName] = useState<string>('');
  const [regPlate, setRegPlate] = useState<string>('');
  const [regRiderPhone, setRegRiderPhone] = useState<string>('');
  const [regRiderPassword, setRegRiderPassword] = useState<string>('');
  const [regRiderConfirmPassword, setRegRiderConfirmPassword] = useState<string>('');

  // AI gas refill countdown configurations
  const [gasHousehold, setGasHousehold] = useState<string>('2');
  const [gasSizeSelected, setGasSizeSelected] = useState<string>('6KG');

  const fullMarketplace = useMemo(() => {
    return customMarketplace.filter(item => !bannedVendors.includes(item.storeName));
  }, [customMarketplace, bannedVendors]);

  const filteredItems = useMemo(() => {
    return fullMarketplace.filter((item) => {
      const matchCat = item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [fullMarketplace, activeCategory, searchQuery]);

  const featuredItems = useMemo(() => {
    return fullMarketplace.filter(item => item.isFeatured);
  }, [fullMarketplace]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, entry) => total + (entry.item.price * entry.quantity), 0);
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(entry => entry.item.id === item.id);
    if (existing) {
      setCart(cart.map(entry => entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    triggerToast(`Added ${item.name} to Basket!`);
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(entry => entry.item.id === itemId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(entry => entry.item.id === itemId ? { ...entry, quantity: entry.quantity - 1 } : entry));
    } else {
      setCart(cart.filter(entry => entry.item.id !== itemId));
    }
  };

  const clearItemFromCart = (itemId: string) => {
    setCart(cart.filter(entry => entry.item.id !== itemId));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");
    if (!authUsername || (!authEmail && !authPhone)) {
      triggerToast('Complete username and either email or telephone number!', 'error');
      return;
    }

    const isLegacyPhoneLogin = authMode === 'login' && !authPassword && authPhone.trim() && !authEmail.trim();
    if (authMode === 'login' && !authPassword && !isLegacyPhoneLogin) {
      triggerToast('Enter your password to log in.', 'error');
      return;
    }

    if (authMode === 'signup') {
      if (!authEmail) {
        triggerToast('Provide a valid email address when signing up.', 'error');
        return;
      }
      if (!authPassword || !authConfirmPassword) {
        triggerToast('Provide password and confirmation.', 'error');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        triggerToast('Passwords do not match.', 'error');
        return;
      }
      if (authPassword.length < 8) {
        triggerToast('Password must be at least 8 characters long.', 'error');
        return;
      }
    }

    if (authMode === 'login') {
      console.log("Attempting Supabase Auth login...");
      try {
        const cleanPhone = authPhone.trim().replace(/\s+/g, '');
        const loginEmail = authEmail.trim() || `${cleanPhone}@matchmarket.com`;

        // 1. Sign in via Supabase Auth when a password is supplied.
        let authData: { user: { id: string } | null } = { user: null };
        let authError: Error | null = null;

        if (!isLegacyPhoneLogin) {
          const response = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: authPassword,
          });
          authData = response.data;
          authError = response.error;
        } else {
          console.warn('Skipping password login and using legacy phone-based fallback.');
          authError = new Error('Legacy phone login fallback');
        }

        if (authError) {
          const isLegacyFallback = !authEmail.trim() && cleanPhone.length > 0;
          if (!isLegacyFallback) {
            triggerToast('Login failed: ' + authError.message, 'error');
            return;
          }
          // Fallback: If auth fails and the user only provided phone, try legacy profile lookup.
          console.warn("Auth login failed, trying legacy query fallback:", authError.message);
          const { data: legacyData, error: legacyError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', authUsername)
            .eq('phone', authPhone)
            .maybeSingle();

          if (legacyError || !legacyData) {
            triggerToast('Account not found! Switch to Sign Up mode.', 'error');
            return;
          }

          // Allow login using the legacy profile data directly
          const user: AuthUser = {
            id: legacyData.id,
            username: legacyData.username,
            phone: legacyData.phone,
            role: legacyData.role as 'admin' | 'vendor' | 'customer',
            linkedEntityName: legacyData.linked_entity_name || undefined
          };
          setCurrentUser(user);
          syncUserFields(user);
          localStorage.setItem('mm_current_user', JSON.stringify(user));
          setIsAuthOpen(false);
          triggerToast(`Welcome back (Legacy), ${user.username}!`);
          return;
        }

        const userId = authData.user?.id;
        if (!userId) {
          triggerToast('Failed to retrieve user session.', 'error');
          return;
        }

        // 2. Fetch profile from database using UUID
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          triggerToast('Error searching database: ' + error.message, 'error');
          return;
        }

        if (data) {
          const user: AuthUser = {
            id: data.id,
            email: data.email || loginEmail,
            username: data.username,
            phone: data.phone,
            role: data.role as 'admin' | 'vendor' | 'customer',
            linkedEntityName: data.linked_entity_name || undefined,
            profilePhotoUrl: data.profile_photo_url || undefined,
            address: data.address || undefined,
            deliveryPoint: data.delivery_point || undefined,
            bio: data.bio || undefined,
            pickupNote: data.pickup_note || undefined
          };
          setCurrentUser(user);
          syncUserFields(user);
          localStorage.setItem('mm_current_user', JSON.stringify(user));
          setAuthPassword('');
          setAuthConfirmPassword('');
          setIsAuthOpen(false);
          triggerToast(`Welcome back, ${user.username}!`);
        } else {
          // If they exist in auth but not profiles, we create the profile
          let assignedRole = resolveRoleFromApprovals(authPhone, authRole);
          let linkedName = '';
          if (assignedRole === 'customer') {
            const foundVendor = vendors.find(v => v.name.toLowerCase().includes(authUsername.toLowerCase()));
            if (foundVendor) {
              assignedRole = 'vendor';
              linkedName = foundVendor.name;
            }
          }
          const newProfile = {
            id: userId,
            username: authUsername,
            phone: authPhone,
            role: assignedRole,
            linked_entity_name: linkedName || null,
            email: loginEmail
          };
          
          const { data: insertData, error: insertError } = await supabase.from('profiles').insert([newProfile]).select().maybeSingle();
          if (insertError) {
            console.warn('Failed to create fallback profile record:', insertError.message);
          }
          const userProfile = insertData || newProfile;
          const user: AuthUser = {
            id: userProfile.id,
            email: userProfile.email || loginEmail,
            username: userProfile.username,
            phone: userProfile.phone,
            role: userProfile.role as 'admin' | 'vendor' | 'customer',
            linkedEntityName: userProfile.linked_entity_name || undefined
          };
          setCurrentUser(user);
          localStorage.setItem('mm_current_user', JSON.stringify(user));
          setIsAuthOpen(false);
          triggerToast(`Welcome back, ${user.username}!`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        triggerToast('Auth connection error: ' + message, 'error');
      }
    } else if (authMode === 'signup') {
      console.log("Attempting Supabase Auth registration...");
      try {
        let assignedRole = resolveRoleFromApprovals(authPhone, authRole);
        let linkedName = '';

        if (assignedRole === 'customer') {
          const foundVendor = vendors.find(v => v.name.toLowerCase().includes(authUsername.toLowerCase()));
          if (foundVendor) {
            assignedRole = 'vendor';
            linkedName = foundVendor.name;
          }
        }

        // 1. Sign up user in Supabase Auth
        const emailToUse = authEmail.trim();
        const passwordToUse = authPassword;

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailToUse,
          password: passwordToUse,
          options: {
            data: {
              username: authUsername,
              phone: authPhone,
              role: assignedRole,
              full_name: authUsername,
              email: emailToUse,
              profile_photo_url: profilePhotoUrl || null,
              address: profileAddress || null,
              delivery_point: profileDeliveryPoint || null,
              bio: profileBio || null,
              pickup_note: profilePickupNote || null
            }
          }
        });

        if (authError) {
          triggerToast('Auth registration failed: ' + authError.message, 'error');
          return;
        }

        const userId = authData.user?.id;
        if (!userId) {
          triggerToast('Failed to retrieve registered User ID.', 'error');
          return;
        }

        const newProfile = {
          id: userId, // Correct UUID from Auth
          email: emailToUse,
          username: authUsername,
          phone: authPhone,
          role: assignedRole,
          linked_entity_name: linkedName || null,
          profile_photo_url: profilePhotoUrl || null,
          address: profileAddress || null,
          delivery_point: profileDeliveryPoint || null,
          bio: profileBio || null,
          pickup_note: profilePickupNote || null
        };

        console.log("Inserting new profile to Supabase:", newProfile);
        const { data: insertData, error: insertError } = await supabase.from('profiles').insert([newProfile]).select().maybeSingle();
        console.log('Insert result:', { insertData, insertError });
        
        if (insertError) {
          triggerToast('Error registering profile in database: ' + insertError.message, 'error');
          return;
        }

        const user: AuthUser = {
          id: userId,
          email: emailToUse,
          username: authUsername,
          phone: authPhone,
          role: assignedRole,
          linkedEntityName: linkedName || undefined,
          profilePhotoUrl: profilePhotoUrl || undefined,
          address: profileAddress || undefined,
          deliveryPoint: profileDeliveryPoint || undefined,
          bio: profileBio || undefined,
          pickupNote: profilePickupNote || undefined
        };

        setCurrentUser(user);
        syncUserFields(user);
        localStorage.setItem('mm_current_user', JSON.stringify(user));
        setAuthPassword('');
        setAuthConfirmPassword('');
        setIsAuthOpen(false);
        triggerToast(`Successfully registered account for ${authUsername}!`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        triggerToast('Registration failed: ' + message, 'error');
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerToast('Please sign in before updating your profile.', 'error');
      return;
    }

    setProfileSaveLoading(true);
    const metadataUpdate: Record<string, string | null> = {
      full_name: authUsername,
      profile_photo_url: profilePhotoUrl || null,
      address: profileAddress || null,
      delivery_point: profileDeliveryPoint || null,
      bio: profileBio || null,
      pickup_note: profilePickupNote || null
    };
    if (authEmail) {
      metadataUpdate.email = authEmail;
    }
    if (authPassword) {
      metadataUpdate.password = authPassword;
    }

    const sessionResp = await supabase.auth.getSession();
    if (sessionResp.data.session) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: authEmail || undefined,
        password: authPassword || undefined,
        data: metadataUpdate
      });
      if (authUpdateError) {
        console.warn('Auth metadata update failed:', authUpdateError.message);
        triggerToast('Profile auth update failed: ' + authUpdateError.message, 'error');
        setProfileSaveLoading(false);
        return;
      }
    }

    const profileUpdate = {
      id: currentUser.id,
      username: authUsername,
      phone: authPhone,
      email: authEmail || currentUser.email || null,
      profile_photo_url: profilePhotoUrl || null,
      address: profileAddress || null,
      delivery_point: profileDeliveryPoint || null,
      bio: profileBio || null,
      pickup_note: profilePickupNote || null
    };
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .upsert(profileUpdate, { onConflict: 'id' })
      .select()
      .maybeSingle();
    if (profileUpdateError) {
      console.warn('Profile table update failed:', profileUpdateError.message);
      triggerToast('Profile save failed: ' + profileUpdateError.message, 'error');
      setProfileSaveLoading(false);
      return;
    }

    const updatedUser: AuthUser = {
      ...currentUser,
      email: authEmail || currentUser.email,
      username: authUsername,
      phone: authPhone,
      profilePhotoUrl,
      address: profileAddress,
      deliveryPoint: profileDeliveryPoint,
      bio: profileBio,
      pickupNote: profilePickupNote
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('mm_current_user', JSON.stringify(updatedUser));
    setProfileSaveLoading(false);
    triggerToast('Profile updated successfully!', 'success');
    setDashboardTab(profileReturnTab);
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpName || !helpPhone || !helpMsg) {
      triggerToast('Complete support routing details!', 'error');
      return;
    }

    const newInquiry = {
      id: generateUniqueId('i'),
      user_id: currentUser?.id ?? null,
      name: helpName,
      phone: helpPhone,
      topic: helpTopic,
      message: helpMsg,
      status: 'Pending'
    };

    console.log("Attempting Supabase query...");
    const { data: inquiryData, error: inquiryError } = await supabase.from('inquiries').insert([newInquiry]).select().maybeSingle();
    console.log("Supabase insert response:", { inquiryData, inquiryError });
    if (inquiryError) {
      triggerToast('Failed to send message: ' + inquiryError.message, 'error');
      return;
    }

    if (!inquiryData) {
      console.warn('Insert returned no data for inquiry; check RLS or table policies.');
    }

    setInquiries([{
      id: newInquiry.id,
      userId: newInquiry.user_id ?? undefined,
      name: newInquiry.name,
      phone: newInquiry.phone,
      topic: newInquiry.topic,
      message: newInquiry.message,
      timestamp: new Date().toLocaleString(),
      status: 'Pending'
    }, ...inquiries]);

    if (currentUser) {
      const newNotification = {
        id: generateUniqueId('n'),
        userId: currentUser.id,
        content: `Support ticket submitted: ${helpTopic}`,
        createdAt: new Date().toLocaleString(),
        read: false,
        type: 'support' as const
      };
      setNotifications([newNotification, ...notifications]);
    }

    setHelpName('');
    setHelpPhone('');
    setHelpMsg('');
    triggerToast('Message sent successfully!', 'success');
  };

  const handleAdminReply = (inquiryId: string) => {
    const reply = (adminReplyText[inquiryId] || '').trim();
    if (!reply) {
      triggerToast('Enter a reply message before sending.', 'error');
      return;
    }

    const inquiry = inquiries.find((inq) => inq.id === inquiryId);
    if (!inquiry) {
      triggerToast('Support inquiry not found.', 'error');
      return;
    }

    setInquiries(inquiries.map((inq) =>
      inq.id === inquiryId
        ? { ...inq, status: 'Answered', adminResponse: reply }
        : inq
    ));

    if (inquiry.userId) {
      const feedbackNotification = {
        id: generateUniqueId('n'),
        userId: inquiry.userId,
        content: `Admin replied to your support ticket: ${reply}`,
        createdAt: new Date().toLocaleString(),
        read: false,
        type: 'support' as const
      };
      setNotifications([feedbackNotification, ...notifications]);
    }

    setAdminReplyText({
      ...adminReplyText,
      [inquiryId]: ''
    });
    triggerToast(`Response sent for ${inquiry.name}'s inquiry.`, 'success');
  };

  const triggerMpesaEscrow = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      triggerToast('Secure account authorization required to complete orderpayment!', 'info');
      return;
    }
    if (!deliveryPlace) {
      triggerToast('Please select a Delivery Route!', 'error');
      return;
    }
    if (!customerPhone || customerPhone.length < 10) {
      triggerToast('Please input a valid M-Pesa mobile number!', 'error');
      return;
    }

    setIsProcessingEscrow(true);
    triggerToast(`Pushing secure STK prompt on M-Pesa to ${customerPhone}...`, 'info');

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const antiLiarOtp = generateSecureOtp();
    const finalFee = bodaPoolOption ? 75 : 150;

    const newTx = {
      id: generateUniqueId('tx'),
      order_id: orderId,
      amount: cartTotal + finalFee,
      payer: `Customer: ${currentUser.username} (${customerPhone})`,
      vendor_name: cart[0].item.storeName,
      status: 'Holding'
    };

    const newJob = {
      id: generateUniqueId('job'),
      order_id: orderId,
      destination: deliveryPlace,
      fee: finalFee,
      status: 'Available',
      customer_phone: customerPhone,
      merchant_name: cart[0].item.storeName,
      items_summary: cart.map(entry => `${entry.item.name} (x${entry.quantity})`).join(', '),
      otp: antiLiarOtp,
      boda_pool_active: bodaPoolOption
    };

    const { error: txErr } = await supabase.from('escrow_transactions').insert([newTx]);
    const { error: jobErr } = await supabase.from('delivery_jobs').insert([newJob]);

    if (txErr || jobErr) {
      triggerToast('Failed to log escrow transaction to database', 'error');
      setIsProcessingEscrow(false);
      return;
    }

    setEscrowLedger([{
      id: newTx.id,
      orderId: newTx.order_id,
      amount: newTx.amount,
      payer: newTx.payer,
      vendorName: newTx.vendor_name,
      status: 'Holding',
      timestamp: new Date().toLocaleString()
    }, ...escrowLedger]);

    setDeliveryFleet([{
      id: newJob.id,
      orderId: newJob.order_id,
      destination: newJob.destination,
      fee: newJob.fee,
      status: 'Available',
      customerPhone: newJob.customer_phone,
      merchantName: newJob.merchant_name,
      itemsSummary: newJob.items_summary,
      otp: newJob.otp,
      bodaPoolActive: newJob.boda_pool_active
    }, ...deliveryFleet]);
    
    if (bodaPoolOption) {
      setBodaPoolWindow(10);
    }

    setCart([]);
    setIsCheckoutOpen(false);
    setIsProcessingEscrow(false);
    
    triggerToast(`Secure holding locked. Share this Payment OTP(One-Time-Password) with rider upon arrival: ${antiLiarOtp}`, 'success');
  };

  const handleVendorRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regShopName || !regPhone || !regShopPassword || !regShopConfirmPassword) {
      triggerToast('Provide store details and a password for your dashboard!', 'error');
      return;
    }
    if (regShopPassword !== regShopConfirmPassword) {
      triggerToast('Vendor password and confirmation must match.', 'error');
      return;
    }
    if (regShopPassword.length < 8) {
      triggerToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    const emailForVendor = `${regPhone.replace(/\D/g, '')}@matchmarket.com`;
    const newRequest = {
      id: generateUniqueId('va'),
      shop_name: regShopName,
      category: regCategory,
      phone: regPhone,
      login_email: emailForVendor,
      status: 'Pending'
    };

    const { error } = await supabase.from('vendor_approvals').insert([newRequest]);
    if (error) {
      triggerToast('Store registration failed: ' + error.message, 'error');
      return;
    }

    setVendorApprovals([{
      id: newRequest.id,
      shopName: newRequest.shop_name,
      category: newRequest.category,
      phone: newRequest.phone,
      status: 'Pending',
      timestamp: new Date().toLocaleString(),
      loginEmail: newRequest.login_email
    }, ...vendorApprovals]);

    setRegShopName('');
    setRegPhone('');
    setRegShopPassword('');
    setRegShopConfirmPassword('');
    triggerToast('Store network application successful! Please wait for approval.');
  };

  const handleRiderRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regRiderName || !regPlate || !regRiderPhone || !regRiderPassword || !regRiderConfirmPassword) {
      triggerToast('Complete rider details and choose a password for your delivery login!', 'error');
      return;
    }
    if (regRiderPassword !== regRiderConfirmPassword) {
      triggerToast('Rider password and confirmation must match.', 'error');
      return;
    }
    if (regRiderPassword.length < 8) {
      triggerToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    const emailForRider = `${regRiderPhone.replace(/\D/g, '')}@matchmarket.com`;
    const newRequest = {
      id: generateUniqueId('ra'),
      rider_name: regRiderName,
      motorcycle_plate: regPlate,
      phone: regRiderPhone,
      login_email: emailForRider,
      status: 'Pending'
    };

    const { error } = await supabase.from('rider_approvals').insert([newRequest]);
    if (error) {
      triggerToast('Rider registration failed: ' + error.message, 'error');
      return;
    }

    setRiderApprovals([{
      id: newRequest.id,
      riderName: newRequest.rider_name,
      motorcyclePlate: newRequest.motorcycle_plate,
      phone: newRequest.phone,
      status: 'Pending',
      timestamp: new Date().toLocaleString(),
      loginEmail: newRequest.login_email
    }, ...riderApprovals]);

    setRegRiderName('');
    setRegPlate('');
    setRegRiderPhone('');
    setRegRiderPassword('');
    setRegRiderConfirmPassword('');
    triggerToast('Rider transit application successful! Please wait for approval.');
  };

  const handleGasRefillSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthOpen(true);
      triggerToast('Login required to use the Gas-O-Meter!', 'info');
      return;
    }

    const people = parseInt(gasHousehold, 10);
    const rate = gasSizeSelected === '6KG' ? 30 : 65;
    const computedDays = Math.max(3, Math.round(rate / (people * 0.85)));

    const newPrediction = {
      user_id: currentUser.id,
      gas_size: gasSizeSelected,
      household_size: people,
      days_remaining: computedDays,
      last_refill_date: new Date().toLocaleDateString()
    };

    // Clean up old predictions for this user to avoid duplicates, then insert
    await supabase.from('gas_predictions').delete().eq('user_id', currentUser.id);
    const { error } = await supabase.from('gas_predictions').insert([newPrediction]);

    if (error) {
      triggerToast('Failed to save prediction: ' + error.message, 'error');
      return;
    }

    setGasPredictions([
      {
        userId: newPrediction.user_id,
        gasSize: newPrediction.gas_size,
        householdSize: newPrediction.household_size,
        daysRemaining: newPrediction.days_remaining,
        lastRefillDate: newPrediction.last_refill_date
      },
      ...gasPredictions.filter(p => p.userId !== currentUser.id)
    ]);

    triggerToast(`Cylinder RefillScheduled! Your ${gasSizeSelected} cylinder estimated to expire in ${computedDays} days.`, 'success');
  };

  const joinChamaDealPool = async (dealId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      triggerToast('Join the M&M ecosystem to participate in Soko Group Wholesale pricing!', 'info');
      return;
    }

    const deal = chamaDeals.find(d => d.id === dealId);
    if (!deal) return;

    if (deal.backers.includes(currentUser.phone)) {
      triggerToast('You have already registered for this wholesale chama buy-in pool!', 'info');
      return;
    }

    const updatedBackers = [...deal.backers, currentUser.phone];
    const updatedFilled = deal.filledPortions + 1;

    const { error } = await supabase
      .from('chama_deals')
      .update({ backers: updatedBackers, filled_portions: updatedFilled })
      .eq('id', dealId);

    if (error) {
      triggerToast('Failed to join pool: ' + error.message, 'error');
      return;
    }

    setChamaDeals(chamaDeals.map(d => d.id === dealId ? { ...d, backers: updatedBackers, filledPortions: updatedFilled } : d));

    if (updatedFilled >= deal.targetPortions) {
      triggerToast(`Wholesale Target Met! Chama deals automatically executed for Kisero Nairobi!`, 'success');
    } else {
      triggerToast(`Wholesale Registration Successful! Portions filled: ${updatedFilled}/${deal.targetPortions}`, 'success');
    }
  };

  const purchaseAdBanner = async (itemId: string) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_featured: true })
      .eq('id', itemId);

    if (error) {
      triggerToast('Failed to promote offering: ' + error.message, 'error');
      return;
    }

    setCustomMarketplace(customMarketplace.map(item => {
      if (item.id === itemId) {
        triggerToast(`Paid Ksh 500 Promo Fee! ${item.name} is now promoted on the primary landing banner.`, 'success');
        return { ...item, isFeatured: true };
      }
      return item;
    }));
  };

  const executeAdminGatewayUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin254') {
      const adminSession: AuthUser = {
        id: 'admin_root',
        username: 'Platform Admins',
        phone: '0700000000',
        role: 'admin'
      };
      setCurrentUser(adminSession);
      setDashboardTab('admin');
      setIsDashboardOpen(true);
      setIsAdminGatewayOpen(false);
      setAdminPasswordInput('');
      triggerToast('Platform Control Decrypted! Welcome, Admin.', 'success');
    } else {
      triggerToast('Invalid administrative access credential!', 'error');
    }
  };

  const approveVendorRequest = async (req: VendorApprovalRequest) => {
    const { error: approvalErr } = await supabase
      .from('vendor_approvals')
      .update({ status: 'Approved' })
      .eq('id', req.id);

    if (approvalErr) {
      triggerToast('Failed to approve vendor: ' + approvalErr.message, 'error');
      return;
    }

    const newVendor = {
      id: generateUniqueId('vendor'),
      name: req.shopName,
      category: req.category,
      sub_type: 'Independent Local Merchant Partner',
      rating: 5.0,
      delivery_time: '20-35 mins',
      min_order: 150,
      badge: 'Merchant Verified',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      approved: true
    };

    const { error: vendorErr } = await supabase.from('vendors').insert([newVendor]);
    if (vendorErr) {
      triggerToast('Failed to create vendor record: ' + vendorErr.message, 'error');
      return;
    }

    setVendorApprovals(vendorApprovals.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
    setVendors([...vendors, {
      id: newVendor.id,
      name: newVendor.name,
      category: newVendor.category,
      subType: newVendor.sub_type,
      rating: newVendor.rating,
      deliveryTime: newVendor.delivery_time,
      minOrder: newVendor.min_order,
      badge: newVendor.badge,
      image: newVendor.image,
      approved: newVendor.approved
    }]);

    triggerToast(`Store: ${req.shopName} approved and mapped to "${req.category}" section!`, 'success');
  };

  const approveRiderRequest = async (req: DeliveryApprovalRequest) => {
    const { error } = await supabase
      .from('rider_approvals')
      .update({ status: 'Approved' })
      .eq('id', req.id);

    if (error) {
      triggerToast('Failed to approve rider: ' + error.message, 'error');
      return;
    }

    setRiderApprovals(riderApprovals.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
    triggerToast(`Granted dispatch clearance to rider: ${req.riderName}!`, 'success');
  };

  const releaseEscrowForAdmin = async (orderId: string) => {
    const { error: jobErr } = await supabase
      .from('delivery_jobs')
      .update({ status: 'Delivered' })
      .eq('order_id', orderId);

    const { error: txErr } = await supabase
      .from('escrow_transactions')
      .update({ status: 'Released' })
      .eq('order_id', orderId);

    if (jobErr || txErr) {
      triggerToast('Failed to release escrow order: ' + (jobErr?.message || txErr?.message), 'error');
      return;
    }

    setDeliveryFleet(deliveryFleet.map(job => job.orderId === orderId ? { ...job, status: 'Delivered' } : job));
    setEscrowLedger(escrowLedger.map(tx => tx.orderId === orderId ? { ...tx, status: 'Released' } : tx));
    triggerToast('Escrow order released successfully.', 'success');
  };

  const toggleBanVendor = async (storeName: string) => {
    if (bannedVendors.includes(storeName)) {
      const { error } = await supabase.from('banned_vendors').delete().eq('store_name', storeName);
      if (error) {
        triggerToast('Failed to unban vendor: ' + error.message, 'error');
        return;
      }
      setBannedVendors(bannedVendors.filter(name => name !== storeName));
      triggerToast(`Unbanned store: ${storeName}`, 'info');
    } else {
      const { error } = await supabase.from('banned_vendors').insert([{ store_name: storeName }]);
      if (error) {
        triggerToast('Failed to ban vendor: ' + error.message, 'error');
        return;
      }
      setBannedVendors([...bannedVendors, storeName]);
      triggerToast(`Banned store: ${storeName}! Catalog items hidden.`, 'error');
    }
  };

  const handleCustomProductUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductTitle || !newProductPrice || !newProductStore) {
      triggerToast('Complete required fields!', 'error');
      return;
    }

    const newItem = {
      id: generateUniqueId('custom'),
      name: newProductTitle,
      price: parseFloat(newProductPrice),
      description: newProductDesc || 'Merchant partner listing.',
      category: newProductCategory,
      store_name: newProductStore,
      is_featured: false
    };

    const { error } = await supabase.from('menu_items').insert([newItem]);
    if (error) {
      triggerToast('Failed to upload product: ' + error.message, 'error');
      return;
    }

    setCustomMarketplace([{
      id: newItem.id,
      name: newItem.name,
      price: newItem.price,
      description: newItem.description,
      category: newItem.category,
      storeName: newItem.store_name,
      isFeatured: newItem.is_featured
    }, ...customMarketplace]);

    setNewProductTitle('');
    setNewProductPrice('');
    setNewProductDesc('');
    triggerToast(`Published ${newProductTitle} to marketplace catalog!`);
  };

  const claimDeliveryJob = async (jobId: string, riderName: string) => {
    const { error } = await supabase
      .from('delivery_jobs')
      .update({ status: 'Assigned', rider_name: riderName })
      .eq('id', jobId);

    if (error) {
      triggerToast('Failed to claim job: ' + error.message, 'error');
      return;
    }

    setDeliveryFleet(deliveryFleet.map(j => j.id === jobId ? { ...j, status: 'Assigned', riderName } : j));
    triggerToast('Job coordinates Sent Successfully! Proceed to pick up parcels at the assigned location.');
  };

  const setJobPickedUp = async (jobId: string) => {
    const { error } = await supabase
      .from('delivery_jobs')
      .update({ status: 'Picked Up' })
      .eq('id', jobId);

    if (error) {
      triggerToast('Failed to update job: ' + error.message, 'error');
      return;
    }

    setDeliveryFleet(deliveryFleet.map(j => j.id === jobId ? { ...j, status: 'Picked Up' } : j));
    triggerToast('Counter transit Approved. Delivery OTP verification is now active.');
  };

  const verifyTransitHandshake = async (jobId: string, orderId: string) => {
    const job = deliveryFleet.find(j => j.id === jobId);
    const entered = enteredOtp[jobId];
    if (!job) return;

    if (entered === job.otp) {
      const { error: jobErr } = await supabase
        .from('delivery_jobs')
        .update({ status: 'Delivered' })
        .eq('id', jobId);

      const { error: txErr } = await supabase
        .from('escrow_transactions')
        .update({ status: 'Released' })
        .eq('order_id', orderId);

      if (jobErr || txErr) {
        triggerToast('Failed to complete transit updates in database', 'error');
        return;
      }

      setDeliveryFleet(deliveryFleet.map(j => j.id === jobId ? { ...j, status: 'Delivered' } : j));
      setEscrowLedger(escrowLedger.map(tx => tx.orderId === orderId ? { ...tx, status: 'Released' } : tx));
      triggerToast('Security OTP Matches! Payment Successfully sent to vendor.', 'success');
    } else {
      triggerToast('Verification code mismatch! Funds remain locked for further review.', 'error');
    }
  };

  const acceptCookies = (choice: 'accepted' | 'rejected') => {
    setCookieConsent(choice);
    localStorage.setItem('mm_cookie_consent', choice);
    triggerToast(`Cookie parameters configured: ${choice}`, 'info');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
      
      {/* Dynamic CSS Styling Injector - Solves all unstyled local compiler issues */}
      <style>{`
        .liquid-glass {
          background: rgba(10, 10, 10, 0.7) !important;
          backdrop-filter: blur(24px) saturate(160%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow:
            0 4px 30px rgba(0, 0, 0, 0.8),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 8px 0 rgba(255, 255, 255, 0.02) !important;
        }

        .liquid-glass-heavy {
          background: rgba(5, 5, 5, 0.9) !important;
          backdrop-filter: blur(30px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(30px) saturate(200%) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow:
            0 10px 50px rgba(0, 0, 0, 0.95),
            inset 0 1px 2px 0 rgba(255, 255, 255, 0.2),
            inset 0 -2px 10px 0 rgba(255, 255, 255, 0.04) !important;
        }

        .chrome-border {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          position: relative;
        }

        .chrome-gradient {
          background: linear-gradient(180deg, #ffffff 0%, #e4e4e7 40%, #a1a1aa 100%) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }

        /* Custom Scrollbar for Luxury Aesthetic */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #000000;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
      `}</style>

      {/* FLOATING GLASS REFLECTION LIGHTING EFFECT */}
      <div className="absolute top-0 left-1/4 w-100 h-100 bg-white/4 rounded-full blur-[120px] pointer-events-none"></div>

      {/* DYNAMIC LIQUID GLOW TOAST MESSAGES */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl liquid-glass border ${
            toastType === 'success' ? 'border-white/30 text-white' : 
            toastType === 'error' ? 'border-red-500/30 text-red-400' : 'border-zinc-500/30 text-zinc-300'
          } shadow-2xl`}>
            {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-white animate-pulse" />}
            {toastType === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toastType === 'info' && <Sparkles className="w-5 h-5 text-zinc-400" />}
            <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* NAVIGATION HEADER BAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-black/80 border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white text-black font-black tracking-tighter text-xl">
              M
            </div>
            <div>
              <h1 className="text-base font-bold tracking-widest text-white uppercase">Match & Market</h1>
              <p className="text-[10px] text-zinc-400 tracking-wider">Rongai's Virtual Business Hub</p>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
            <input 
              type="text" 
              placeholder="Fresh meals, Soko, or culinary LPG refills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 text-white placeholder-zinc-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-wider text-zinc-400">
                  Hi, <span className="text-white font-extrabold">{currentUser.username}</span> ({currentUser.role})
                </span>
                <button 
                  onClick={() => setIsDashboardOpen(true)}
                  className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 transition-all"
                >
                  My M & M Hub
                </button>
                <button 
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Hidden admin lock gate */}
            <button
              onClick={() => setIsAdminGatewayOpen(true)}
              title="Admin Portal Login"
              className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-zinc-500 hover:text-white"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN APPLICATION VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        
        {/* SPONSOR banner list display */}
        {featuredItems.length > 0 && (
          <div className="mb-8 relative overflow-hidden rounded-2xl border border-white/15 liquid-glass p-6">
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-bold text-yellow-400 px-2 py-0.5 rounded uppercase tracking-widest">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Sponsor Ad banner</span>
            </div>
            
            <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-3">Featured Local Offerings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase">{item.storeName}</span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">Ksh {item.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CORE PLATFORM HERO */}
        <div className="w-full rounded-2xl liquid-glass p-8 md:p-12 mb-10 border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white mb-4 uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Match and Market Business Hub</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white uppercase leading-none">
              Shop, Order, <span className="text-zinc-400">Secure.</span>
            </h2>
            <p className="text-sm text-zinc-300 tracking-wide leading-relaxed">
              The ultimate platform that gives businesses the tools they need to thrive in the digital economy at affordable rates and Customers easy, fast and secure transactions on orders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
            <button 
              onClick={() => {
                if (!currentUser) { setIsAuthOpen(true); return; }
                setDashboardTab('vendor');
                setIsDashboardOpen(true);
              }}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-zinc-900 border border-white/20 text-white hover:bg-zinc-800 transition-all text-center"
            >
              Merchant SaaS/Vendor Hub
            </button>
            <button 
              onClick={() => {
                if (!currentUser) { setIsAuthOpen(true); return; }
                setDashboardTab('rider');
                setIsDashboardOpen(true);
              }}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all text-center"
            >
              Rider Delivery Jobs
            </button>
          </div>
        </div>

        {/* LAYOUT MAPPING GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="liquid-glass p-5 rounded-2xl border border-white/10">
              <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">Market Categories</h3>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0">
                {['Food & Beverages', 'M & M Soko', 'M & M Services', 'M & M Fun Zone'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center justify-between text-left px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap lg:whitespace-normal w-full ${
                      activeCategory === cat 
                        ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                        : 'bg-zinc-950 text-zinc-400 border border-white/5 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{cat}</span>
                    <ArrowRight className="w-3.5 h-3.5 hidden lg:block" />
                  </button>
                ))}
              </div>
            </div>

            {/* AI LPG Cooking Gas Telemetry Countdown Widget */}
            <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Gas-O-Meter Refill</span>
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Enter your household information to predict LPG cylinder depletion date.
              </p>
              <form onSubmit={handleGasRefillSchedule} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={gasSizeSelected} 
                    onChange={(e) => setGasSizeSelected(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white"
                  >
                    <option value="6KG">6KG Cylinder</option>
                    <option value="13KG">13KG Cylinder</option>
                  </select>
                  <select 
                    value={gasHousehold} 
                    onChange={(e) => setGasHousehold(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="4">4 People</option>
                    <option value="6">6+ People</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black transition-colors text-[10px] font-bold uppercase tracking-wider">
                  Calculate Prediction Date
                </button>
              </form>

              {currentUser && gasPredictions.find(p => p.userId === currentUser.id) && (
                <div className="bg-white/5 border border-orange-500/20 rounded-xl p-3 text-[11px] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Est. Cylinder Days:</span>
                    <span className="text-orange-400">{gasPredictions.find(p => p.userId === currentUser.id)?.daysRemaining} Days left</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Tracked from: {gasPredictions.find(p => p.userId === currentUser.id)?.lastRefillDate}</p>
                </div>
              )}
            </div>

            {/* Soko Plaza Chama Group Buying Pricing Widget */}
            <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Wholesale Chama Pools</span>
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Get together and buy bulk agricultural products directly from farmers at absolute low costs.
              </p>
              <div className="space-y-3">
                {chamaDeals.map((deal) => (
                  <div key={deal.id} className="p-3 rounded-lg bg-black/60 border border-white/5 text-[11px] space-y-2">
                    <p className="font-bold text-white leading-snug">{deal.title}</p>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Total Price: Ksh {deal.totalPrice}</span>
                      <span className="text-blue-400 font-bold">Pay per Person: Ksh {deal.portionPrice}</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-1.5" 
                        style={{ width: `${(deal.filledPortions / deal.targetPortions) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-500">
                      <span>{deal.filledPortions}/{deal.targetPortions} Portions</span>
                      <button 
                        onClick={() => joinChamaDealPool(deal.id)}
                        className="px-2 py-1 bg-white text-black font-bold uppercase rounded hover:bg-zinc-200"
                      >
                        Join Pool?
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CATALOG DISPLAY REGION */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Trusted Local Merchants</h3>
                <span className="text-[10px] text-zinc-500 font-mono">Status: SECURE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {vendors.filter(v => v.category === activeCategory && v.approved).map((vendor) => (
                  <div key={vendor.id} className="liquid-glass rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all" onClick={() => setSelectedVendor(vendor)} style={{cursor: 'pointer'}}>
                    <div className="h-28 w-full relative">
                      <img 
                        src={vendor.image} 
                        alt={vendor.name} 
                        className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/400x300/101010/ffffff?text=${encodeURIComponent(vendor.name)}`;
                        }}
                      />
                      <span className="absolute top-2 left-2 bg-black/80 border border-white/20 text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-md">
                        {vendor.badge}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-black text-white truncate">{vendor.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 truncate">{vendor.subType}</p>
                      <div className="flex items-center justify-between mt-3 text-[9px] text-zinc-400 border-t border-white/5 pt-2">
                        <span>Min order: Ksh {vendor.minOrder}</span>
                        <span>{vendor.deliveryTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRIMARY PRODUCT LISTING CARDS */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Available Offers! ({filteredItems.length})</span>
                </h3>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-16 liquid-glass rounded-2xl border border-white/10">
                  <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">No active listings placed in this category pool.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="liquid-glass p-5 rounded-2xl border border-white/5 hover:border-white/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest truncate max-w-37.5">
                            {item.storeName}
                          </span>
                          <span className="bg-white/10 border border-white/20 text-[10px] text-white px-2 py-0.5 rounded-full font-mono uppercase">
                            Ksh {item.price}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white mb-2">{item.name}</h4>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed line-clamp-2">{item.description}</p>
                      </div>

                      <div className="border-t border-white/5 pt-4 mt-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Basket</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
{/* Vendor Products Modal */}
{selectedVendor && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="relative w-full max-w-2xl bg-black/90 liquid-glass p-6 rounded-2xl">
      <button onClick={() => setSelectedVendor(null)} className="absolute top-2 right-2 text-white">
        <X className="w-5 h-5"/>
      </button>
      <h3 className="text-lg font-bold text-white mb-4">{selectedVendor.name} - Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fullMarketplace.filter(item => item.storeName === selectedVendor.name).map(item => (
          <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-white">{item.name}</span>
              <span className="text-xs text-white">Ksh {item.price}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
            <div className="flex mt-2">
              <button onClick={() => addToCart(item)} className="flex-1 mr-1 py-1 bg-white text-black rounded text-xs">Add</button>
              <button onClick={() => removeFromCart(item.id)} className="flex-1 ml-1 py-1 bg-white/10 text-white rounded text-xs">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
      </main>

      {/* FOOTER SERVICE CONSOLE AND GUEST COMMUNICATIONS */}
      <footer className="border-t border-white/10 bg-zinc-950 mt-20 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 text-xs">
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">M&M Help Desk</h4>
            <p className="text-zinc-400 leading-relaxed">
              Facing Payment, Order Issues, Delivery Delays or Any Other Concerns? Fill in for a Help Desk Ticket.
            </p>
          </div>
          <div className="lg:col-span-2">
            <form onSubmit={handleHelpSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Your Name" 
                value={helpName}
                onChange={(e) => setHelpName(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-white" 
              />
              <input 
                type="text" 
                placeholder="Mobile Number" 
                value={helpPhone}
                onChange={(e) => setHelpPhone(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-white" 
              />
              <select
                value={helpTopic}
                onChange={(e) => setHelpTopic(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-white sm:col-span-2"
              >
                <option value="Payment Dispute">Payment Dispute</option>
                <option value="SaaS Subscription">Merchant SaaS Billing</option>
                <option value="Rider Dispatch">Rider Routing Issue</option>
                <option value="General SLA">Other SLA Delay</option>
              </select>
              <textarea 
                placeholder="Describe your issue in detail..." 
                rows={3} 
                value={helpMsg}
                onChange={(e) => setHelpMsg(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-white sm:col-span-2" 
              />
              <button type="submit" className="bg-white text-black font-extrabold uppercase tracking-widest text-xs py-3 rounded-xl sm:col-span-2">
                File For Help Desk Ticket
              </button>
            </form>
          </div>
        </div>
      </footer>

      {/* FLOAT BASKET CONTROLLER */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40">
          <button 
            onClick={() => {
              if (!currentUser) { setIsAuthOpen(true); return; }
              setIsCheckoutOpen(true);
            }}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)]"
          >
            <ShoppingCart className="w-5 h-5" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Review Basket</span>
              <span className="text-xs font-black">Ksh {cartTotal} ({cart.reduce((s, e) => s + e.quantity, 0)} items)</span>
            </div>
            <ArrowRight className="w-4 h-4 ml-2 animate-bounce" />
          </button>
        </div>
      )}

      {/* COOKIES ACCREDITATION DIALOGUE */}
      {cookieConsent === null && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-zinc-950/95 border-t border-white/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-zinc-400">
              We leverage cookies to enhance your browsing experience and provide personalized content. 
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => acceptCookies('rejected')}
                className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-zinc-400"
              >
                Reject
              </button>
              <button 
                onClick={() => acceptCookies('accepted')}
                className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURE ADMIN GATEWAY LOCK PANEL */}
      {isAdminGatewayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="w-full max-w-sm liquid-glass rounded-2xl p-6 border border-white/20 relative">
            <button 
              onClick={() => setIsAdminGatewayOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-2 mb-6">
              <ShieldAlert className="w-10 h-10 text-red-500 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Administrative decryption</h3>
              <p className="text-[11px] text-zinc-500">Provide platform master passkey to unlock.</p>
            </div>
            <form onSubmit={executeAdminGatewayUnlock} className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter password (default: admin254)"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-white/40 text-white font-mono text-center"
              />
              <button 
                type="submit"
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all"
              >
                Verify & Unlock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECURE USER AUTH WINDOW */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-md liquid-glass-heavy rounded-2xl p-6 border border-white/15 relative max-h-[90vh] overflow-auto">
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {authMode === 'login' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-base font-bold uppercase tracking-widest text-white">Ecosystem Authentication</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Authenticate transaction profile credentials safely.</p>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Username</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex Njuguna / Onyinye's Nigerian Dishes"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Email (optional)</label>
                  <input 
                    type="email" 
                    placeholder="e.g. jane@matchmarket.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Mobile Contact</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 0712345678"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter your password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-white text-black font-extrabold uppercase text-xs rounded-xl">
                  Sign In 
                </button>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span onClick={() => setAuthMode('signup')} className="hover:text-white cursor-pointer">Register New Account</span>
                  <span onClick={() => setAuthMode('forgot')} className="hover:text-white cursor-pointer">Recover Account</span>
                </div>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-base font-bold uppercase tracking-widest text-white">Register Account</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Create your profile inside our local marketplace.</p>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Full Name / Merchant Username</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jane Wanjiku"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">M-Pesa Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 0712345678"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. jane@matchmarket.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Create password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Profile Picture URL</label>
                  <input
                    type="url"
                    placeholder="Optional image link"
                    value={profilePhotoUrl}
                    onChange={(e) => setProfilePhotoUrl(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Home / Pickup Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Mavazi Lane, Rongai"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Delivery Point</label>
                  <input
                    type="text"
                    placeholder="e.g. Maasai Lodge Route"
                    value={profileDeliveryPoint}
                    onChange={(e) => setProfileDeliveryPoint(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Profile Bio</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us more about yourself"
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Pickup Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Any extra delivery or pickup instructions"
                    value={profilePickupNote}
                    onChange={(e) => setProfilePickupNote(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Profile Category</label>
                  <select 
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as 'customer' | 'vendor' | 'rider')}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="customer">Customer/User</option>
                    <option value="vendor">Merchant Shop Owner (SaaS)</option>
                    <option value="rider">Boda Delivery Rider</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-white text-black font-extrabold uppercase text-xs rounded-xl">
                  Create Profile
                </button>
                <p className="text-center text-[10px] text-zinc-500">
                  Already registered? <span onClick={() => setAuthMode('login')} className="text-white hover:underline cursor-pointer">Login here</span>
                </p>
              </form>
            )}

            {authMode === 'forgot' && (
              <div className="space-y-4 text-center">
                <Smartphone className="w-8 h-8 mx-auto text-zinc-400" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-white">Account Recovery</h4>
                <p className="text-xs text-zinc-400">
                  Contact the M&M system administrator directly with ownership proof documents to reset your account.
                </p>
                <button onClick={() => setAuthMode('login')} className="w-full py-2.5 bg-white text-black font-bold uppercase text-xs rounded-xl">
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ESCROW HOLDING GATEWAY */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-lg liquid-glass-heavy rounded-3xl p-6 border border-white/10 relative">
            
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full border border-white/10 hover:bg-white/10 text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black tracking-tight uppercase text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-white animate-pulse" />
              <span>Payment Holding Portal</span>
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto mb-6 pr-2">
              {cart.map((entry) => (
                <div key={entry.item.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                  <div>
                    <h4 className="font-bold text-white">{entry.item.name}</h4>
                    <p className="text-[10px] text-zinc-500">{entry.item.storeName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => removeFromCart(entry.item.id)} 
                      className="p-1 rounded-md hover:bg-white/10 text-zinc-400"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono">{entry.quantity}</span>
                    <button 
                      onClick={() => addToCart(entry.item)} 
                      className="p-1 rounded-md hover:bg-white/10 text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-white min-w-12.5 text-right">Ksh {entry.item.price * entry.quantity}</span>
                    <button 
                      onClick={() => clearItemFromCart(entry.item.id)} 
                      className="text-red-500 hover:text-red-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6 border-t border-white/10 pt-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Rongai Delivery Route *
                </label>
                <select
                  value={deliveryPlace}
                  onChange={(e) => setDeliveryPlace(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white"
                >
                  <option value="">-- Choose destination point --</option>
                  <option value="Tuala Route">Tuala (Ksh 150)</option>
                  <option value="Maasai Lodge Route">Maasai Lodge (Ksh 150)</option>
                  <option value="Tumaini Road">Tumaini (Ksh 150)</option>
                  <option value="Kware Stage Route">Kware (Ksh 150)</option>
                  <option value="Rongai Main Stage">Rongai Stage (Ksh 150)</option>
                </select>
              </div>

              {/* Boda-Pooling Split delivery pricing options */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <div>
                      <h4 className="text-[11px] font-bold text-white">Group Order</h4>
                      <p className="text-[9px] text-zinc-500">Wait 10 minutes to split the Ksh 150 shipping route fee with the other users.</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={bodaPoolOption} 
                    onChange={(e) => setBodaPoolOption(e.target.checked)}
                    className="rounded border-zinc-700 bg-black text-white focus:ring-0 focus:ring-offset-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  M-Pesa Payment Code *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 0712345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white"
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 mb-6 text-xs space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Items Subtotal:</span>
                <span>Ksh {cartTotal}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Standard Delivery:</span>
                <span>Ksh {deliveryPlace ? (bodaPoolOption ? 75 : 150) : 0}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm border-t border-white/10 pt-2 mt-2">
                <span>Total Pay:</span>
                <span>Ksh {deliveryPlace ? cartTotal + (bodaPoolOption ? 75 : 150) : cartTotal}</span>
              </div>
            </div>

            <button 
              onClick={triggerMpesaEscrow}
              disabled={isProcessingEscrow}
              className="w-full py-3.5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isProcessingEscrow ? 'Locking PaymentFunds...' : 'Settle Payment on holding'}</span>
            </button>

          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE DASHBOARD SYSTEM */}
      {isDashboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-5xl liquid-glass-heavy rounded-3xl p-6 border border-white/15 relative flex flex-col max-h-[90vh] overflow-hidden">
            
            <button 
              onClick={() => setIsDashboardOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full border border-white/10 hover:bg-white/10 text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-white" />
                <span>M&M Control Center</span>
              </h2>
              <p className="text-[10px] text-zinc-500 tracking-wider">Access local client details, billing profiles, and rider delivery information.</p>
            </div>

            <div className="flex border-b border-white/10 mb-6 overflow-x-auto pb-1 gap-2">
              {[
                { tab: 'customer', title: '1. Customer Portal' },
                { tab: 'vendor', title: '2. Vendor Hub(SaaS)' },
                { tab: 'rider', title: '3. M&M Delivery' },
                ...(currentUser && currentUser.role === 'admin' ? [{ tab: 'admin', title: '4. Admin Office' }] : [])
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    setDashboardTab(item.tab as 'customer' | 'vendor' | 'rider' | 'admin');
                    setProfileReturnTab(item.tab as 'customer' | 'vendor' | 'rider' | 'admin');
                  }}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    dashboardTab === item.tab 
                      ? 'bg-white text-black shadow-lg' 
                      : 'bg-zinc-950 text-zinc-500 hover:text-white border border-white/5'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-6">
              <div className="liquid-glass p-5 rounded-2xl border border-white/10 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xs font-extrabold tracking-widest uppercase text-white">My Profile Settings</h3>
                  <p className="text-[10px] text-zinc-400">Update your account details and delivery preferences.</p>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Logged in as {currentUser?.username}</span>
              </div>
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    placeholder="0712345678"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Profile Picture URL</label>
                  <input
                    type="url"
                    placeholder="Image link (optional)"
                    value={profilePhotoUrl}
                    onChange={(e) => setProfilePhotoUrl(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Home / Pickup Address</label>
                  <input
                    type="text"
                    placeholder="12 Mavazi Lane, Rongai"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Delivery Point</label>
                  <input
                    type="text"
                    placeholder="Maasai Lodge Route"
                    value={profileDeliveryPoint}
                    onChange={(e) => setProfileDeliveryPoint(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Profile Bio</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us more about yourself"
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Pickup Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Any extra delivery or pickup instructions"
                    value={profilePickupNote}
                    onChange={(e) => setProfilePickupNote(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-black font-bold uppercase text-xs rounded-xl hover:bg-zinc-200 transition-all"
                  >
                    {profileSaveLoading ? 'Updating Profile...' : 'Update Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardTab(profileReturnTab)}
                    className="w-full py-2.5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Back to previous view
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              {dashboardTab === 'customer' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white">Messages & Notifications</h3>
                      <p className="text-[10px] text-zinc-400">Your customer messages, support ticket activity, and system notifications.</p>
                      {!currentUser ? (
                        <p className="text-xs text-zinc-500">Sign in to view your support inbox and notifications.</p>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 text-[10px] text-zinc-400">
                            <div className="flex justify-between mb-2">
                              <span>Unread</span>
                              <span className="font-bold text-white">{notifications.filter((note) => note.userId === currentUser.id && !note.read).length}</span>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {notifications.filter((note) => note.userId === currentUser.id).map((note) => (
                                <div key={note.id} className={`rounded-xl p-2 ${note.read ? 'bg-white/5 text-zinc-300' : 'bg-white text-black'}`}>
                                  <div className="text-[9px] uppercase tracking-widest text-zinc-400">{note.type}</div>
                                  <div className="text-[11px] font-bold">{note.content}</div>
                                  <div className="text-[8px] uppercase tracking-wider text-zinc-500 mt-1">{note.createdAt}</div>
                                </div>
                              ))}
                              {notifications.filter((note) => note.userId === currentUser.id).length === 0 && (
                                <p className="text-xs text-zinc-500">No notifications yet.</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setNotifications(notifications.map((note) => note.userId === currentUser.id ? { ...note, read: true } : note))}
                            className="w-full py-2 rounded-xl bg-white text-black uppercase text-[10px] font-bold hover:bg-zinc-200 transition-all"
                          >
                            Mark all read
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3 lg:col-span-2">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white">Support Chat Space</h3>
                      <p className="text-[10px] text-zinc-400">Review past inquiries and admin replies here.</p>
                      {!currentUser ? (
                        <p className="text-xs text-zinc-500">Sign in to view your chat history.</p>
                      ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {inquiries.filter((inq) => inq.userId === currentUser.id || inq.phone === currentUser.phone).map((inq) => (
                            <div key={inq.id} className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                              <div className="flex justify-between items-center text-[10px] text-zinc-500">
                                <span>{inq.topic}</span>
                                <span className="uppercase tracking-widest">{inq.status}</span>
                              </div>
                              <p className="text-xs text-zinc-400 italic">Customer: {inq.message}</p>
                              {inq.adminResponse ? (
                                <div className="bg-white/5 p-3 rounded-xl">
                                  <div className="text-[10px] uppercase tracking-widest text-zinc-400">Admin Reply</div>
                                  <p className="text-xs text-white">{inq.adminResponse}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-zinc-500">No admin response yet.</p>
                              )}
                            </div>
                          ))}
                          {inquiries.filter((inq) => inq.userId === currentUser.id || inq.phone === currentUser.phone).length === 0 && (
                            <p className="text-xs text-zinc-500">You have no support chats yet. Use the help desk to create a ticket.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="liquid-glass p-5 rounded-2xl border border-white/10">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white mb-3">Live Payment Records</h3>
                      <div className="space-y-4">
                        {escrowLedger.length === 0 ? (
                          <p className="text-xs text-zinc-500">No active holding transactions recorded.</p>
                        ) : (
                          escrowLedger.map((tx) => (
                            <div key={tx.id} className="p-3 rounded-xl bg-black border border-white/5 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-mono text-zinc-400 font-bold">{tx.orderId}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  tx.status === 'Holding' ? 'bg-zinc-850 text-white border border-white/20' : 'bg-white text-black font-extrabold'
                                }`}>
                                  {tx.status}
                                </span>
                              </div>
                              <p className="text-xs font-semibold">{tx.vendorName}</p>
                              <div className="flex justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-2">
                                <span>Payer: {tx.payer}</span>
                                <span className="text-white font-mono font-bold">Ksh {tx.amount}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white">Interactive Soko Chama Bulk Buying</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Chama wholesale group buying structures are checked, packaged, and mapped to local transit depots.
                      </p>
                      {bodaPoolWindow !== null && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs flex justify-between items-center">
                          <span>Active Boda-Pooling window is running:</span>
                          <span className="font-bold font-mono">{bodaPoolWindow} min left</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* RESTRICTED VENDOR ONBOARDING SCREEN (Resolves image_964950.png) */}
              {dashboardTab === 'vendor' && (
                <div>
                  {!hasVendorHubAccess ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
                        <div>
                          <h3 className="text-xs font-extrabold tracking-widest uppercase text-white mb-1">Onboard Merchant Shop (SaaS)</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Verification Subscription: Ksh 300 / Month</p>
                        </div>

                        <form onSubmit={handleVendorRegisterSubmit} className="space-y-4">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Store Name *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Rongai Fast Food"
                              value={regShopName}
                              onChange={(e) => setRegShopName(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">SaaS Category *</label>
                            <select
                              value={regCategory}
                              onChange={(e) => setRegCategory(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            >
                              <option value="Food & Beverages">Food & Beverages</option>
                              <option value="M & M Soko">M & M Soko (Groceries)</option>
                              <option value="M & M Services">M & M Services</option>
                              <option value="M & M Fun Zone">M & M Fun Zone</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Contact Phone *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 0711223344"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Password *</label>
                              <input 
                                type="password" 
                                placeholder="Create dashboard password"
                                value={regShopPassword}
                                onChange={(e) => setRegShopPassword(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Confirm Password *</label>
                              <input 
                                type="password" 
                                placeholder="Confirm password"
                                value={regShopConfirmPassword}
                                onChange={(e) => setRegShopConfirmPassword(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                              />
                            </div>
                          </div>

                          <button type="submit" className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all">
                            complete?
                          </button>
                        </form>
                      </div>

                      <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
                        <h3 className="text-xs font-extrabold tracking-widest uppercase text-white">Your Listed Catalog & Ads</h3>
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                          {customMarketplace.map((item) => (
                            <div key={item.id} className="p-3 bg-black rounded-lg border border-white/5 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-white">{item.name}</p>
                                <p className="text-[9px] text-zinc-500">Ksh {item.price}</p>
                              </div>
                              <button 
                                onClick={() => purchaseAdBanner(item.id)}
                                className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-[9px] rounded-lg tracking-wider transition-colors"
                              >
                                Full KenChic Chicken (Ksh 500)
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
                        <div>
                          <h3 className="text-xs font-extrabold tracking-widest uppercase text-white mb-1">Upload New Product</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Add items to your marketplace catalog</p>
                        </div>

                        <form onSubmit={handleCustomProductUpload} className="space-y-4">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Product Title *</label>
                            <input
                              type="text"
                              placeholder="e.g. Beef Pilau Royal"
                              value={newProductTitle}
                              onChange={(e) => setNewProductTitle(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Price (Ksh) *</label>
                              <input
                                type="number"
                                placeholder="e.g. 250"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Category *</label>
                              <select
                                value={newProductCategory}
                                onChange={(e) => setNewProductCategory(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                              >
                                <option value="Food & Beverages">Food & Beverages</option>
                                <option value="M & M Soko">M & M Soko (Groceries)</option>
                                <option value="M & M Services">M & M Services</option>
                                <option value="M & M Fun Zone">M & M Fun Zone</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Store Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Yusuf Dishes (Rongai Stage)"
                              value={newProductStore}
                              onChange={(e) => setNewProductStore(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Description</label>
                            <textarea
                              placeholder="Short description of the product..."
                              value={newProductDesc}
                              onChange={(e) => setNewProductDesc(e.target.value)}
                              rows={3}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white resize-none"
                            />
                          </div>

                          <button type="submit" className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all">
                            Publish Product
                          </button>
                        </form>
                      </div>

                      <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
                        <h3 className="text-xs font-extrabold tracking-widest uppercase text-white">Your Listed Catalog & Ads</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {customMarketplace.map((item) => (
                            <div key={item.id} className="p-3 bg-black rounded-lg border border-white/5 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-white">{item.name}</p>
                                <p className="text-[9px] text-zinc-500">Ksh {item.price} · {item.storeName}</p>
                              </div>
                              <button
                                onClick={() => purchaseAdBanner(item.id)}
                                className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-[9px] rounded-lg tracking-wider transition-colors"
                              >
                                Feature Ad (Ksh 500)
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RESTRICTED RIDER ONBOARDING SCREEN (Resolves image_9649aa.png) */}
              {dashboardTab === 'rider' && (
                <div>
                  {!hasRiderTransitAccess ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
                        <div>
                          <h3 className="text-xs font-extrabold tracking-widest uppercase text-white mb-1">Rider Transit Enrollment</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">License Entry: Ksh 500 Setup</p>
                        </div>

                        <form onSubmit={handleRiderRegisterSubmit} className="space-y-4">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Rider Full Name *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Alex Njuguna"
                              value={regRiderName}
                              onChange={(e) => setRegRiderName(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Motorcycle Plate *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. KMCE 224Y"
                              value={regPlate}
                              onChange={(e) => setRegPlate(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Contact Phone *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 0799887766"
                              value={regRiderPhone}
                              onChange={(e) => setRegRiderPhone(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Password *</label>
                              <input 
                                type="password" 
                                placeholder="Create password"
                                value={regRiderPassword}
                                onChange={(e) => setRegRiderPassword(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Confirm Password *</label>
                              <input 
                                type="password" 
                                placeholder="Confirm password"
                                value={regRiderConfirmPassword}
                                onChange={(e) => setRegRiderConfirmPassword(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/40 text-white"
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all"
                          >
                            Complete
                          </button>
                        </form>
                      </div>

                      {/* Restricted Overlay - Solves side-by-side display issue from image_9649aa.png */}
                      <div className="liquid-glass rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 z-10">
                          <Lock className="w-12 h-12 text-zinc-500 animate-pulse" />
                          <h4 className="text-sm font-bold uppercase text-white">Live Delivery Order</h4>
                          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                            Rider identification screening in progress. Awaiting transit permit clearance to unlock delivery details, THANK YOU for your patience.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Fully Approved Rider Dispatch Board */
                    <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-4">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white">Live Delivery Order Desk</h3>
                      <div className="space-y-4 max-h-87.5 overflow-y-auto pr-2">
                        {deliveryFleet.map((job) => (
                          <div key={job.id} className="p-4 rounded-xl bg-black border border-white/5 space-y-3">
                            <div className="flex justify-between items-start text-xs">
                              <div>
                                <h4 className="font-extrabold text-white">{job.destination}</h4>
                                <p className="text-[10px] text-zinc-500">Merchant: {job.merchantName}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                job.status === 'Available' ? 'bg-zinc-850 text-white' : 'bg-white text-black'
                              }`}>
                                {job.status}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-400 font-mono">Items: {job.itemsSummary}</p>

                            <div className="flex justify-between items-center text-[11px] text-zinc-400 border-t border-white/5 pt-2">
                              <span>Transit Fee: <span className="text-white font-bold font-mono">Ksh {job.fee}</span></span>
                              
                              {job.status === 'Available' && (
                                <button
                                  onClick={() => claimDeliveryJob(job.id, currentUser?.username || 'Rider')}
                                  className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase rounded-lg"
                                >
                                  Claim Job
                                </button>
                              )}

                              {job.status === 'Assigned' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-500">Claimed by you</span>
                                  <button
                                    onClick={() => setJobPickedUp(job.id)}
                                    className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase rounded-lg"
                                  >
                                    Confirm Pick Up
                                  </button>
                                </div>
                              )}

                              {job.status === 'Picked Up' && (
                                <div className="flex items-center gap-3 w-full justify-between mt-2 border-t border-white/5 pt-2">
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="Ask client for Order Release OTP"
                                      value={enteredOtp[job.id] || ''}
                                      onChange={(e) => setEnteredOtp({ ...enteredOtp, [job.id]: e.target.value })}
                                      className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white font-mono text-center w-28"
                                    />
                                    <button
                                      onClick={() => verifyTransitHandshake(job.id, job.orderId)}
                                      className="px-2.5 py-1 bg-white text-black text-[9px] font-bold uppercase rounded"
                                    >
                                      Verify
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADMINISTRATIVE ACCESS ROOM */}
              {dashboardTab === 'admin' && currentUser && currentUser.role === 'admin' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white border-b border-white/5 pb-2">
                        Merchant Applications ({vendorApprovals.filter(r => r.status === 'Pending').length})
                      </h3>
                      
                      <div className="space-y-3 max-h-62.5 overflow-y-auto">
                        {vendorApprovals.map((req) => (
                          <div key={req.id} className="p-3 rounded-xl bg-black border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <h4 className="font-bold text-white">{req.shopName}</h4>
                              <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded">{req.status}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono">Category: {req.category} | Tel: {req.phone}</p>
                            
                            {req.status === 'Pending' && (
                              <div className="flex gap-2 justify-end pt-1">
                                <button
                                  onClick={() => approveVendorRequest(req)}
                                  className="px-2.5 py-1 bg-white text-black rounded text-[9px] font-extrabold uppercase"
                                >
                                  Grant SaaS Permit
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white border-b border-white/5 pb-2">
                        Rider Licenses ({riderApprovals.filter(r => r.status === 'Pending').length})
                      </h3>

                      <div className="space-y-3 max-h-62.5 overflow-y-auto">
                        {riderApprovals.map((req) => (
                          <div key={req.id} className="p-3 rounded-xl bg-black border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <h4 className="font-bold text-white">{req.riderName}</h4>
                              <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded">{req.status}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono">Plate: {req.motorcyclePlate} | Tel: {req.phone}</p>

                            {req.status === 'Pending' && (
                              <div className="flex gap-2 justify-end pt-1">
                                <button
                                  onClick={() => approveRiderRequest(req)}
                                  className="px-2.5 py-1 bg-white text-black rounded text-[9px] font-extrabold uppercase w-full"
                                >
                                  Approve Rider
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
                      <h3 className="text-xs font-extrabold tracking-widest uppercase text-white border-b border-white/5 pb-2">
                        Platform Store Approval
                      </h3>
                      <div className="space-y-3 max-h-62.5 overflow-y-auto">
                        {vendors.map((v) => {
                          const isBanned = bannedVendors.includes(v.name);
                          return (
                            <div key={v.id} className="flex justify-between items-center p-2 rounded-xl bg-black border border-white/5 text-xs">
                              <span className="truncate max-w-30 font-medium">{v.name}</span>
                              <button
                                onClick={() => toggleBanVendor(v.name)}
                                className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  isBanned ? 'bg-white text-black' : 'bg-red-950 text-red-400'
                                }`}
                              >
                                {isBanned ? 'Lift Ban' : 'De-authorize'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
                    <h3 className="text-xs font-extrabold tracking-widest uppercase text-white border-b border-white/5 pb-2">
                      Escrow & Delivery Release Queue
                    </h3>
                    <div className="space-y-3 max-h-62.5 overflow-y-auto">
                      {escrowLedger.filter(tx => tx.status === 'Holding').length === 0 ? (
                        <p className="text-xs text-zinc-500">No escrow funds are awaiting release at the moment.</p>
                      ) : (
                        escrowLedger.filter(tx => tx.status === 'Holding').map((tx) => (
                          <div key={tx.id} className="p-3 rounded-xl bg-black border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{tx.orderId}</span>
                              <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded">{tx.vendorName}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500">
                              <span>Payer: {tx.payer}</span>
                              <span className="text-white font-bold">Ksh {tx.amount}</span>
                            </div>
                            <button
                              onClick={() => releaseEscrowForAdmin(tx.orderId)}
                              className="w-full py-2 bg-white text-black rounded text-[9px] font-extrabold uppercase"
                            >
                              Release Order Funds
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* CUSTOM HELP Desk communication streams */}
                  <div className="liquid-glass p-5 rounded-2xl border border-white/10 mt-6">
                    <h3 className="text-xs font-extrabold tracking-widest uppercase text-white border-b border-white/5 pb-2 mb-3">
                      Customer Support Communications ({inquiries.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inquiries.map((inq) => (
                        <div key={inq.id} className="p-3 rounded-xl bg-black border border-white/5 space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500">
                            <span>Client: <span className="text-white font-bold">{inq.name}</span> ({inq.phone})</span>
                            <span>{inq.timestamp}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-white">
                            <span>Topic: {inq.topic}</span>
                            <span className="text-zinc-400">{inq.status}</span>
                          </div>
                          <p className="text-xs text-zinc-400 bg-zinc-950 p-2 rounded-lg italic">
                            "{inq.message}"
                          </p>
                          {inq.adminResponse && (
                            <div className="bg-white/5 p-3 rounded-xl text-xs text-white">
                              <div className="font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin Response</div>
                              {inq.adminResponse}
                            </div>
                          )}
                          {inq.status !== 'Answered' && (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                placeholder="Write a reply to the customer"
                                value={adminReplyText[inq.id] || ''}
                                onChange={(e) => setAdminReplyText({ ...adminReplyText, [inq.id]: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                              />
                              <button
                                onClick={() => handleAdminReply(inq.id)}
                                className="w-full py-2 rounded-xl bg-white text-black uppercase text-[9px] font-bold hover:bg-zinc-200 transition-all"
                              >
                                Reply to inquiry
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
