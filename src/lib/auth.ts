import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function verifyAuth(requiredPermission?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
      name: string;
    };

    await dbConnect();
    const user = await User.findById(decoded.userId).lean();

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    if (requiredPermission && user.role !== 'SUPER_ADMIN') {
      if (!user.permissions || !user.permissions.includes(requiredPermission)) {
        return null;
      }
    }

    return {
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      permissions: user.permissions || [],
    };
  } catch {
    return null;
  }
}
