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
    name: "JASPROJECT-GREEN",
    price: 1200,
    originalPrice: 1400,
    image: jasprojectGreen,
    discount: 14,
    description: [
      "- premium fleece zip-up hoodie",
      "- relaxed fit / heavyweight fabric",
      "- puff print logo",
      "- 100% cotton / 400 gsm"
    ],
    sizes: ["S", "M"],
    stock: 24
  },
  {
    id: "brown",
    name: "JASPROJECT-BROWN",
    price: 1200,
    originalPrice: 1400,
    image: jasprojectBrown,
    discount: 14,
    description: [
      "- premium fleece zip-up hoodie",
      "- relaxed fit / heavyweight fabric",
      "- puff print logo",
      "- 100% cotton / 400 gsm"
    ],
    sizes: ["S", "M"],
    stock: 18
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};
