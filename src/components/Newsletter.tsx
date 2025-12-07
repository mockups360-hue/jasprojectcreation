import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "You'll be the first to know about new collections.",
      });
      setEmail("");
    }
  };

  return (
    <section className="bg-charcoal text-primary-foreground py-16">
      <div className="container">
        <h2 className="font-display text-3xl md:text-4xl font-light mb-6">
          newsletter
        </h2>
        
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-transparent border border-primary-foreground/30 rounded-full px-5 py-3 text-sm font-body placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/60 transition-colors"
          />
          <button
            type="submit"
            className="p-3 border border-primary-foreground/30 rounded-full hover:bg-primary-foreground hover:text-charcoal transition-colors"
            aria-label="Subscribe"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <p className="font-body text-sm text-primary-foreground/70 max-w-md">
          Be the first to know about new collections and exclusive offers.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
