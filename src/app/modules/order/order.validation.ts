import { z } from "zod";

export const placeOrderSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  senderNumber: z.string().min(1, "Sender number is required"),
  amountPaid: z.number().positive("Amount paid must be positive"),
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET", "BANK"]),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
