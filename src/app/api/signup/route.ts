import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Apify API configuration
const APIFY_TOKEN = process.env.APIFY_TOKEN!;
const KV_STORE_NAME = 'forage-users';

// Generate a unique API key for the user
function generateApiKey(): string {
  return `forg_${crypto.randomBytes(24).toString('hex')}`;
}

// Generate a unique user ID
function generateUserId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Hash email for privacy (used as key in KV store)
function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

interface UserData {
  userId: string;
  email: string;
  apiKey: string;
  credits: number;
  createdAt: string;
  lastActive: string;
  usageHistory: Array<{
    date: string;
    tool: string;
    cost: number;
  }>;
}

async function getOrCreateKvStore(): Promise<string> {
  // Try to get existing store
  const listRes = await fetch(
    `https://api.apify.com/v2/key-value-stores?token=${APIFY_TOKEN}&unnamed=false`,
    { method: 'GET' }
  );

  if (listRes.ok) {
    const stores = await listRes.json();
    const existing = stores.data?.items?.find((s: any) => s.name === KV_STORE_NAME);
    if (existing) {
      return existing.id;
    }
  }

  // Create new store
  const createRes = await fetch(
    `https://api.apify.com/v2/key-value-stores?token=${APIFY_TOKEN}&name=${KV_STORE_NAME}`,
    { method: 'POST' }
  );

  if (!createRes.ok) {
    throw new Error('Failed to create KV store');
  }

  const newStore = await createRes.json();
  return newStore.data.id;
}

async function getUserByEmail(storeId: string, emailHash: string): Promise<UserData | null> {
  const res = await fetch(
    `https://api.apify.com/v2/key-value-stores/${storeId}/records/${emailHash}?token=${APIFY_TOKEN}`,
    { method: 'GET' }
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }

  return await res.json();
}

async function saveUser(storeId: string, emailHash: string, userData: UserData): Promise<void> {
  const res = await fetch(
    `https://api.apify.com/v2/key-value-stores/${storeId}/records/${emailHash}?token=${APIFY_TOKEN}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }
  );

  if (!res.ok) {
    throw new Error('Failed to save user');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!APIFY_TOKEN) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const emailHash = hashEmail(email);
    const storeId = await getOrCreateKvStore();

    // Check if user already exists
    const existingUser = await getUserByEmail(storeId, emailHash);

    if (existingUser) {
      // User already exists - return their info (masked API key)
      return NextResponse.json({
        success: true,
        message: 'Welcome back!',
        isNewUser: false,
        userId: existingUser.userId,
        credits: existingUser.credits,
        apiKey: existingUser.apiKey.slice(0, 12) + '...' + existingUser.apiKey.slice(-4),
        // Send full key only once on first signup - for returning users, they need to use "forgot key"
      });
    }

    // Create new user with $1.00 credit
    const newUser: UserData = {
      userId: generateUserId(),
      email: email.toLowerCase().trim(),
      apiKey: generateApiKey(),
      credits: 1.00, // $1.00 free credit
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      usageHistory: [],
    };

    await saveUser(storeId, emailHash, newUser);

    // Return success with full API key (only shown once!)
    return NextResponse.json({
      success: true,
      message: 'Welcome to Forage! Your $1.00 credit is ready.',
      isNewUser: true,
      userId: newUser.userId,
      credits: newUser.credits,
      apiKey: newUser.apiKey, // Full key shown only on first signup
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
