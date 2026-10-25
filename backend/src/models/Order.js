import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    studentId: { type: String, trim: true, maxlength: 40 },
    contactInfo: { type: String, trim: true, maxlength: 30 },
    orderType: { type: String, enum: ['Dine-in', 'Parcel'], default: 'Dine-in' },
    items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
