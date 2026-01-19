// User Types
export type User = {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
};

// SOS and Emergency Types
export type SOSIncidentType = 'normal' | 'sensitive' | 'test' | 'medical' | 'crime' | 'fire';

export type SOSAlert = {
  id: string;
  userId: string;
  incidentType: SOSIncidentType;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  status: 'active' | 'responding' | 'resolved' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

export type EmergencyContact = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary: boolean;
  createdAt: string;
};

export type PersonalEmergencyInfo = {
  id: string;
  userId: string;
  medicalConditions?: string;
  allergies?: string;
  bloodType?: string;
  emergencyInsurance?: string;
  insuranceNumber?: string;
  doctorName?: string;
  doctorPhone?: string;
  createdAt: string;
  updatedAt: string;
};

// Location Sharing Types
export type LocationShare = {
  id: string;
  userId: string;
  sharedWithUserId: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
  expiresAt?: string;
  isActive: boolean;
};

export type SmartAlert = {
  id: string;
  userId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radius: number;
  alertType: 'arrival' | 'departure';
  sharedWithUserIds: string[];
  isActive: boolean;
};

// Community Types
export type Community = {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  memberCount: number;
  createdBy: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  latitude: number;
  longitude: number;
  mediaUrls?: string[];
  likes: number;
  comments: number;
  isAnonymous?: boolean;
  createdAt: string;
};

export type CommunityMembership = {
  id: string;
  userId: string;
  communityId: string;
  joinedAt: string;
};

// Chat Types
export type ChatMessage = {
  id: string;
  alertId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
};

// Auth Types
export type AuthState = {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: User | null;
};

export type AuthContextType = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
};
