import { prisma } from "../../lib/prisma";

export const getPaymentSettings = async () => {
  return prisma.paymentSetting.findMany({ where: { isActive: true } });
};

export const getAllPaymentSettings = async () => {
  return prisma.paymentSetting.findMany({ orderBy: { createdAt: "desc" } });
};

export const createPaymentSetting = async (data: {
  method: string;
  number: string;
  qrImageUrl?: string;
}) => {
  return prisma.paymentSetting.create({ data });
};

export const updatePaymentSetting = async (
  id: string,
  data: { method?: string; number?: string; qrImageUrl?: string; isActive?: boolean }
) => {
  const existing = await prisma.paymentSetting.findUnique({ where: { id } });
  if (!existing) {
    const error: any = new Error("Payment setting not found");
    error.statusCode = 404;
    throw error;
  }
  return prisma.paymentSetting.update({ where: { id }, data });
};

export const deletePaymentSetting = async (id: string) => {
  const existing = await prisma.paymentSetting.findUnique({ where: { id } });
  if (!existing) {
    const error: any = new Error("Payment setting not found");
    error.statusCode = 404;
    throw error;
  }
  return prisma.paymentSetting.delete({ where: { id } });
};
