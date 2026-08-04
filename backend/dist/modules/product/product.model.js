import mongoose, { Schema, } from "mongoose";
export var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "ACTIVE";
    ProductStatus["DRAFT"] = "DRAFT";
    ProductStatus["ARCHIVED"] = "ARCHIVED";
})(ProductStatus || (ProductStatus = {}));
export var ProductCategory;
(function (ProductCategory) {
    ProductCategory["Tote Bag"] = "Tote Bag";
})(ProductCategory || (ProductCategory = {}));
// 3. Typings passed into Schema: <DocType, Model, InstanceMethods, Virtuals>
const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    shortDescription: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    material: {
        type: String,
        required: true,
        trim: true,
    },
    productCategory: {
        type: String,
        enum: Object.values(ProductCategory),
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        default: "DesiTotes",
        trim: true,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    /* Pricing */
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discountPrice: {
        type: Number,
        min: 0,
        required: true // Or whatever your requirement is, without the custom validate block
    },
    costPrice: {
        type: Number,
        min: 0,
        default: 0,
    },
    gstPercentage: {
        type: Number,
        required: true,
        default: 18,
        min: 0,
        max: 100,
    },
    /* Inventory */
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
    },
    lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    /* Shipping */
    weight: {
        type: Number,
        required: true,
        min: 0,
    },
    dimensions: {
        length: {
            type: Number,
            required: true,
            min: 0,
        },
        breadth: {
            type: Number,
            required: true,
            min: 0,
        },
        height: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    hsnCode: {
        type: String,
        trim: true,
    },
    /* Media */
    thumbnail: {
        type: String,
        required: true,
        trim: true,
    },
    images: [
        {
            type: String,
            trim: true,
        },
    ],
    /* SEO */
    seoTitle: {
        type: String,
        trim: true,
    },
    seoDescription: {
        type: String,
        trim: true,
    },
    /* Flags */
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    /* Status */
    status: {
        type: String,
        enum: Object.values(ProductStatus),
        default: ProductStatus.ACTIVE,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});
/* Indexes */
productSchema.index({
    title: "text",
    description: "text",
});
productSchema.index({
    category: 1,
});
productSchema.index({
    status: 1,
});
productSchema.index({
    isFeatured: 1,
});
productSchema.index({
    createdAt: -1,
});
/* Virtuals */
productSchema.virtual("discountPercentage").get(function () {
    if (!this.discountPrice ||
        this.price <= 0) {
        return 0;
    }
    return Math.round(((this.price -
        this.discountPrice) /
        this.price) *
        100);
});
// 4. Ensure the Model understands the virtual definitions as well
const Product = mongoose.models.Product ||
    mongoose.model("Product", productSchema);
export default Product;
//# sourceMappingURL=product.model.js.map