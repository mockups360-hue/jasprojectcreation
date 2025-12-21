import jasprojectGreen from "@/assets/jasproject-green.png";
import jasprojectBrown from "@/assets/jasproject-brown.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
  soldOut?: boolean;
  description: string[];
  sizes: string[];
  stock: number;
}

export const products: Product[] = [
  {
    id: "green",
    name: "TERRA EVERBLUE - GREEN ZIP-UP JACKET",
    price: 1100,
    image: jasprojectGreen,
    description: [
      "-Premium fleece zip-up",
      "-Slightly cropped silhouette",
      "-Detailed stitching throughout",
      "-Printed logo detail",
      "-Unisex fit"
    ],
    sizes: ["S/M", "L/XL"],
    stock: 24
  },
  {
    id: "brown",
    name: "TERRA ROSETTA - BROWN ZIP-UP JACKET",
    price: 1100,
    image: jasprojectBrown,
    description: [
      "-Premium fleece zip-up",
      "-Slightly cropped silhouette",
      "-Detailed stitching throughout",
      "-Printed logo detail",
      "-Unisex fit"
    ],
    sizes: ["S/M", "L/XL"],
    stock: 18
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};
