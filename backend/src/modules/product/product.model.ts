import mongoose, {
    Schema,
    Document,
    Model,
} from "mongoose";

export enum ProductStatus {
    ACTIVE = "ACTIVE",
    DRAFT = "DRAFT",
    ARCHIVED = "ARCHIVED",
}

export enum ProductCategory {
    "Tote Bag" = "Tote Bag",
}

export interface IProductDimensions {
    length: number;
    breadth: number;
    height: number;
}

// 1. Core Database Document Interface (Removed discountPercentage from here)
export interface IProduct extends Document {
    title: string;
    slug: string;
    shortDescription: string;
    description: string;

    color: string;
    material: string;
    productCategory: ProductCategory;

    brand: string;
    tags: string[];

    price: number;
    discountPrice: number;
    costPrice?: number;
    gstPercentage: number;

    averageRating: number; // 0 if no reviews yet
    reviewCount: number;

    stock: number;
    sku?: string;
    lowStockThreshold: number;

    weight: number;

    dimensions: IProductDimensions;

    hsnCode?: string;

    thumbnail: string;
    images: string[];

    seoTitle?: string;
    seoDescription?: string;

    isFeatured: boolean;
    isPublished: boolean;

    status: ProductStatus;

    createdAt: Date;
    updatedAt: Date;
}

// 2. Separate interface specifically for your virtual properties
interface IProductVirtuals {
    discountPercentage: number;
}

// 3. Typings passed into Schema: <DocType, Model, InstanceMethods, Virtuals>
const productSchema = new Schema<IProduct, {}, {}, IProductVirtuals>(
    {
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
            enum: Object.values(
                ProductCategory
            ),
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
            enum: Object.values(
                ProductStatus
            ),
            default: ProductStatus.ACTIVE,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

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

productSchema.virtual(
    "discountPercentage"
).get(function (
    this: IProduct
) {
    if (
        !this.discountPrice ||
        this.price <= 0
    ) {
        return 0;
    }

    return Math.round(
        ((this.price -
            this.discountPrice) /
            this.price) *
        100
    );
});

// 4. Ensure the Model understands the virtual definitions as well
const Product: Model<IProduct, {}, {}, IProductVirtuals> =
    (mongoose.models.Product as Model<IProduct, {}, {}, IProductVirtuals> | undefined) ||
    mongoose.model<IProduct, Model<IProduct, {}, {}, IProductVirtuals>>(
        "Product",
        productSchema
    );

export default Product;