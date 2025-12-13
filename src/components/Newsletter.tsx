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
        description: "You'll be the first to know about new collections."
      });
      setEmail("");
    }
  };
  return <section className="bg-charcoal text-primary-foreground py-16">
      <div className="container">
        
        
        
        
        <p className="font-body text-sm text-primary-foreground/70 max-w-md">
          Be the first to know about new collections and exclusive offers.
        </p>
      </div>
    </section>;
};
export default Newsletter;