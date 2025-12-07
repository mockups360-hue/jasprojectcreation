import { Link } from "react-router-dom";

const categories = [
  { name: "all", count: 85, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop" },
  { name: "tops", count: 50, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&h=200&fit=crop" },
  { name: "bottoms", count: 27, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop" },
  { name: "outerwear", count: 15, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop" },
];

const Categories = () => {
  return (
    <section className="container py-12">
      <h2 className="font-display text-3xl md:text-4xl font-light mb-8">
        product categories
      </h2>
      
      <div className="space-y-0">
        {categories.map((category, index) => (
          <Link
            key={category.name}
            to={`/shop?category=${category.name}`}
            className="group flex items-center justify-between py-6 border-t border-border/50 hover:bg-secondary/50 transition-colors px-2 -mx-2"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-4">
              <span className="font-body text-lg font-medium">{category.name}</span>
              <span className="font-body text-sm text-muted-foreground">{category.count.toString().padStart(2, '0')}</span>
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden">
              <img 
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        ))}
        
        <Link
          to="/shop"
          className="block w-full py-4 mt-6 text-center border border-charcoal rounded-full font-body text-sm font-medium hover:bg-charcoal hover:text-primary-foreground transition-colors"
        >
          shop all
        </Link>
      </div>
    </section>
  );
};

export default Categories;
