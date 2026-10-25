import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
    popular: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    preparationTime: { type: Number, required: true, min: 1, max: 240 },
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
