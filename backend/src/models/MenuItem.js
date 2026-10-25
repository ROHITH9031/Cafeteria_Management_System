import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 25 },
    dietaryTags: {
      type: [{ type: String, enum: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Contains-eggs', 'Contains-nuts'] }],
      default: [],
    },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
    popular: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    preparationTime: { type: Number, required: true, min: 1, max: 240 },
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1, name: 1 });
menuItemSchema.index({ available: 1, category: 1, name: 1 });
menuItemSchema.index({ dietaryTags: 1, category: 1, price: 1 });

export default mongoose.model('MenuItem', menuItemSchema);
