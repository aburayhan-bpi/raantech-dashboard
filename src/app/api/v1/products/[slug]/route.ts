import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';
import slugify from 'slugify';
import { PRODUCT_STATUSES, PRODUCT_UNITS } from '@/types/backend';

const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  
  buyingPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  discountPrice: z.number().optional(),
  tax: z.number().optional(),
  
  stock: z.number().min(0).optional(),
  alertQuantity: z.number().optional(),
  unit: z.enum([...PRODUCT_UNITS] as [string, ...string[]]).optional(),
  
  sku: z.string().optional(),
  barcode: z.string().optional(),
  
  images: z.array(z.string()).optional(),
  
  status: z.enum([...PRODUCT_STATUSES] as [string, ...string[]]).optional(),
  tags: z.array(z.string()).optional(),
  isDeleted: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await verifyAuth('products:view');
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    await dbConnect();
    const { slug } = await params;

    const product = await Product.findOne({ slug })
      .populate('category', 'name slug')
      .populate('createdBy', 'name email');

    if (!product) {
      return ApiResponse.error('Product not found', 404);
    }

    return ApiResponse.success(product, 'Product retrieved successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await verifyAuth('products:update');
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    const { slug } = await params;
    const body = await req.json();
    const validatedData = ProductUpdateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();

    const existingProduct = await Product.findOne({ slug });
    if (!existingProduct) {
      return ApiResponse.error('Product not found', 404);
    }

    // Check SKU/Barcode uniqueness if provided
    const { sku, barcode, name } = validatedData.data;
    if (sku || barcode) {
      const duplicateProduct = await Product.findOne({
        _id: { $ne: existingProduct._id },
        $or: [
          ...(sku ? [{ sku }] : []),
          ...(barcode ? [{ barcode }] : [])
        ]
      });
      
      if (duplicateProduct) {
        if (duplicateProduct.sku === sku) return ApiResponse.error('SKU already exists', 409);
        if (duplicateProduct.barcode === barcode) return ApiResponse.error('Barcode already exists', 409);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...validatedData.data };
    
    // Regenerate slug if name is changed
    if (name && name !== existingProduct.name) {
      const baseSlug = slugify(name, { lower: true, strict: true });
      let uniqueSlug = baseSlug;
      let counter = 1;
      
      while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: existingProduct._id } })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = uniqueSlug;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      user: auth.userId,
      action: 'UPDATED',
      entityType: 'PRODUCT',
      entityId: existingProduct._id,
      details: `Updated product: ${updatedProduct.name}`,
    });

    return ApiResponse.success(updatedProduct, 'Product updated successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check if it's a hard delete request
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Different permission for hard delete
    const requiredPermission = hardDelete ? 'products:hard_delete' : 'products:delete';
    const auth = await verifyAuth(requiredPermission);
    
    if (!auth) {
      return ApiResponse.error(`Unauthorized. Requires ${requiredPermission} permission.`, 401);
    }

    await dbConnect();
    const existingProduct = await Product.findOne({ slug });
    
    if (!existingProduct) {
      return ApiResponse.error('Product not found', 404);
    }

    if (hardDelete) {
      await Product.findByIdAndDelete(existingProduct._id);
      
      await ActivityLog.create({
        user: auth.userId,
        action: 'DELETED',
        entityType: 'PRODUCT',
        entityId: existingProduct._id,
        details: `Permanently deleted product: ${existingProduct.name}`,
      });
      
      return ApiResponse.success(null, 'Product permanently deleted');
    } else {
      // Soft Delete
      existingProduct.isDeleted = true;
      existingProduct.deletedAt = new Date();
      await existingProduct.save();
      
      await ActivityLog.create({
        user: auth.userId,
        action: 'DELETED',
        entityType: 'PRODUCT',
        entityId: existingProduct._id,
        details: `Soft deleted product: ${existingProduct.name}`,
      });
      
      return ApiResponse.success(null, 'Product moved to trash');
    }
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
