import { prisma } from "../../lib/prisma";

// Admin: bulk add links to a product
export const bulkAddLinks = async (productId: string, urls: string[]) => {
  // Verify product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const data = urls
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .map((url) => ({ url, productId }));

  if (data.length === 0) {
    const error: any = new Error("No valid links provided");
    error.statusCode = 400;
    throw error;
  }

  await prisma.link.createMany({ data });

  return { added: data.length };
};

// Admin: get all links for a product
export const getLinksByProduct = async (productId: string) => {
  const links = await prisma.link.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
  return links;
};

// Admin: delete a single link
export const deleteLink = async (id: string) => {
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) {
    const error: any = new Error("Link not found");
    error.statusCode = 404;
    throw error;
  }
  if (link.isUsed) {
    const error: any = new Error("Cannot delete a link that has already been used");
    error.statusCode = 400;
    throw error;
  }
  return prisma.link.delete({ where: { id } });
};

// Admin: delete all unused links for a product
export const deleteAllUnusedLinks = async (productId: string) => {
  const result = await prisma.link.deleteMany({
    where: { productId, isUsed: false },
  });
  return { deleted: result.count };
};
