import { Link } from "react-router-dom";
const categories = [{
  name: "all",
  count: 85,
  image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop"
}, {
  name: "tops",
  count: 50,
  image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&h=200&fit=crop"
}, {
  name: "bottoms",
  count: 27,
  image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop"
}, {
  name: "outerwear",
  count: 15,
  image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop"
}];
const Categories = () => {
  return <section className="container py-12">
      <h2 className="font-display text-3xl md:text-4xl font-light mb-8">
        product categories
      </h2>
      
      <div className="space-y-0">
        {categories.map((category, index) => {})}
        
        <Link to="/shop" className="block w-full py-4 mt-6 text-center border border-charcoal rounded-full font-body text-sm font-medium hover:bg-charcoal hover:text-primary-foreground transition-colors">
          shop all
        </Link>
      </div>
    </section>;
};
export default Categories;