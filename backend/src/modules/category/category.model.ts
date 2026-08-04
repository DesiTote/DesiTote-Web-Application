import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        image: {
            type: String,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

/* INDEXES */

categorySchema.index({
    name: "text",
});

const Category =
    mongoose.models.Category ||
    mongoose.model(
        "Category",
        categorySchema
    );

export default Category;