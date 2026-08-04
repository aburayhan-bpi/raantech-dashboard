import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { TPermission } from '@/types/global';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function verifyAuth(requiredPermission?: TPermission) {
  const cookieStore = await cookies();
  let token = cookieStore.get('auth_token')?.value;

  if (!token) {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

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
