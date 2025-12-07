import ProductCard from "./ProductCard";

const products = [
  {
    id: "1",
    name: "Charcoal Waffle Set",
    price: 890,
    originalPrice: 960,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop",
    discount: 7,
  },
  {
    id: "2",
    name: "Espresso Suede Blazer",
    price: 2200,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop",
    soldOut: true,
  },
  {
    id: "3",
    name: "Marshmallow Button-up Waffle",
    price: 480,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop",
  },
  {
    id: "4",
    name: "Espresso Waffle Set",
    price: 480,
    originalPrice: 520,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
    discount: 7,
  },
  {
    id: "5",
    name: "Midnight Mini Trench",
    price: 1200,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop",
    soldOut: true,
  },
  {
    id: "6",
    name: "Sand Mini Trench",
    price: 1200,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop",
  },
];

const FeaturedProducts = () => {
  return (
    <section className="container py-12">
      {/* Marquee Banner */}
      <div className="bg-charcoal text-primary-foreground py-3 -mx-4 md:-mx-8 mb-8 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8 font-display text-lg tracking-wide">
              #JASPROJECT
            </span>
          ))}
        </div>
      </div>

      <h2 className="font-display text-3xl md:text-4xl font-light mb-8">
        featured products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
