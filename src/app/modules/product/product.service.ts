import { prisma } from "../../lib/prisma";
import { CreateProductInput, UpdateProductInput } from "./product.validation";

// Public: only published products with available link count
export const getPublishedProducts = async () => {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: {
      _count: {
        select: { links: { where: { isUsed: false } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    ...p,
    availableQty: p._count.links,
    _count: undefined,
  }));
};

// Public: single product detail
export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: { links: { where: { isUsed: false } } },
      },
    },
  });

  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (!product.isPublished) {
    const error: any = new Error("Product not available");
    error.statusCode = 404;
    throw error;
  }

  return { ...product, availableQty: product._count.links, _count: undefined };
};

// Admin: all products with link counts
export const getAllProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: {
          links: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    ...p,
    totalLinks: p._count.links,
    totalOrders: p._count.orders,
    _count: undefined,
  }));
};

export const createProduct = async (data: CreateProductInput) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  await findProductOrThrow(id);
  return prisma.product.update({ where: { id }, data });
};

export const togglePublish = async (id: string) => {
  const product = await findProductOrThrow(id);
  return prisma.product.update({
    where: { id },
    data: { isPublished: !product.isPublished },
  });
};

export const deleteProduct = async (id: string) => {
  await findProductOrThrow(id);
  return prisma.product.delete({ where: { id } });
};

// Helper
const findProductOrThrow = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
};
